
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  ShieldCheck,
  Smartphone,
  AlertCircle,
} from "lucide-react";

import { formatNaira } from "@/lib/format";
import { apiRequest } from "@/lib/api";

type AirtimeProcessingState = {
  network: string;
  networkName: string;
  phone: string;
  displayPhone: string;
  amount: number;
  fee: number;
  total: number;
  pin: string;
};

type AirtimePurchaseResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      type: string;
      status: string;
      direction: string;
      title: string;
      description: string | null;
      amount: string;
      fee: string;
      total: string;
      currency: string;
      recipientName: string | null;
      recipientAccount: string | null;
      createdAt: string;
      updatedAt: string;
    };
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    };
  };
};

export default function AirtimeProcessing() {
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    location.state as AirtimeProcessingState | null;

  const [message, setMessage] = useState(
    "Securely processing your recharge..."
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) {
      navigate("/airtime", { replace: true });
      return;
    }

    const airtimeState = state;
    let cancelled = false;

    async function processAirtime() {
      try {
        // Validate the PIN before sending the request.
        if (
          !airtimeState.pin ||
          !/^\d{4}$/.test(airtimeState.pin)
        ) {
          throw new Error(
            "Please enter your 4-digit transaction PIN."
          );
        }

        if (cancelled) return;

        setMessage("Verifying your transaction...");

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 700);
        });

        if (cancelled) return;

        setMessage("Checking your account balance...");

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 700);
        });

        if (cancelled) return;

        setMessage("Processing your airtime recharge...");

        // Actual backend request.
        const response =
          await apiRequest<AirtimePurchaseResponse>(
            "/airtime/purchase",
            {
              method: "POST",
              body: JSON.stringify({
                network: airtimeState.network,
                phone: airtimeState.phone,
                amount: airtimeState.amount,
                pin: airtimeState.pin,
              }),
            }
          );

        if (cancelled) return;

        const transaction = response.data.transaction;
        const account = response.data.account;

        setMessage("Airtime recharge completed successfully.");

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 500);
        });

        if (cancelled) return;

        navigate("/airtime/success", {
          replace: true,
          state: {
            ...airtimeState,
            reference: transaction.reference,
            timestamp: transaction.createdAt,
            status: transaction.status.toLowerCase(),
            amount: Number(transaction.amount),
            fee: Number(transaction.fee),
            total: Number(transaction.total),
            balanceAfter: Number(account.balance),
          },
        });
      } catch (err) {
        if (cancelled) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Airtime purchase failed.";

        setError(errorMessage);
        setMessage("");
      }
    }

    processAirtime();

    return () => {
      cancelled = true;
    };
  }, [navigate, state]);

  if (!state) {
    return null;
  }

  // Error screen.
  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold">
            Airtime purchase failed
          </h1>

          <p
            role="alert"
            className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground"
          >
            {error}
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-3">
            <button
              type="button"
              onClick={() =>
                navigate("/airtime", { replace: true })
              }
              className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard", { replace: true })
              }
              className="w-full rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing screen.
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full text-center">
        {/* Animated loader */}
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">
          Processing airtime
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        {/* Transaction details */}
        <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-border bg-card p-5 text-left text-card-foreground shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {state.networkName}
              </p>

              <p className="break-all text-xs text-muted-foreground">
                {state.displayPhone || state.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">
              Total amount
            </span>

            <span className="font-bold">
              {formatNaira(state.total)}
            </span>
          </div>
        </div>

        {/* Security notice */}
        <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          <span>Securely processed by Ajora</span>
        </div>
      </div>
    </div>
  );
}

