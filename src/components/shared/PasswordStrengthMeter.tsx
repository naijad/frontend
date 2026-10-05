import { cn } from "@/lib/utils";
import { scorePassword } from "@/lib/password";

type PasswordStrengthMeterProps = {
  password: string;
};

const BAR_TONE: Record<number, string> = {
  0: "bg-danger",
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-info",
  4: "bg-success",
};

const TEXT_TONE: Record<number, string> = {
  0: "text-danger",
  1: "text-danger",
  2: "text-warning",
  3: "text-info",
  4: "text-success",
};

export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, hint } = scorePassword(password);
  const filled = Math.max(score, 1);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < filled ? BAR_TONE[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className={cn("mt-2 text-xs font-medium", TEXT_TONE[score])}>{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
