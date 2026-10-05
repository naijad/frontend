import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "@/components/shared/tones";

interface SettingsRowProps {
  icon?: LucideIcon;
  tone?: Tone;
  label: string;
  description?: ReactNode;
  /** Right-side element — a <Switch>, a pill, a value. Omit + pass onClick for a chevron. */
  control?: ReactNode;
  onClick?: () => void;
  /** Extra content rendered below the row, aligned under the label. */
  footer?: ReactNode;
}

export default function SettingsRow({
  icon: Icon,
  tone = "primary",
  label,
  description,
  control,
  onClick,
  footer,
}: SettingsRowProps) {
  const body = (
    <>
      {Icon ? (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            toneClass[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {control ? (
        <div className="shrink-0">{control}</div>
      ) : onClick ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </>
  );

  const row = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted"
    >
      {body}
    </button>
  ) : (
    <div className="flex items-center gap-3 p-4">{body}</div>
  );

  if (!footer) return row;

  return (
    <div>
      {row}
      <div className="px-4 pb-4 pl-16 text-xs text-muted-foreground">
        {footer}
      </div>
    </div>
  );
}
