
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CircleAlert,
  Database,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { DataPurchaseState } from "./DataConfirmation";

type PurchaseRouteState = DataPurchaseState & {
  pin: string;
};

type DataTransaction = {
  id?: string;
  reference?: string;
  status?: string;
  amount?: number | string;
  createdAt?: string;
  updatedAt?: string;
  balanceAfter?: number | string;
};

type DataApiResult = {
  success?: boolean;
  message?: string;
  status?: string;
  reference?: string;
  transactionReference?: string;
  transaction?: DataTransaction;
  account?: {
    accountNumber?: string;
    balance?: number | string;
    currency?: string;
  };
  balance?: number | string;
  data?: DataApiResult;
  balanceAfter?: number | string;
  [key: string]: unknown;
};

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: DataApiResult;
};

type ScreenStatus = "processing" | "pending" | "failed";

const POLL_INTERVAL_MS = 15_000;

const SUCCESS_STATUSES = [
  "COMPLETED",
  "SUCCESS",
  "SUCCESSFUL",
];

const FAILURE_STATUSES = [
  "FAILED",
  "FAILURE",
  "REVERSED",
  "CANCELLED",
];

function getStatus(result: DataApiResult): string {
  return String(
    result.status ??
      result.transaction?.status ??
      result.data?.status ??
      result.data?.transaction?.status ??
      "",
  )
    .trim()
    .toUpperCase();
}

function getReference(result: DataApiResult): string {
  return String(
    result.reference ??
      result.transactionReference ??
      result.transaction?.reference ??
      result.data?.reference ??
      result.data?.transactionReference ??
      result.data?.transaction?.reference ??
      "",
  ).trim();
}

function normalizeResult(result: DataApiResult): DataApiResult {
  const nested = result.data;

  return {
    ...result,
    status: getStatus(result),
    reference: getReference(result),
    transaction: result.transaction ?? nested?.transaction,
    account: result.account ?? nested?.account,
  };
}

