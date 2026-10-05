import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  changeTransactionPin,
  isWeakPin,
  verifyTransactionPin,
} from "@/lib/pin";
import { useLockout } from "@/hooks/useLockout";
import PinInput from "@/components/shared/PinInput";
import PinFlowLayout from "@/components/shared/PinFlowLayout";

type Step = "current" | "new" | "confirm";

const STEP_ORDER: Step[] = ["current", "new", "confirm"];

const COPY: Record<Step, { heading: string; subheading: string }> = {
  current: {
    heading: "Enter your current PIN",
    subheading:
      "We'll verify your existing PIN before you set a new one.",
  },
  new: {
    heading: "Create your new PIN",
    subheading:
      "Choose a 4-digit PIN you'll remember. Avoid obvious patterns like 1234 or 0000.",
  },
  confirm: {
    heading: "Confirm your new PIN",
    subheading: "Enter the same 4 digits again to confirm.",
  },
};

export default function ChangeTransactionPin() {
  const navigate = useNavigate();
  const lockout = useLockout();

  const [step, setStep] = useState<Step>("current");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");

  const stepIndex = STEP_ORDER.indexOf(step);

  const clearAll = () => {
    setPin("");
    setNewPin("");
    setCurrentPin("");
    setError(null);
  };

  const goToStep = (next: Step) => {
    setStep(next);
    setPin("");
    setError(null);
  };

  const handleBack = () => {
    if (step === "confirm") {
      goToStep("new");
    } else if (step === "new") {
      setCurrentPin("");
      goToStep("current");
    } else {
      navigate("/transaction-pin");
    }
  };

  const handleComplete = async (entered: string) => {
    if (step === "current") {
      setVerifying(true);
      const ok = await verifyTransactionPin(entered);
      setVerifying(false);
      if (ok) {
        setCurrentPin(entered);
        lockout.reset();
        goToStep("new");
        return;
      }
      setPin("");
      const nowLocked = lockout.registerFailure();
      setError(
        nowLocked ? null : "That's not your current PIN. Try again.",
      );
      return;
    }

    if (step === "new") {
      if (isWeakPin(entered)) {
        setPin("");
        setError(
          "Please choose a stronger PIN. Avoid repeating or sequential numbers.",
        );
        return;
      }
      if (entered === currentPin) {
        setPin("");
        setError("Your new PIN can't be the same as your current PIN.");
        return;
      }
      setNewPin(entered);
      goToStep("confirm");
      return;
    }

    // step === "confirm"
    if (entered !== newPin) {
      setPin("");
      setError("Those PINs don't match. Try again.");
      return;
    }
    try {
      await changeTransactionPin(currentPin, newPin);
      clearAll();
      toast.success("Transaction PIN updated.");
      navigate("/profile/security");
    } catch {
      setPin("");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <PinFlowLayout
      step={stepIndex + 1}
      totalSteps={3}
      heading={COPY[step].heading}
      subheading={COPY[step].subheading}
      onBack={handleBack}
      footnote="Your PIN is encrypted and never shared with anyone."
    >
      <PinInput
        value={pin}
        onChange={(v) => {
          setPin(v);
          if (error) setError(null);
        }}
        onComplete={handleComplete}
        error={Boolean(error)}
        disabled={lockout.locked || verifying}
      />

      <p className="mt-4 min-h-5 text-center text-sm text-danger">
        {lockout.locked ? lockout.message : (error ?? "")}
      </p>
    </PinFlowLayout>
  );
}
