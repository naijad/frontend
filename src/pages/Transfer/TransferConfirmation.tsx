import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/format";
import {
  formatAjoraPhone,
  isTransferPayload,
  maskAccount,
} from "@/lib/transfer";
import { Button } from "@/components/ui/button";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";

export default function TransferConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const payload = isTransferPayload(state) ? state : null;

  useEffect(() => {
    if (!payload) {
      toast.error("Please start a new transfer.");
      navigate("/transfer", { replace: true });
    }
  }, [payload, navigate]);

  if (!payload) return null;

  const { recipient, amount, memo, fee, total } = payload;
  const methodLine =
    recipient.method === "bank"
      ? `${recipient.bankName} · ${maskAccount(recipient.accountNumber)}`
      : `Ajora user · ${formatAjoraPhone(recipient.ajoraPhone)}`;

  return (
    <FlowShell onBack={() => navigate("/transfer")}>
      <p className="mb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
        Step 1 of 3
      </p>

      <FlowHero
        icon={Send}
        iconColor="primary"
        title="Review your transfer"
        description="Double-check the details before authorizing."
      />

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">You&apos;re sending</p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-primary sm:text-5xl">
          {formatNaira(amount)}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-border p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {recipient.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{recipient.name}</p>
          <p className="truncate text-sm text-muted-foreground">{methodLine}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
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
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums text-primary">
            {formatNaira(total)}
          </span>
        </div>
      </div>

      {memo.trim() ? (
        <div className="mt-6">
          <p className="text-xs text-muted-foreground">Note</p>
          <div className="mt-1 rounded-lg bg-muted/50 p-3">
            <p className="text-sm italic text-foreground">{memo}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate("/transfer/pin", { state: payload })}
        >
          Authorize with PIN
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={() =>
            navigate("/transfer", { state: { editing: payload } })
          }
        >
          Edit transfer
        </Button>
      </div>
    </FlowShell>
  );
}
