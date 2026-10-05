import { Link } from "react-router-dom";
import { PiggyBank, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

interface SavingsGoalCardProps {
  goal: { name: string; target: number; saved: number } | null;
  /** Defaults to "Manage" → /savings. */
  manageAction?: { label: string; to: string };
}

export default function SavingsGoalCard({
  goal,
  manageAction = { label: "Manage", to: "/savings" },
}: SavingsGoalCardProps) {
  if (!goal) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-background p-6 text-center">
        <PiggyBank className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You haven&apos;t set a savings goal yet.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link to="/savings">Set a goal</Link>
        </Button>
      </div>
    );
  }

  // Round down — never friendly-round a financial figure.
  const remaining = Math.max(goal.target - goal.saved, 0);
  const percent =
    goal.target > 0
      ? Math.min(Math.floor((goal.saved / goal.target) * 100), 100)
      : 0;

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Your savings goal</p>
        <Link
          to={manageAction.to}
          className="shrink-0 text-sm font-medium text-primary transition-colors hover:underline"
        >
          {manageAction.label} →
        </Link>
      </div>

      <h3 className="mt-3 text-lg font-semibold">
        {goal.name} · {formatNaira(goal.target)}
      </h3>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums">{percent}%</span>
      </div>

      <div className="mt-3 flex justify-between gap-4 text-sm">
        <span>
          Saved so far:{" "}
          <span className="font-medium tabular-nums">
            {formatNaira(goal.saved)}
          </span>
        </span>
        <span className="text-muted-foreground tabular-nums">
          {formatNaira(remaining)} to go
        </span>
      </div>

      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link to="/savings/add">
          <Plus className="size-4" />
          Add to savings
        </Link>
      </Button>
    </div>
  );
}
