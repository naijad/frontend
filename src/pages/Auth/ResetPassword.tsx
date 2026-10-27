
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }

    return null;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "Your reset link is missing its token. Please request a new password reset link.",
      );
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password, confirmPassword);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset your password. Please request a new link and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading={success ? "Password updated!" : "Create a new password"}
      subheading={
        success
          ? "Your Ajora password has been changed successfully."
          : "Choose a strong password to secure your Ajora account."
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      }
    >
      {success ? (
        <div className="space-y-5">
          <div
            role="status"
            className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Password reset successful</p>
              <p className="mt-1 leading-6">
                You can now log in using your new password.
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link to="/login">Continue to login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {!token ? (
            <div
              role="alert"
              className="rounded-md bg-danger/10 p-3 text-sm text-danger"
            >
              This reset link is missing its token. Please request a new link.
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-md bg-danger/10 p-3 text-sm text-danger"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-sm font-medium leading-none"
            >
              New password
            </label>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a new password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-10 pl-10"
                required
                minLength={8}
                disabled={isSubmitting || !token}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
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

            <p className="text-xs leading-5 text-muted-foreground">
              Use at least 8 characters, including uppercase and lowercase
              letters and a number.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium leading-none"
            >
              Confirm new password
            </label>

            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your new password again"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="pr-10"
                required
                disabled={isSubmitting || !token}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-neutral-900 text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-ajora-dark dark:bg-primary"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            Reset links expire after 30 minutes and can only be used once.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
