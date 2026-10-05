import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "@/components/shared/tones";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  tone: Tone;
  to: string;
}

export default function QuickAction({
  icon: Icon,
  label,
  tone,
  to,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="flex min-w-0 flex-col items-center gap-2 text-center"
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5",
          toneClass[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </Link>
  );
}
