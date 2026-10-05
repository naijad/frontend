import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  body?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
}

export default function EmptyState({
  icon: Icon,
  heading,
  body,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Icon className="size-15 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="text-base font-semibold">{heading}</h3>
      {body ? (
        <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      ) : null}
      {action ? (
        <Button
          variant={action.variant ?? "default"}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
