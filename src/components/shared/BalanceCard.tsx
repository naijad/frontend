import { Link } from "react-router-dom";
import {
  Copy,
  Eye,
  EyeOff,
  Plus,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

interface BalanceCardProps {
  balance: number;
  label?: string;
  variant?: "hero" | "compact";
  showActions?: boolean;
  accountNumber?: string;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

export default function BalanceCard({
  balance,
  label = "Available balance",
  variant = "hero",
  showActions = true,
  accountNumber,
  hidden = false,
  onToggleVisibility,
}: BalanceCardProps) {
  const hero = variant === "hero";

  const copyAccount = async () => {
    if (!accountNumber) return;

    try {
      await navigator.clipboard.writeText(
        accountNumber.replace(/\s/g, ""),
      );

      toast.success("Account number copied");
    } catch {
      toast.error("Couldn't copy — try again");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl p-6 sm:p-8",
        hero
          ? "bg-primary text-primary-foreground shadow-brand"
          : "border border-border bg-background",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-sm",
            hero
              ? "opacity-80"
              : "text-muted-foreground",
          )}
        >
          {label}
        </p>

        {onToggleVisibility ? (
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={
              hidden
                ? "Show balance"
                : "Hide balance"
            }
            title={
              hidden
                ? "Show balance"
                : "Hide balance"
            }
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              hero
                ? "text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {hidden ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        ) : null}
      </div>

      {/* Balance */}
      <p
        className={cn(
          "mt-2 font-bold tabular-nums tracking-tight",
          hero
            ? "text-4xl sm:text-5xl"
            : "text-3xl",
        )}
        aria-label={
          hidden
            ? "Balance hidden"
            : `Balance ${formatNaira(balance)}`
        }
      >
        {hidden
          ? "••••••••"
          : formatNaira(balance)}
      </p>

      {/* Actions */}
      {showActions ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            className={
              hero
                ? "bg-white text-primary hover:bg-white/90"
                : undefined
            }
          >
            <Link to="/add-money">
              <Plus className="size-4" />
              Add money
            </Link>
          </Button>

          <Button
            asChild
            variant={
              hero ? "default" : "outline"
            }
            className={
              hero
                ? "bg-white/20 text-white hover:bg-white/30"
                : undefined
            }
          >
            <Link to="/transfer">
              <Send className="size-4" />
              Send
            </Link>
          </Button>
        </div>
      ) : null}

      {/* Account Number */}
      {accountNumber ? (
        <div
          className={cn(
            "mt-6 flex items-center gap-2 border-t pt-4 text-sm",
            hero
              ? "border-white/15 opacity-80"
              : "border-border",
          )}
        >
          <span
            className={
              hero
                ? undefined
                : "text-muted-foreground"
            }
          >
            Account: {accountNumber}
          </span>

          <span aria-hidden>·</span>

          <button
            type="button"
            onClick={copyAccount}
            className={cn(
              "inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-100",
              hero
                ? "opacity-90"
                : "text-primary",
            )}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
        </div>
      ) : null}
    </div>
  );
}