import {
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  Smartphone,
  Zap,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNaira, formatTransactionTime } from "@/lib/format";
import type { Transaction } from "@/lib/mock-data";
import { toneClass, type Tone } from "@/components/shared/tones";

const typeMeta: Record<
  Transaction["type"],
  { icon: LucideIcon; tone: Tone; positive: boolean }
> = {
  received: { icon: ArrowDownLeft, tone: "success", positive: true },
  topup: { icon: Plus, tone: "success", positive: true },
  sent: { icon: ArrowUpRight, tone: "primary", positive: false },
  airtime: { icon: Phone, tone: "info", positive: false },
  data: { icon: Smartphone, tone: "success", positive: false },
  bill: { icon: Zap, tone: "warning", positive: false },
};

const statusLabel: Record<
  NonNullable<Transaction["status"]>,
  string | null
> = {
  completed: null,
  pending: "Pending",
  failed: "Failed",
};

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

export default function TransactionRow({
  transaction,
  onClick,
}: TransactionRowProps) {
  const { icon: Icon, tone, positive } = typeMeta[transaction.type];
  const badge = transaction.status ? statusLabel[transaction.status] : null;
  const sign = positive ? "+" : "−";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            toneClass[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {transaction.counterparty}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatTransactionTime(transaction.timestamp)}
            {badge ? (
              <span
                className={cn(
                  "ml-2 font-medium",
                  transaction.status === "failed"
                    ? "text-danger"
                    : "text-warning",
                )}
              >
                {badge}
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          positive ? "text-success" : "text-foreground",
        )}
      >
        {sign}
        {formatNaira(Math.abs(transaction.amount))}
      </span>
    </button>
  );
}
