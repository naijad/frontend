
import { useEffect, useRef, useState } from "react";
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

type DataApiResult = {
  success?: boolean;
  message?: string;
  status?: string;
  reference?: string;
  transactionReference?: string;
  transaction?: {
    id?: string;
    reference?: string;
    status?: string;
    amount?: number | string;
    createdAt?: string;
    balanceAfter?: number | string;
  };
  balanceAfter?: number | string;
  [key: string]: unknown;
};

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: DataApiResult;
};

type ScreenStatus = "processing" | "pending" | "failed";

function getStatus(result: DataApiResult): string {
  return String(
    result.status ?? result.transaction?.status ?? "",
  ).trim().toUpperCase();
}

function getReference(result: DataApiResult): string {
  return String(
    result.reference ??
      result.transactionReference ??
      result.transaction?.reference ??
      "",
  ).trim();
}

export default function DataProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const purchase = location.state as PurchaseRouteState | null;

  const startedRef = useRef(false);
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

  useEffect(() => {
    if (!isValidPurchase) {
      navigate("/data", { replace: true });
      return;
    }

    if (startedRef.current || !purchase) return;
    startedRef.current = true;

    let cancelled = false;

    async function submitPurchase() {
      try {
        const response = await apiRequest<ApiEnvelope>("/data/purchase", {
          method: "POST",
          body: JSON.stringify({
            network: purchase!.network,
            phone: purchase!.phone,
            variationCode: purchase!.variationCode,
            pin: purchase!.pin,
          }),
        });

        if (cancelled) return;

        const purchaseResult = response.data;

        if (!purchaseResult) {
          setScreenStatus("failed");
          setMessage(
            response.message ||
              "The server did not return a purchase result. Check your transaction history before trying again.",
          );
          return;
        }

        setResult(purchaseResult);

        const status = getStatus(purchaseResult);

        if (["COMPLETED", "SUCCESS", "SUCCESSFUL"].includes(status)) {
          navigate("/data/success", {
            replace: true,
            state: {
              purchase: {
                network: purchase!.network,
                networkName: purchase!.networkName,
                phone: purchase!.phone,
                displayPhone: purchase!.displayPhone,
                bundleId: purchase!.bundleId,
                variationCode: purchase!.variationCode,
                bundleName: purchase!.bundleName,
                validity: purchase!.validity,
                amount: purchase!.amount,
                fee: purchase!.fee,
                total: purchase!.total,
              },
              result: purchaseResult,
            },
          });
          return;
        }

        if (["FAILED", "FAILURE", "REVERSED", "CANCELLED"].includes(status)) {
          setScreenStatus("failed");
          setMessage(
            response.message ||
              "The provider did not complete this data purchase. Check your balance and transaction history.",
          );
          return;
        }

        setScreenStatus("pending");
        setMessage(
          response.message ||
            "Your request has been received, but the provider has not confirmed the result yet.",
        );
      } catch (error) {
        if (cancelled) return;

        setScreenStatus("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't confirm the purchase result. Check your transaction history before trying again.",
        );
      }
    }

    void submitPurchase();

    return () => {
      cancelled = true;
    };
  }, [isValidPurchase, navigate, purchase]);

  async function checkStatus() {
    if (!reference || checkingStatus) return;

    setCheckingStatus(true);

    try {
      const response = await apiRequest<ApiEnvelope>(
        `/data/requery/${encodeURIComponent(reference)}`,
        { method: "POST" },
      );

      const updated = response.data;

      if (!updated) {
        setMessage(
          response.message || "The server did not return an updated status.",
        );
        return;
      }

      setResult(updated);
      const status = getStatus(updated);

      if (["COMPLETED", "SUCCESS", "SUCCESSFUL"].includes(status)) {
        navigate("/data/success", {
          replace: true,
          state: {
            purchase: {
              network: purchase!.network,
              networkName: purchase!.networkName,
              phone: purchase!.phone,
              displayPhone: purchase!.displayPhone,
              bundleId: purchase!.bundleId,
              variationCode: purchase!.variationCode,
              bundleName: purchase!.bundleName,
              validity: purchase!.validity,
              amount: purchase!.amount,
              fee: purchase!.fee,
              total: purchase!.total,
            },
            result: updated,
          },
        });
        return;
      }

      if (["FAILED", "FAILURE", "REVERSED", "CANCELLED"].includes(status)) {
        setScreenStatus("failed");
        setMessage(
          response.message ||
            "The provider reports that this purchase was not completed.",
        );
        return;
      }

      setScreenStatus("pending");
      setMessage(
        response.message ||
          "The transaction is still awaiting provider confirmation. You can check again shortly.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to check the transaction status right now.",
      );
    } finally {
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
            {isProcessing && <LoaderCircle size={30} className="animate-spin" />}
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
                <p className="font-semibold">{purchase.networkName}</p>
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
                <p className="mt-1 break-all font-medium">{reference}</p>
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
            <Button
              type="button"
              className="mt-6 w-full"
              disabled={!reference || checkingStatus}
              onClick={checkStatus}
            >
              {checkingStatus ? "Checking status..." : "Check transaction status"}
            </Button>
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
                  {checkingStatus ? "Checking status..." : "Check status again"}
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
                If the result is uncertain, check your transaction history before
                starting another purchase.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
