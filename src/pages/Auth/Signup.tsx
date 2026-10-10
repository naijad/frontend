import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signup } from "@/lib/auth";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Enter your full name")
      .refine(
        (val) => val.trim().split(/\s+/).length >= 2,
        "Enter both your first and last name",
      ),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^0(70|80|81|90|91)\d{8}$/,
        "Enter a valid Nigerian phone number",
      ),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),

    transactionPin: z
      .string()
      .regex(/^\d{4}$/, "Transaction PIN must contain exactly 4 digits"),

    confirmTransactionPin: z
      .string()
      .regex(/^\d{4}$/, "Confirm your 4-digit transaction PIN"),
  })
  .refine(
    (values) => values.transactionPin === values.confirmTransactionPin,
    {
      message: "Transaction PINs do not match",
      path: ["confirmTransactionPin"],
    },
  );

type SignupValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showTransactionPin, setShowTransactionPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      transactionPin: "",
      confirmTransactionPin: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setFormError(null);

    try {
      await signup({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        password: values.password,
        transactionPin: values.transactionPin,
      });

      navigate("/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <AuthLayout
      heading="Create your account."
      subheading="Start moving money in minutes — no paperwork, no fuss."
      brandQuote="Setting up took me under two minutes. I sent my first transfer before my coffee got cold."
      brandAttribution="— Tunde, Abuja"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-md bg-danger/10 p-3 text-sm text-danger"
            >
              {formError}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Chidinma Okafor"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="08012345678"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  We&apos;ll send a verification code here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@ajora.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>

                <FormDescription>
                  At least 8 characters, with one uppercase letter and one
                  number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-1 border-t border-border pt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="font-semibold">Secure your transactions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a 4-digit PIN to authorize transactions.
            </p>
          </div>

          <FormField
            control={form.control}
            name="transactionPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction PIN</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showTransactionPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="new-password"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      className="pr-10 tracking-[0.3em]"
                      onChange={(event) => {
                        field.onChange(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        );
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowTransactionPin((value) => !value)
                      }
                      aria-label={
                        showTransactionPin ? "Hide transaction PIN" : "Show transaction PIN"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showTransactionPin ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  Use a PIN you don&apos;t use for your phone or other accounts.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmTransactionPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm transaction PIN</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="new-password"
                      maxLength={4}
                      placeholder="Re-enter 4-digit PIN"
                      className="pr-10 tracking-[0.3em]"
                      onChange={(event) => {
                        field.onChange(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        );
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPin((value) => !value)}
                      aria-label={
                        showConfirmPin
                          ? "Hide confirmation PIN"
                          : "Show confirmation PIN"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPin ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full bg-neutral-900 text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-ajora-dark dark:bg-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <SocialAuthButtons />
    </AuthLayout>
  );
}