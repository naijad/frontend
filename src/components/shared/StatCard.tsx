import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  /** Already formatted, e.g. "₦42,500.00". */
  value: string;
  /** Extra classes for the value text, e.g. "text-success" / "text-primary". */
  valueClassName?: string;
  trend?: { direction: "up" | "down"; value: string };
  /** Optional small sparkline / bar chart. */
  chart?: ReactNode;
  action?: { label: string; to: string };
  /** Tighter padding + type for dense rows (e.g. a mobile summary strip). */
  compact?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  valueClassName,
  trend,
  chart,
  action,
  compact = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-background",
        compact ? "p-4" : "p-6",
        className,
      )}
    >
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p
          className={cn(
            "font-bold tabular-nums whitespace-nowrap",
            compact ? "text-lg" : "text-2xl",
            valueClassName,
          )}
        >
          {value}
        </p>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-medium",
              trend.direction === "up" ? "text-success" : "text-danger",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
        ) : null}
      </div>

      {chart ? <div className="mt-4">{chart}</div> : null}

      {action ? (
        <Link
          to={action.to}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
        >
          {action.label}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
