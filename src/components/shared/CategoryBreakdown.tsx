import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { formatNairaShort } from "@/lib/format";
import { useThemeColors } from "@/hooks/useThemeColors";

type CategoryColor =
  | "info"
  | "success"
  | "warning"
  | "primary"
  | "accent"
  | "muted";

type CategoryBreakdownProps = {
  data: Array<{ category: string; amount: number; color: CategoryColor }>;
  total: number;
  onCategoryClick?: (category: string) => void;
};

export default function CategoryBreakdown({
  data,
  total,
  onCategoryClick,
}: CategoryBreakdownProps) {
  const c = useThemeColors();
  const colorFor = (key: CategoryColor): string =>
    ({
      info: c.info,
      success: c.success,
      warning: c.warning,
      primary: c.primary,
      accent: c.accent,
      muted: c.mutedForeground,
    })[key];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div className="relative mx-auto aspect-square w-44 shrink-0 lg:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 2 : 0}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.category} fill={colorFor(d.color)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-muted-foreground">Total spent</span>
          <span className="text-lg font-bold tabular-nums">
            {formatNairaShort(total)}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-0.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.amount / total) * 100) : 0;
          const inner = (
            <>
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: colorFor(d.color) }}
                />
                <span className="truncate">{d.category}</span>
              </span>
              <span className="shrink-0 text-sm tabular-nums">
                <span className="font-medium">
                  {formatNairaShort(d.amount)}
                </span>
                <span className="ml-2 text-muted-foreground">{pct}%</span>
              </span>
            </>
          );

          return onCategoryClick ? (
            <li key={d.category}>
              <button
                type="button"
                onClick={() => onCategoryClick(d.category)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
              >
                {inner}
              </button>
            </li>
          ) : (
            <li
              key={d.category}
              className={cn(
                "flex items-center justify-between gap-3 px-2 py-2",
              )}
            >
              {inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
