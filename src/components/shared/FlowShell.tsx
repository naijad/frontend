import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type FlowShellProps = {
  /** Omit for no back button (e.g. processing / success). */
  onBack?: () => void;
  showBrand?: boolean;
  children: ReactNode;
};

/**
 * Full-viewport frame for the focused transfer flow — no sidebar, no bottom
 * nav. The `flow-shell` class opts the route out of the global mobile frame
 * (see `.landing-layout:has(.flow-shell)` in index.css).
 */
export default function FlowShell({
  onBack,
  showBrand = true,
  children,
}: FlowShellProps) {
  return (
    <div className="flow-shell relative min-h-screen bg-background text-foreground">
      {onBack ? (
        <div className="absolute left-0 top-0 p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </div>
      ) : null}

      {showBrand ? (
        <div className="flex justify-center pt-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-xs font-black text-primary-foreground dark:bg-primary">
              A
            </span>
            <span className="text-base font-bold tracking-tight">ajora</span>
          </Link>
        </div>
      ) : null}

      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">{children}</div>
    </div>
  );
}
