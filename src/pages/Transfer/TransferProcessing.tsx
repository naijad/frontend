import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  isCompletedTransfer,
} from "@/lib/transfer";

import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";

const PROCESSING_MS = 1800;

export default function TransferProcessing() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const payload =
    isCompletedTransfer(state)
      ? state
      : null;

  useEffect(() => {
    if (!payload) {
      toast.error(
        "Transfer information could not be found.",
      );

      navigate(
        "/transactions",
        { replace: true },
      );

      return;
    }

    /**
     * The actual transfer has already been
     * completed by the backend before we
     * reached this screen.
     *
     * This delay is only for the processing
     * animation/UX.
     */
    const timer = window.setTimeout(() => {
      navigate(
        "/transfer/success",
        {
          state: payload,
          replace: true,
        },
      );
    }, PROCESSING_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [payload, navigate]);

  if (!payload) {
    return null;
  }

  return (
    <FlowShell showBrand>
      <FlowHero
        icon={Loader2}
        iconColor="primary"
        title="Processing your transfer..."
        description="Your transfer has been authorized. Please wait while we prepare your receipt."
        animated={false}
        spin
      />

      <div className="mt-8 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-primary"
            animate={{
              opacity: [
                0.3,
                1,
                0.3,
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </FlowShell>
  );
}