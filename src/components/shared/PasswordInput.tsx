import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Shown below the field. */
  error?: string;
  /** Only true on the "new password" field. */
  showStrengthMeter?: boolean;
  autoComplete?: "current-password" | "new-password" | "off";
  disabled?: boolean;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  error,
  showStrengthMeter = false,
  autoComplete = "off",
  disabled,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn("pr-10", error && "border-danger")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}

      {showStrengthMeter ? <PasswordStrengthMeter password={value} /> : null}
    </div>
  );
}
