import type { ReactNode } from "react";

interface PageHeaderProps {
  heading: string;
  subheading?: string;
  /** Right-side action, e.g. a button or icon. */
  action?: ReactNode;
}

export default function PageHeader({
  heading,
  subheading,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {heading}
        </h1>
        {subheading ? (
          <p className="mt-1 text-muted-foreground">{subheading}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
