import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/format";
import { verifyTransactionPin } from "@/lib/pin";
import { isTransferPayload } from "@/lib/transfer";
import { useLockout } from "@/hooks/useLockout";
import { Button } from "@/components/ui/button";
import FlowShell from "@/components/shared/FlowShell";
import FlowHero from "@/components/shared/FlowHero";
import PinInput from "@/components/shared/PinInput";

export default function TransferPin() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const payload = isTransferPayload(state) ? state : null;
  const lockout = useLockout();

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!payload) {
      toast.error("Please start a new transfer.");
      navigate("/transfer", { replace: true });
    }
  }, [payload, navigate]);

  if (!payload) return null;

  const handleComplete = async (entered: string) => {
    setVerifying(true);
    const ok = await verifyTransactionPin(entered);
    setVerifying(false);
    if (ok) {
      navigate("/transfer/processing", { state: payload, replace: true });
      return;
    }
    setPin("");
    setError(true);
    lockout.registerFailure();
  };

  return (
    <FlowShell
      onBack={() => navigate("/transfer/confirm", { state: payload })}
    >
      <p className="mb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
        Step 2 of 3
      </p>

      <FlowHero
        icon={Lock}
        iconColor="primary"
        title="Enter your PIN"
        description={`Enter your 4-digit transaction PIN to authorize this ${formatNaira(
          payload.amount,
        )} transfer to ${payload.recipient.name}.`}
      />

      <div className="mt-8">
        <PinInput
          value={pin}
          onChange={(v) => {
            setPin(v);
            if (error) setError(false);
          }}
          onComplete={handleComplete}
          error={error}
          disabled={lockout.locked || verifying}
        />
        <p className="mt-4 min-h-5 text-center text-sm text-danger">
          {lockout.locked
            ? lockout.message
            : error
              ? "That's not your PIN. Try again."
              : ""}
        </p>
      </div>

      {lockout.locked ? (
        <div className="mt-2 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate("/transfer/confirm", { state: payload })
            }
          >
            Cancel transfer
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Forgot your PIN?{" "}
          <Link
            to="/transaction-pin/reset"
            className="text-primary hover:underline"
          >
            Reset it
          </Link>
        </p>
      )}
    </FlowShell>
  );
}
