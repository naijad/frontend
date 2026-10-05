import type { ComponentProps, ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/shared/ErrorCard";
import EmptyState from "@/components/shared/EmptyState";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  /** Right-side action, e.g. a period label or link. */
  action?: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyStateProps?: ComponentProps<typeof EmptyState>;
  onRetry?: () => void;
  children: ReactNode;
};

/**
 * Consistent card shell for analytics charts, with the standard
 * loading / error / empty / success handling from CLAUDE.md.
 */
export default function ChartCard({
  title,
  subtitle,
  action,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyStateProps,
  onRetry,
  children,
}: ChartCardProps) {
  return (
    <Card className="h-full gap-0 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorCard message={error.message} onRetry={onRetry} />
        ) : isEmpty && emptyStateProps ? (
          <EmptyState {...emptyStateProps} />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
