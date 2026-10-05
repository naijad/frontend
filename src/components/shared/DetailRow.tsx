import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  /** Adds a bottom border. Default true; set false on the last row. */
  bordered?: boolean;
}

export default function DetailRow({
  label,
  value,
  bordered = true,
}: DetailRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4",
        bordered && "border-b border-border",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
