import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PinFlowLayoutProps {
  step: number;
  totalSteps: number;
  heading: string;
  subheading: string;
  onBack: () => void;
  backLabel?: string;
  /** Input area + error message. */
  children: ReactNode;
  /** Small muted line rendered under the card. */
  footnote?: string;
}

export default function PinFlowLayout({
  step,
  totalSteps,
  heading,
  subheading,
  onBack,
  backLabel = "Back to Transaction PIN",
  children,
  footnote,
}: PinFlowLayoutProps) {
  return (
    <div className="mx-auto max-w-md">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ChevronLeft className="size-4" />
        {backLabel}
      </Button>

      <div className="mt-4 rounded-xl border border-border bg-background p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Step {step} of {totalSteps}
        </p>

        <div className="mt-3 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i < step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>

        <div className="mt-8">{children}</div>
      </div>

      {footnote ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
