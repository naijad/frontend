import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  /** Small muted note under the card. */
  description?: ReactNode;
  children: ReactNode;
}

export default function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section>
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
        {children}
      </div>
      {description ? (
        <p className="mt-2 px-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </section>
  );
}
