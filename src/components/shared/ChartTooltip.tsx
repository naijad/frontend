import { formatNaira } from "@/lib/format";

type TooltipEntry = {
  name?: string | number;
  value?: number;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
};

export default function ChartTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-background p-3 text-sm shadow-md">
      {label != null && label !== "" ? (
        <div className="font-semibold text-foreground">{label}</div>
      ) : null}
      {payload.map((entry) => (
        <div key={String(entry.name)} className="mt-1 flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatNaira(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}
