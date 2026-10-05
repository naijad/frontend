import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Download,
  FileX,
  Receipt,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/format";
import { buildReceiptText } from "@/lib/receipt";
import {
  formatAjoraPhone,
  isCompletedTransfer,
  maskAccount,
} from "@/lib/transfer";
import { Button } from "@/components/ui/button";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";
import EmptyState from "@/components/shared/EmptyState";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

export default function TransferSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const payload = isCompletedTransfer(state) ? state : null;

  if (!payload) {
    return (
      <FlowShell showBrand>
        <EmptyState
          icon={FileX}
          heading="Transfer not found"
          body="This receipt is no longer available. You can find the record in your transactions."
          action={{
            label: "Back to dashboard",
            onClick: () => navigate("/dashboard"),
          }}
        />
      </FlowShell>
    );
  }

  const { recipient, amount, fee, total, reference, timestamp } = payload;
  const when = new Date(timestamp);
  const dateStr = when.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = when.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const methodLine =
    recipient.method === "bank"
      ? `${recipient.bankName} · ${maskAccount(recipient.accountNumber)}`
      : `Ajora user · ${formatAjoraPhone(recipient.ajoraPhone)}`;

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Reference copied.");
    } catch {
      toast.error("Couldn't copy — try again.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([buildReceiptText(payload)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ajora-receipt-${reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = buildReceiptText(payload);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ajora Transfer Receipt", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Receipt copied to clipboard.");
      }
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  return (
    <FlowShell showBrand>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <FlowHero
          icon={CheckCircle2}
          iconColor="success"
          title="Money sent"
          description={`Your transfer to ${recipient.name} was successful.`}
          animated={false}
        />
      </motion.div>

      <motion.div className="mt-8 text-center" {...fade(0.5)}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Amount sent
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-primary sm:text-5xl">
          {formatNaira(amount)}
        </p>
      </motion.div>

      <motion.div
        className="mt-8 overflow-hidden rounded-xl border border-border"
        {...fade(0.6)}
      >
        <div className="flex items-start justify-between border-b border-dashed border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Payment receipt
            </p>
            <p className="mt-0.5 font-semibold">Transfer details</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Receipt className="size-4" />
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              {recipient.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{recipient.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {methodLine}
              </p>
            </div>
            <CheckCircle2 className="size-5 shrink-0 text-success" />
          </div>

          <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="tabular-nums">{formatNaira(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transfer fee</span>
              {fee === 0 ? (
                <span className="text-success">Free</span>
              ) : (
                <span className="tabular-nums">{formatNaira(fee)}</span>
              )}
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums text-primary">
                {formatNaira(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-border bg-muted/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reference
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-primary">
                {reference}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              aria-label="Copy reference"
              onClick={copyReference}
            >
              <Copy className="size-3.5" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </p>
              <p className="mt-0.5">{dateStr}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Time
              </p>
              <p className="mt-0.5">{timeStr}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-4 grid grid-cols-2 gap-3"
        {...fade(0.65)}
      >
        <Button variant="outline" onClick={handleDownload}>
          <Download className="size-4" />
          Download receipt
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="size-4" />
          Share receipt
        </Button>
      </motion.div>

      <motion.div className="mt-8 space-y-3" {...fade(0.7)}>
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          Back to dashboard
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate("/transactions", { replace: true })}
        >
          View transactions
        </Button>
      </motion.div>
    </FlowShell>
  );
}
