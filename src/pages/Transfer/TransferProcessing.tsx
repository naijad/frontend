import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { isTransferPayload } from "@/lib/transfer";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";

const PROCESSING_MS = 2500;

export default function TransferProcessing() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const payload = isTransferPayload(state) ? state : null;

  useEffect(() => {
    if (!payload) {
      toast.error(
        "Transfer was interrupted. Check your transactions for status.",
      );
      navigate("/transactions", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      const reference = `AJR${Date.now().toString().slice(-8)}`;
      const timestamp = new Date().toISOString();
      navigate("/transfer/success", {
        state: { ...payload, reference, timestamp },
        replace: true,
      });
    }, PROCESSING_MS);

    return () => clearTimeout(timer);
  }, [payload, navigate]);

  if (!payload) return null;

  return (
    <FlowShell showBrand>
      <FlowHero
        icon={Loader2}
        iconColor="primary"
        title="Processing your transfer..."
        description="This usually takes just a few seconds. Please don't close this page."
        animated={false}
        spin
      />

      <div className="mt-8 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
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
