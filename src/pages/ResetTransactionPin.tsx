
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  isWeakPin,
  resetTransactionPin,
} from "@/lib/pin";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLockout } from "@/hooks/useLockout";
import PinInput from "@/components/shared/PinInput";
import PinFlowLayout from "@/components/shared/PinFlowLayout";

type Step = "password" | "new" | "confirm";

const STEP_ORDER: Step[] = [
  "password",
  "new",
  "confirm",
];

const COPY: Record<
  Step,
  {
    heading: string;
    subheading: string;
  }
> = {
  password: {
    heading: "Enter your password",
    subheading:
      "Enter your account password. We'll securely verify it when you save your new transaction PIN.",
  },

  new: {
    heading: "Create your new PIN",
    subheading:
      "Choose a 4-digit PIN you'll remember. Avoid obvious patterns like 1234 or 0000.",
  },

  confirm: {
    heading: "Confirm your new PIN",
    subheading:
      "Enter the same 4 digits again to confirm.",
  },
};

export default function ResetTransactionPin() {
  const navigate = useNavigate();
  const lockout = useLockout();

  const [step, setStep] =
    useState<Step>("password");

  const [pin, setPin] =
    useState("");

  const [newPin, setNewPin] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const stepIndex =
    STEP_ORDER.indexOf(step);

  const goToStep = (next: Step) => {
    setStep(next);
    setPin("");
    setError(null);
  };

  const handleBack = () => {
    if (saving) return;

    if (step === "confirm") {
      goToStep("new");
      return;
    }

    if (step === "new") {
      goToStep("password");
      return;
    }

    navigate("/transaction-pin");
  };

  /**
   * Move from the password step to
   * PIN creation.
   *
   * The password is NOT verified here.
   *
   * The backend verifies it when the
   * final reset request is submitted.
   */
  const handleContinuePassword = () => {
    if (
      password.length < 8 ||
      lockout.locked ||
      saving
    ) {
      return;
    }

    setError(null);
    setStep("new");
  };

  const handleComplete = async (
    entered: string,
  ) => {
    if (saving || lockout.locked) {
      return;
    }

    /**
     * STEP 2:
     * Validate the new PIN.
     */
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

    /**
     * STEP 3:
     * Confirm the new PIN.
     */
    if (step === "confirm") {
      if (entered !== newPin) {
        setPin("");

        setError(
          "Those PINs don't match. Try again.",
        );

        return;
      }

      setSaving(true);
      setError(null);

      try {
        /**
         * The backend now:
         *
         * 1. Finds the authenticated user.
         * 2. Verifies the account password.
         * 3. Hashes the new PIN.
         * 4. Creates/updates the Security record.
         * 5. Stores transactionPinHash.
         *
         * This also works when the user
         * has NEVER had a transaction PIN.
         */
        await resetTransactionPin(
          password,
          newPin,
        );

        lockout.reset();

        setPin("");
        setNewPin("");
        setPassword("");
        setError(null);

        toast.success(
          "Transaction PIN set successfully.",
        );

        navigate(
          "/profile/security",
          { replace: true },
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to reset your transaction PIN.";

        setPin("");

        /**
         * The backend specifically returns:
         *
         * "Account password is incorrect."
         *
         * when the password is wrong.
         */
        if (
          message
            .toLowerCase()
            .includes("password")
        ) {
          const nowLocked =
            lockout.registerFailure();

          setError(
            nowLocked
              ? null
              : "That password is incorrect. Try again.",
          );

          /**
           * Send the user back to the
           * password step because the
           * password failed.
           */
          if (!nowLocked) {
            setStep("password");
          }
        } else {
          setError(message);
        }
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <PinFlowLayout
      step={stepIndex + 1}
      totalSteps={3}
      heading={COPY[step].heading}
      subheading={COPY[step].subheading}
      onBack={handleBack}
      footnote="Your PIN is securely encrypted and never shared with anyone."
    >
      {step === "password" ? (
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your account password"
              autoComplete="current-password"
              className="pr-10"
              value={password}
              disabled={
                lockout.locked ||
                saving
              }
              onChange={(event) => {
                setPassword(
                  event.target.value,
                );

                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  handleContinuePassword();
                }
              }}
            />

            <button
              type="button"
              disabled={
                lockout.locked ||
                saving
              }
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
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
            disabled={
              password.length < 8 ||
              lockout.locked ||
              saving
            }
            onClick={
              handleContinuePassword
            }
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
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
            {lockout.locked
              ? lockout.message
              : (error ?? "")}
          </p>
        </div>
      ) : (
        <>
          <PinInput
            value={pin}
            onChange={(value) => {
              setPin(value);

              if (error) {
                setError(null);
              }
            }}
            onComplete={handleComplete}
            error={Boolean(error)}
            disabled={
              saving ||
              lockout.locked
            }
          />

          <p className="mt-4 min-h-5 text-center text-sm text-danger">
            {lockout.locked
              ? lockout.message
              : (error ?? "")}
          </p>

          {saving && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Saving your transaction PIN...
            </div>
          )}
        </>
      )}
    </PinFlowLayout>
  );
}

