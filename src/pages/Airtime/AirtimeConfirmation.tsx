
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { formatNaira } from "@/lib/format";

type AirtimeConfirmationState = {
  network: string;
  networkName: string;
  phone: string;
  displayPhone: string;
  amount: number;
  fee: number;
  total: number;
};

function maskPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length >= 10) {
    return `${digits.slice(0, 4)}****${digits.slice(-3)}`;
  }

  return phone;
}

export default function AirtimeConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    location.state as AirtimeConfirmationState | null;

  if (!state) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold">
            Airtime details unavailable
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Please start the airtime purchase again.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/airtime", { replace: true })
            }
            className="mt-7 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to Airtime
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    navigate("/airtime/pin", { state });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-background px-4 pb-10 pt-6 text-foreground">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold">
            Confirm Airtime
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your recharge details
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              Network
            </p>
            <p className="mt-1 text-base font-bold">
              {state.networkName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {maskPhoneNumber(
                state.displayPhone || state.phone
              )}
            </p>
          </div>

          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
        </div>

        <div className="my-6 border-t border-border" />

        {/* Amount breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Airtime amount
            </span>
            <span className="text-sm font-semibold">
              {formatNaira(state.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Service fee
            </span>
            <span className="text-sm font-semibold">
              {formatNaira(state.fee)}
            </span>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">
                {formatNaira(state.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="mt-5 rounded-3xl border border-border bg-card p-5 text-card-foreground">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Secure transaction
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              You will be asked to enter your transaction PIN
              before this airtime purchase is processed.
            </p>
          </div>
        </div>
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={handleContinue}
        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Continue
        <ChevronRight className="ml-2 h-5 w-5" />
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Review the recipient and amount carefully before continuing.
      </p>
    </div>
  );
}