export default function DataProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const purchase = location.state as PurchaseRouteState | null;

  const startedRef = useRef(false);
  const pollingRef = useRef(false);

  const [screenStatus, setScreenStatus] =
    useState<ScreenStatus>("processing");

  const [message, setMessage] = useState(
    "Submitting your data purchase securely.",
  );

  const [result, setResult] = useState<DataApiResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isValidPurchase =
    !!purchase &&
    !!purchase.network &&
    !!purchase.phone &&
    !!purchase.variationCode &&
    !!purchase.bundleName &&
    /^\d{4}$/.test(purchase.pin ?? "") &&
    Number.isFinite(Number(purchase.total)) &&
    Number(purchase.total) > 0;

  const reference = result ? getReference(result) : "";

  const goToSuccess = useCallback(
    (purchaseResult: DataApiResult) => {
      if (!purchase) return;

      navigate("/data/success", {
        replace: true,
        state: {
          purchase: {
            network: purchase.network,
            networkName: purchase.networkName,
            phone: purchase.phone,
            displayPhone: purchase.displayPhone,
            bundleId: purchase.bundleId,
            variationCode: purchase.variationCode,
            bundleName: purchase.bundleName,
            validity: purchase.validity,
            amount: purchase.amount,
            fee: purchase.fee,
            total: purchase.total,
          },
          result: normalizeResult(purchaseResult),
        },
      });
    },
    [navigate, purchase],
  );

  // Submit the purchase only once per mounted processing screen.
  useEffect(() => {
    if (!isValidPurchase || !purchase) {
      navigate("/data", { replace: true });
      return;
    }

    if (startedRef.current) return;

    startedRef.current = true;
    let cancelled = false;

    async function submitPurchase() {
      try {
        const response = await apiRequest<ApiEnvelope>(
          "/data/purchase",
          {
            method: "POST",
            body: JSON.stringify({
              network: purchase!.network,
              phone: purchase!.phone,
              variationCode: purchase!.variationCode,
              pin: purchase!.pin,
            }),
          },
        );

        if (cancelled) return;

        const purchaseResult = response.data;

        if (!purchaseResult) {
          setScreenStatus("pending");
          setMessage(
            response.message ||
              "The server did not return a purchase result. Check your transaction history before trying again.",
          );
          return;
        }

        setResult(purchaseResult);

        const status = getStatus(purchaseResult);

        if (SUCCESS_STATUSES.includes(status)) {
          setMessage(
            purchaseResult.message ||
              "Data purchase completed successfully.",
          );
          goToSuccess(purchaseResult);
          return;
        }

        if (FAILURE_STATUSES.includes(status)) {
          setScreenStatus("failed");
          setMessage(
            purchaseResult.message ||
              "The provider reported that this data purchase failed. Check your transaction history.",
          );
          return;
        }

        setScreenStatus("pending");
        setMessage(
          purchaseResult.message ||
            "Your request has been received, but the provider has not confirmed the result yet.",
        );
      } catch (error) {
        if (cancelled) return;

        // A network error does not prove the provider failed.
        // Do not encourage another purchase when the result is unknown.
        setScreenStatus("pending");
        setMessage(
          error instanceof Error
            ? `${error.message} Your purchase may still be processing. Check its status before trying again.`
            : "We couldn't confirm the purchase result. Your transaction may still be processing.",
        );
      }
    }

    void submitPurchase();

    return () => {
      cancelled = true;
    };
  }, [isValidPurchase, navigate, purchase, goToSuccess]);

  // Automatically requery while this processing screen remains open.
  // Requery checks the existing provider request; it never submits another
  // data purchase. The backend remains responsible for final status/refunds.
  useEffect(() => {
    if (
      screenStatus !== "pending" ||
      !reference ||
      !purchase
    ) {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    async function pollTransactionStatus() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await apiRequest<ApiEnvelope>(
          `/data/requery/${encodeURIComponent(reference)}`,
          { method: "POST" },
        );

        if (cancelled) return;

        const updated = response.data;

        if (!updated) return;

        setResult(updated);

        const status = getStatus(updated);

        if (SUCCESS_STATUSES.includes(status)) {
          setScreenStatus("processing");
          setMessage(
            updated.message ||
              "Data purchase completed successfully.",
          );
          goToSuccess(updated);
          return;
        }

        if (FAILURE_STATUSES.includes(status)) {
          setScreenStatus("failed");
          setMessage(
            updated.message ||
              "The provider confirmed that this purchase failed. Check your wallet balance and transaction history for the refund.",
          );
          return;
        }

        setMessage(
          updated.message ||
            "Your data purchase is still awaiting confirmation. We'll check again automatically.",
        );
      } catch {
        // A failed status check is not proof that the purchase failed.
        // Keep the pending state and try again at the next interval.
      } finally {
        inFlight = false;
      }
    }

    const intervalId = window.setInterval(() => {
      void pollTransactionStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [screenStatus, reference, purchase, goToSuccess]);

  async function checkStatus() {
    if (!reference || checkingStatus || pollingRef.current || !purchase) {
      return;
    }

    pollingRef.current = true;
    setCheckingStatus(true);

    try {
      const response = await apiRequest<ApiEnvelope>(
        `/data/requery/${encodeURIComponent(reference)}`,
        { method: "POST" },
      );

      const updated = response.data;

      if (!updated) {
        setMessage(
          response.message ||
            "The server did not return an updated status.",
        );
        return;
      }

      setResult(updated);

      const status = getStatus(updated);

      if (SUCCESS_STATUSES.includes(status)) {
        setMessage(
          updated.message ||
            "Data purchase completed successfully.",
        );
        goToSuccess(updated);
        return;
      }

      if (FAILURE_STATUSES.includes(status)) {
        setScreenStatus("failed");
        setMessage(
          updated.message ||
            "The provider confirmed that this purchase failed. Check your wallet balance and transaction history for the refund.",
        );
        return;
      }

      setScreenStatus("pending");
      setMessage(
        updated.message ||
          "The transaction is still awaiting provider confirmation. We'll check again automatically.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to check the transaction status right now.",
      );
    } finally {
      pollingRef.current = false;
      setCheckingStatus(false);
    }
  }

  if (!isValidPurchase || !purchase) return null;

  const isProcessing = screenStatus === "processing";
  const isPending = screenStatus === "pending";
  const isFailed = screenStatus === "failed";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-[#0D0D16] dark:text-white sm:px-6">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => navigate("/data")}
          disabled={isProcessing}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-violet-600 disabled:opacity-50 dark:text-gray-400 dark:hover:text-violet-400"
        >
          <ArrowLeft size={18} />
          Back to data
        </button>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#151522] sm:p-8">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
              isFailed
                ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                : isPending
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
                  : "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
            }`}
          >
            {isProcessing && (
              <LoaderCircle size={30} className="animate-spin" />
            )}
            {isPending && <RefreshCw size={30} />}
            {isFailed && <CircleAlert size={30} />}
          </div>

          <h1 className="mt-5 text-xl font-bold">
            {isProcessing
              ? "Processing data purchase"
              : isPending
                ? "Awaiting confirmation"
                : "Purchase not confirmed"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {message}
          </p>

          <div className="mt-6 space-y-4 rounded-xl border border-gray-200 p-4 text-left dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Database size={22} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold">
                  {purchase.networkName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {purchase.bundleName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {purchase.displayPhone}
                </p>
              </div>

              <p className="ml-auto shrink-0 font-semibold">
                ₦{Number(purchase.total).toLocaleString("en-NG")}
              </p>
            </div>

            {reference && (
              <div className="border-t border-gray-200 pt-3 text-sm dark:border-white/10">
                <p className="text-gray-500 dark:text-gray-400">
                  Transaction reference
                </p>
                <p className="mt-1 break-all font-medium">
                  {reference}
                </p>
              </div>
            )}
          </div>

          {isProcessing && (
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck size={16} />
              Please keep this page open while we submit your request.
            </p>
          )}

          {isPending && (
            <>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                We'll check the transaction status automatically every
                15 seconds while this page remains open.
              </p>

              <Button
                type="button"
                className="mt-4 w-full"
                disabled={!reference || checkingStatus}
                onClick={checkStatus}
              >
                {checkingStatus
                  ? "Checking status..."
                  : "Check transaction status"}
              </Button>
            </>
          )}

          {isFailed && (
            <div className="mt-6 space-y-3">
              {reference && (
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  disabled={checkingStatus}
                  onClick={checkStatus}
                >
                  {checkingStatus
                    ? "Checking status..."
                    : "Check status again"}
                </Button>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={() => navigate("/transactions")}
              >
                View transaction history
              </Button>

              <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                Check your wallet balance and transaction history to
                confirm the refund before starting another purchase.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
