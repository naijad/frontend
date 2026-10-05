import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Info, KeyRound, Loader2 } from "lucide-react";

import { changePassword } from "@/lib/auth";
import { useLockout } from "@/hooks/useLockout";
import { scorePassword } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import PasswordInput from "@/components/shared/PasswordInput";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Your current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (val) => scorePassword(val).meetsMinimumRequirements,
        "Password is too weak — strengthen it to continue",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Your new password can't be the same as your current password",
    path: ["newPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const tips = [
  "Don't reuse a password from another site.",
  "Avoid using personal information like your name or birthday.",
  "A password manager makes strong passwords easy to remember.",
];

export default function ChangePassword() {
  const navigate = useNavigate();
  const lockout = useLockout();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Clear password state on unmount.
  useEffect(() => {
    return () => form.reset();
  }, [form]);

  const locked = lockout.locked;
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: ChangePasswordValues) => {
    if (locked) return;
    setFormError(null);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      form.reset();
      navigate("/profile/security/password/success", {
        state: { changedAt: new Date().toISOString() },
        replace: true,
      });
    } catch {
      form.setValue("currentPassword", "");
      const nowLocked = lockout.registerFailure();
      setFormError(
        nowLocked ? null : "That's not your current password. Try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate("/profile/security")}
      >
        <ChevronLeft className="size-4" />
        Back to Security
      </Button>

      <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Change your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password that you don&apos;t use anywhere else.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      disabled={locked || isSubmitting}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      autoComplete="new-password"
                      placeholder="Enter a new password"
                      showStrengthMeter
                      disabled={locked || isSubmitting}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      disabled={locked || isSubmitting}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="min-h-6 text-sm text-danger">
              {locked ? lockout.message : (formError ?? "")}
            </div>

            {locked ? (
              <p className="text-center text-sm text-muted-foreground">
                Forgot your password?{" "}
                <a
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Reset it via email
                </a>
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={!isValid || isSubmitting || locked}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Changing password...
                </>
              ) : (
                "Change password"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <Card className="mt-4 gap-0 border-info/20 bg-info/5 p-5">
        <div className="flex items-center gap-2">
          <Info className="size-4 shrink-0 text-info" />
          <p className="text-sm font-medium">Password best practices</p>
        </div>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
