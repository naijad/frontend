
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../lib/api";

type VerifyResponse = {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    status: string;
    amount?: string | number;
    alreadyCredited?: boolean;
  };
};

type VerificationState = "verifying" | "success" | "pending" | "error";

function formatNaira(value: number | string): string {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function DepositSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");
  const retry = searchParams.get("retry") || "0";

  const [verification, setVerification] =
    useState<VerificationState>("verifying");
  const [verificationMessage, setVerificationMessage] = useState(
    "Confirming your payment securely with Ajora's server..."
  );
  const [verifiedAmount, setVerifiedAmount] = useState<
    string | number | null
  >(null);

  const verifyPayment = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!reference) {
        setVerification("error");
        setVerificationMessage(
          "No payment reference was provided. We cannot verify this deposit."
        );
        return;
      }

      setVerification("verifying");
      setVerificationMessage(
        "Confirming your payment securely with Ajora's server..."
      );

      try {
        const result = await apiRequest<VerifyResponse>(
          `/transactions/deposit/verify?reference=${encodeURIComponent(
            reference
          )}`,
          { method: "GET" }
        );

        if (signal.cancelled) return;

        if (result.success && result.data?.status === "COMPLETED") {
          setVerification("success");
          setVerificationMessage(
            result.message || "Your deposit has been confirmed."
          );
          setVerifiedAmount(result.data.amount ?? null);
          toast.success("Wallet funding successful.");
          return;
        }

        const status = result.data?.status?.toUpperCase();

        if (
          status === "PENDING" ||
          status === "PROCESSING" ||
          status === "ONGOING"
        ) {
          setVerification("pending");
          setVerificationMessage(
            result.message ||
              "Your payment is still being processed. Please check again shortly."
          );
          return;
        }

        setVerification("error");
        setVerificationMessage(
          result.message ||
            "We could not confirm this payment. You can retry verification."
        );
      } catch (error) {
        if (signal.cancelled) return;

        setVerification("error");
        setVerificationMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed. Please try again."
        );
      }
    },
    [reference]
  );

  useEffect(() => {
    const signal = { cancelled: false };

    void verifyPayment(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [verifyPayment, retry]);

  function retryVerification() {
    if (!reference) {
      navigate("/add-money", { replace: true });
      return;
    }

    const nextRetry = String(Number(retry) + 1);

    navigate(
      `/deposit-success?reference=${encodeURIComponent(
        reference
      )}&retry=${nextRetry}`,
      { replace: true }
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-10">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Deposit status
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your Ajora wallet funding
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#151522]">
        <div className="flex flex-col items-center px-5 py-9 text-center sm:px-8">
          {verification === "verifying" && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15">
                <LoaderCircle
                  size={38}
                  className="animate-spin text-violet-600 dark:text-violet-300"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                Verifying payment
              </h2>

              <p
                aria-live="polite"
                className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400"
              >
                {verificationMessage}
              </p>
            </>
          )}

          {verification === "success" && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <CheckCircle2
                  size={42}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                Deposit successful!
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                {verificationMessage}
              </p>

              {verifiedAmount !== null && (
                <div className="mt-6 w-full max-w-sm rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-500/10">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Amount verified
                  </p>
                  <p className="mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                    {formatNaira(verifiedAmount)}
                  </p>
                </div>
              )}

              <div className="mt-7 flex w-full max-w-sm flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-700"
                >
                  Return to dashboard
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  View transactions
                </button>
              </div>
            </>
          )}

          {verification === "pending" && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <Clock3
                  size={40}
                  className="text-amber-600 dark:text-amber-300"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                Payment processing
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                {verificationMessage}
              </p>

              <p className="mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
                If your account has already been charged, avoid making another
                deposit for the same amount while this payment is pending.
              </p>

              <button
                type="button"
                onClick={retryVerification}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                Check payment again
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {verification === "error" && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <XCircle
                  size={40}
                  className="text-amber-600 dark:text-amber-300"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                Payment not confirmed
              </h2>

              <p
                aria-live="polite"
                className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400"
              >
                {verificationMessage}
              </p>

              <p className="mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
                If you were charged, do not immediately pay again. Retry
                verification or contact support with your payment reference.
              </p>

              <button
                type="button"
                onClick={retryVerification}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                Retry verification
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/add-money")}
                className="mt-3 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                Back to Add Money
              </button>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-300"
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Secure payment verification
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ajora checks your transaction with the backend. This page
                cannot credit your wallet by itself.
              </p>

              {reference && (
                <p className="mt-3 break-all text-xs text-gray-500 dark:text-gray-400">
                  Reference: {reference}
                </p>
              )}
            </div>

            <Wallet
              size={21}
              className="shrink-0 text-gray-400"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
