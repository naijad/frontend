import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileX,
  Receipt,
  Share2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/format";

type AirtimeSuccessState = {
  network: string;
  networkName: string;
  phone: string;
  displayPhone: string;
  amount: number;
  fee: number;
  total: number;
  reference: string;
  timestamp: string;
  status: string;
};

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 4)}••••${digits.slice(-3)}`;
  }

  if (digits.length === 13 && digits.startsWith("234")) {
    return `0${digits.slice(3, 6)}••••${digits.slice(-3)}`;
  }

  return phone;
}

export default function AirtimeSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as AirtimeSuccessState | null;

  const receiptText = useMemo(() => {
    if (!state) return "";

    return [
      "AJORA AIRTIME RECEIPT",
      "-------------------------",
      `Network: ${state.networkName}`,
      `Phone: ${state.displayPhone || state.phone}`,
      `Amount: ${formatNaira(state.amount)}`,
      `Service fee: ${
        state.fee === 0 ? "Free" : formatNaira(state.fee)
      }`,
      `Total: ${formatNaira(state.total)}`,
      `Reference: ${state.reference}`,
      `Date: ${formatDateTime(state.timestamp)}`,
      "Status: Successful",
      "-------------------------",
      "Thank you for using Ajora.",
    ].join("\n");
  }, [state]);

  if (!state) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4">
        <div className="w-full rounded-3xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <FileX className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="text-xl font-bold">
            Receipt unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We couldn't find the completed airtime transaction.
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 h-12 w-full rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(state.reference);
      toast.success("Reference copied");
    } catch {
      toast.error("Unable to copy reference");
    }
  };

  const downloadReceipt = () => {
    const blob = new Blob([receiptText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ajora-airtime-${state.reference}.txt`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded");
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ajora Airtime Receipt",
          text: receiptText,
        });

        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(receiptText);
      toast.success("Receipt copied to clipboard");
    } catch {
      toast.error("Unable to share receipt");
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:opacity-80"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Airtime Receipt
          </h1>

          <p className="text-sm text-muted-foreground">
            Transaction completed successfully
          </p>
        </div>
      </div>

      {/* Success hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border bg-card p-6 text-center shadow-sm"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-11 w-11 text-green-500" />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Airtime purchase successful
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          {formatNaira(state.total)}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {state.networkName}
        </p>
      </motion.div>

      {/* Transaction details */}
      <div className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-bold">
              Transaction details
            </h2>

            <p className="text-xs text-muted-foreground">
              Airtime recharge
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Network
            </span>

            <span className="text-sm font-semibold">
              {state.networkName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Phone number
            </span>

            <span className="text-sm font-semibold">
              {maskPhone(
                state.displayPhone || state.phone,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Airtime
            </span>

            <span className="text-sm font-semibold">
              {formatNaira(state.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Service fee
            </span>

            <span className="text-sm font-semibold text-primary">
              {state.fee === 0
                ? "Free"
                : formatNaira(state.fee)}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-bold">
                {formatNaira(state.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Transaction reference
            </p>

            <p className="mt-1 break-all text-sm font-semibold">
              {state.reference}
            </p>
          </div>

          <button
            type="button"
            onClick={copyReference}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted transition hover:opacity-80"
            aria-label="Copy transaction reference"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Date & time
          </p>

          <p className="mt-1 text-sm font-medium">
            {formatDateTime(state.timestamp)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={downloadReceipt}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card text-sm font-semibold transition hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Download
        </button>

        <button
          type="button"
          onClick={shareReceipt}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card text-sm font-semibold transition hover:bg-muted"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Security */}
      <div className="mt-5 flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

        <p className="text-xs leading-5 text-muted-foreground">
          Your airtime recharge has been recorded. You can find
          this transaction in your Ajora transaction history.
        </p>
      </div>

      {/* Dashboard */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mt-6 h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Back to Dashboard
      </button>

      {/* Transactions */}
      <button
        type="button"
        onClick={() => navigate("/transactions")}
        className="mt-3 h-12 w-full rounded-2xl text-sm font-semibold text-muted-foreground transition hover:bg-muted"
      >
        View Transactions
      </button>
    </div>
  );
}