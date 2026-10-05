import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorCardProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-danger/20 bg-background p-6 text-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="size-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
