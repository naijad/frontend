import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

import { formatTimestamp } from "@/lib/format";
import { Button } from "@/components/ui/button";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

export default function PasswordChangeSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const changedAt =
    state && typeof state === "object" && "changedAt" in state
      ? String((state as { changedAt: unknown }).changedAt)
      : null;

  useEffect(() => {
    if (!changedAt) {
      toast.error("Please change your password from Security settings.");
      navigate("/profile/security", { replace: true });
    }
  }, [changedAt, navigate]);

  if (!changedAt) return null;

  return (
    <FlowShell showBrand>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <FlowHero
          icon={CheckCircle2}
          iconColor="success"
          title="Password changed"
          description="Your Ajora account password has been updated. Use your new password the next time you sign in."
          animated={false}
        />
      </motion.div>

      <motion.div
        className="mt-8 flex items-center gap-3 rounded-xl border border-border p-5"
        {...fade(0.4)}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Clock className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">Changed just now</p>
          <p className="text-sm text-muted-foreground">
            {formatTimestamp(new Date(changedAt))}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="mt-6 rounded-lg border border-warning/20 bg-warning/5 p-4"
        {...fade(0.5)}
      >
        <div className="flex items-center gap-2">
          <Shield className="size-4 shrink-0 text-warning" />
          <p className="text-sm font-medium">Signed out from other devices</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          For your security, we&apos;ve signed you out from all other devices.
          You&apos;ll need to sign in again on your other phones or computers.
        </p>
      </motion.div>

      <motion.div className="mt-8 space-y-3" {...fade(0.6)}>
        <Button
          size="lg"
          className="w-full"
          onClick={() =>
            navigate("/profile/security", { replace: true })
          }
        >
          Back to security settings
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          Go to dashboard
        </Button>
      </motion.div>
    </FlowShell>
  );
}
