import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PeriodSwitcherProps = {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
};

const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export default function PeriodSwitcher({
  value,
  onChange,
  minDate,
  maxDate,
}: PeriodSwitcherProps) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const max = monthStart(maxDate ?? now);
  const min = monthStart(
    minDate ?? new Date(now.getFullYear(), now.getMonth() - 11, 1),
  );
  const current = monthStart(value);

  const canPrev = current > min;
  const canNext = current < max;

  const shift = (delta: number) => {
    const next = new Date(
      current.getFullYear(),
      current.getMonth() + delta,
      1,
    );
    if (next >= min && next <= max) onChange(next);
  };

  const options: Date[] = [];
  for (
    let d = new Date(min);
    d <= max;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    options.push(new Date(d));
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous month"
        disabled={!canPrev}
        onClick={() => shift(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-40 justify-center font-medium">
            {current.toLocaleDateString("en-NG", {
              month: "long",
              year: "numeric",
            })}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="grid grid-cols-3 gap-1.5">
            {options.map((opt) => (
              <Button
                key={`${opt.getFullYear()}-${opt.getMonth()}`}
                variant={sameMonth(opt, current) ? "default" : "ghost"}
                size="sm"
                className={cn("text-xs", !sameMonth(opt, current) && "font-normal")}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt.toLocaleDateString("en-NG", {
                  month: "short",
                  year: "2-digit",
                })}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Next month"
        disabled={!canNext}
        onClick={() => shift(1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
