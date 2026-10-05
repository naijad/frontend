import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  isWeakPin,
  resetTransactionPin,
  verifyAccountPassword,
} from "@/lib/pin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLockout } from "@/hooks/useLockout";
import PinInput from "@/components/shared/PinInput";
import PinFlowLayout from "@/components/shared/PinFlowLayout";

type Step = "password" | "new" | "confirm";

const STEP_ORDER: Step[] = ["password", "new", "confirm"];

const COPY: Record<Step, { heading: string; subheading: string }> = {
  password: {
    heading: "Verify your password",
    subheading:
      "For your security, we'll verify your account password before you set a new PIN.",
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

export default function ResetTransactionPin() {
  const navigate = useNavigate();
  const lockout = useLockout();

  const [step, setStep] = useState<Step>("password");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(step);

  const goToStep = (next: Step) => {
    setStep(next);
    setPin("");
    setError(null);
  };

  const handleBack = () => {
    if (step === "confirm") {
      goToStep("new");
    } else if (step === "new") {
      goToStep("password");
    } else {
      navigate("/transaction-pin");
    }
  };

  const handleVerifyPassword = async () => {
    if (password.length < 8 || lockout.locked || checking) return;
    setChecking(true);
    const ok = await verifyAccountPassword(password);
    setChecking(false);
    if (ok) {
      lockout.reset();
      setError(null);
      setStep("new");
      return;
    }
    setPassword("");
    const nowLocked = lockout.registerFailure();
    setError(nowLocked ? null : "That password is incorrect. Try again.");
  };

  const handleComplete = async (entered: string) => {
    if (step === "new") {
      if (isWeakPin(entered)) {
        setPin("");
        setError(
          "Please choose a stronger PIN. Avoid repeating or sequential numbers.",
        );
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
      await resetTransactionPin(password, newPin);
      setPin("");
      setNewPin("");
      setPassword("");
      setError(null);
      toast.success("Transaction PIN reset successfully.");
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
      {step === "password" ? (
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your account password"
              autoComplete="current-password"
              className="pr-10"
              value={password}
              disabled={lockout.locked || checking}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyPassword();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={password.length < 8 || lockout.locked || checking}
            onClick={handleVerifyPassword}
          >
            {checking ? (
              <>
                <Loader2 className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify password"
            )}
          </Button>

          <p className="text-center text-sm">
            <span className="text-muted-foreground">
              Forgot your password?{" "}
            </span>
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Reset it here
            </Link>
          </p>

          <p className="min-h-5 text-center text-sm text-danger">
            {lockout.locked ? lockout.message : (error ?? "")}
          </p>
        </div>
      ) : (
        <>
          <PinInput
            value={pin}
            onChange={(v) => {
              setPin(v);
              if (error) setError(null);
            }}
            onComplete={handleComplete}
            error={Boolean(error)}
          />

          <p className="mt-4 min-h-5 text-center text-sm text-danger">
            {error ?? ""}
          </p>
        </>
      )}
    </PinFlowLayout>
  );
}
