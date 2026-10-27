import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const message = await requestPasswordReset(normalizedEmail);
      setSuccess(message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to process your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading="Forgot your password?"
      subheading="Don't worry. Enter your email address and we'll help you get back into your Ajora account."
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
      <div className="space-y-5">
        {success ? (
          <div className="space-y-5">
            <div
              role="status"
              className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <p className="leading-6">{success}</p>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              If you don't see the email, check your spam folder. The reset
              link expires after 30 minutes.
            </p>

            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setEmail("");
              }}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
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
                htmlFor="forgot-email"
                className="text-sm font-medium leading-none"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-neutral-900 text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-ajora-dark dark:bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              For your security, Ajora does not reveal whether an email address
              is registered. If an account exists, a reset link will be sent
              when email delivery is configured correctly.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
