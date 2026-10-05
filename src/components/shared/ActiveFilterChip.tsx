import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ActiveFilterChipProps {
  /** The filter name, e.g. "Type". */
  label: string;
  /** The current value, e.g. "Received". */
  value: string;
  onRemove: () => void;
}

export default function ActiveFilterChip({
  label,
  value,
  onRemove,
}: ActiveFilterChipProps) {
  return (
    <Badge variant="secondary" className="h-auto gap-1 py-1 pr-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
