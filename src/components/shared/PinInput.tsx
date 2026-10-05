import { useEffect, useRef, type ChangeEvent } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type PinInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  /** Show dots instead of digits. Default true. */
  mask?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
};

export default function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  error = false,
  mask = true,
  autoFocus = true,
  disabled = false,
}: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && !disabled) inputRef.current?.focus();
  }, [autoFocus, disabled]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <motion.div
      className="relative flex justify-center gap-3"
      animate={error ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        aria-label={`${length}-digit PIN input`}
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />

      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const active =
          !disabled && i === value.length && value.length < length;

        return (
          <div
            key={i}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-semibold transition-colors md:h-14 md:w-14",
              error
                ? "border-danger"
                : active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border",
              disabled && "opacity-50",
            )}
          >
            {filled ? (
              mask ? (
                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
              ) : (
                <span>{value[i]}</span>
              )
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
