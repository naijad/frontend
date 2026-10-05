import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { WifiOff } from "lucide-react";

interface AuthLayoutProps {
  /** Big page title on the form side, e.g. "Welcome back." */
  heading: string;
  /** Supporting line under the heading. */
  subheading: string;
  /** The form (or any interactive content) for this auth step. */
  children: ReactNode;
  /** Optional link row rendered under the form, centered and muted. */
  footer?: ReactNode;
  /** Pull-quote shown on the brand panel. Defaults to the login testimonial. */
  brandQuote?: string;
  /** Attribution line under the pull-quote, e.g. "— Chidinma, Lagos". */
  brandAttribution?: string;
}

const DEFAULT_QUOTE =
  "Ajora is the only wallet that works when my data runs out. That alone is worth it.";
const DEFAULT_ATTRIBUTION = "— Chidinma, Lagos";

/**
 * Shared split-screen shell for the auth flow (`/login`, `/signup`,
 * `/forgot-password`, `/reset-password`). Left = form, right = brand panel.
 *
 * The `auth-page` class opts this route out of the global 430px mobile frame
 * (see `.landing-layout:has(.auth-page)` in index.css) so the split layout can
 * span the full viewport on `lg` and up.
 */
export default function AuthLayout({
  heading,
  subheading,
  children,
  footer,
  brandQuote = DEFAULT_QUOTE,
  brandAttribution = DEFAULT_ATTRIBUTION,
}: AuthLayoutProps) {
  return (
    <main className="auth-page flex min-h-screen w-full flex-col bg-background text-foreground lg:flex-row">
      {/* ============ Form side ============ */}
      <div className="relative flex w-full flex-col lg:w-[55%]">
        <Link
          to="/"
          className="flex items-center gap-2.5 p-5 sm:p-6"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-black text-primary-foreground dark:bg-primary">
            A
          </span>
          <span className="text-lg font-bold tracking-tight">ajora</span>
        </Link>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-2 text-muted-foreground">{subheading}</p>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ============ Brand side ============ */}
      <aside className="relative hidden overflow-hidden bg-primary text-white lg:flex lg:w-[45%] lg:items-center lg:justify-center">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/20" />
        <div className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full border border-white/10" />

        <figure className="relative mx-auto max-w-md px-8">
          <WifiOff size={32} className="opacity-60" />
          <blockquote className="mt-6 text-2xl font-medium leading-snug">
            &ldquo;{brandQuote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm opacity-80">
            {brandAttribution}
          </figcaption>
        </figure>
      </aside>
    </main>
  );
}
