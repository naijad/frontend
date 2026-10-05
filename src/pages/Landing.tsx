import {
  ArrowRight,
  ArrowUp,
  Banknote,
  BarChart3,
  Check,
  CircleHelp,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Tv,
  WifiOff,
  Zap,
} from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import { PARTNER_BRANDS } from "@/lib/brand";

const features = [
  {
    title: "Airtime & Data",
    description: "Top up any Nigerian network in seconds.",
    icon: Phone,
    tone: "text-info bg-info-soft",
  },
  {
    title: "Electricity bills",
    description: "Pay any disco, prepaid or postpaid.",
    icon: Zap,
    tone: "text-warning bg-warning-soft",
  },
  {
    title: "Cable TV",
    description: "Keep your favourite shows on, without the queue.",
    icon: Tv,
    tone: "text-danger bg-danger-soft",
  },
  {
    title: "Track your spending",
    description: "See where your money goes, at a glance.",
    icon: BarChart3,
    tone: "text-success bg-success-soft",
  },
];

const quickActions = [
  { label: "Airtime", icon: Phone, tone: "bg-info-soft text-info" },
  { label: "Data", icon: Smartphone, tone: "bg-success-soft text-success" },
  { label: "Power", icon: Zap, tone: "bg-warning-soft text-warning" },
  { label: "TV", icon: Tv, tone: "bg-danger-soft text-danger" },
  { label: "Send", icon: Send, tone: "bg-ajora-light text-ajora" },
];

function WalletPreview() {
  return (
    <div className="relative mx-auto w-full max-w-120 lg:ml-auto">
      <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-success-soft blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-background p-4 shadow-lg sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tuesday, 12 March</p>
            <p className="mt-1 font-semibold text-foreground">
              Welcome back, Ada
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            AO
          </div>
        </div>

        <div className="my-4 rounded-xl bg-primary p-5 text-primary-foreground shadow-brand">
          <p className="text-sm opacity-80">Available balance</p>
          <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
            ₦248,500
          </p>
          <button className="mt-4 h-9 rounded-md bg-white px-4 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5">
            + Add money
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {quickActions.map(({ label, icon: Icon, tone }) => (
            <div
              key={label}
              className="flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}
              >
                <Icon size={17} strokeWidth={2.2} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent transactions</h3>
          <span className="text-xs font-semibold text-primary">See all</span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-info-soft text-info">
                <Phone size={15} />
              </div>
              <div>
                <p className="text-sm font-medium">Airtime · MTN</p>
                <p className="text-xs text-muted-foreground">Today, 10:42 AM</p>
              </div>
            </div>
            <span className="text-sm font-semibold">−₦1,000</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
                <Banknote size={15} />
              </div>
              <div>
                <p className="text-sm font-medium">Wallet top-up</p>
                <p className="text-xs text-muted-foreground">
                  Yesterday, 3:18 PM
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-success">+₦50,000</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-md sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
          <ShieldCheck size={17} />
        </div>
        <div>
          <p className="text-xs font-semibold">Your money is protected</p>
          <p className="text-xs text-muted-foreground">
            Bank-grade security
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page min-h-screen overflow-hidden bg-background text-foreground">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${scrolled ? "border-border bg-background/90 shadow-sm backdrop-blur-md" : "border-transparent bg-background"}`}
      >
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-lg font-black text-primary-foreground dark:bg-primary">
              A
            </span>
            <span className="text-xl font-bold tracking-tight">ajora</span>
          </a>
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              to="/login"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ajora-dark dark:bg-primary"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-36 sm:px-6 sm:pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Send · Pay · Top up · Track
            </p>
            <h1 className="mt-6 max-w-170 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              The wallet that works when the internet doesn&apos;t.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
              Send money, pay bills, and buy airtime &amp; data, even when
              you&apos;re offline. Built for real life in Nigeria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-neutral-900 px-6 text-base font-semibold text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-ajora-dark dark:bg-primary"
              >
                Create free account
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["AD", "MK", "TO", "SA"].map((initials, index) => (
                  <span
                    key={initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-primary-foreground ${
                      ["bg-primary", "bg-info", "bg-success", "bg-warning"].at(
                        index,
                      ) ?? "bg-primary"
                    }`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Over 50,000 Nigerians on Ajora
              </span>
            </div>
          </div>
          <WalletPreview />
        </section>

        <section className="border-y border-border bg-muted py-8">
          <p className="text-center text-sm text-muted-foreground">
            Works with every Nigerian network and bank.
          </p>
          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4 sm:justify-between sm:px-6">
            {/* TODO: swap for real SVG logos */}
            {PARTNER_BRANDS.map((logo) => (
              <span
                key={logo.name}
                style={
                  {
                    "--brand-bg": logo.bg,
                    "--brand-fg": logo.fg,
                  } as CSSProperties
                }
                className="inline-flex h-10 cursor-pointer items-center rounded-md bg-background px-5 text-sm font-semibold shadow-sm transition-colors duration-200 hover:bg-[var(--brand-bg)] hover:text-[var(--brand-fg)] hover:shadow-md"
              >
                {logo.name}
              </span>
            ))}
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28"
        >
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            One wallet, everything covered
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you pay for, in one place.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, icon: Icon, tone }) => (
              <article
                key={title}
                className="rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-muted" id="offline">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
            <div className="relative flex min-h-70 items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 p-8 text-primary-foreground sm:min-h-90">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/20" />
              <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full border border-white/10" />
              <div className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15">
                  <WifiOff size={42} strokeWidth={1.5} />
                </div>
                <p className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-white/70">
                  No data? No problem.
                </p>
                <p className="mt-3 text-3xl font-bold">*347*AJORA#</p>
                <p className="mt-3 text-sm text-white/75">
                  Your wallet, always within reach.
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                The Ajora difference
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Your money should work as hard as you do.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                When the network drops, dial our USSD code to buy airtime or
                data in seconds. No app updates. No loading wheel. No stress.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Check size={15} />
                  </div>
                  <p className="text-sm leading-6">
                    <strong>Works on any phone.</strong> Smartphone or basic
                    phone, you are covered.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Check size={15} />
                  </div>
                  <p className="text-sm leading-6">
                    <strong>Available on every network.</strong> MTN, Glo,
                    Airtel and 9mobile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28"
        >
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-ajora-dark">
              How it works
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Simple from day one.
            </h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create your account",
                text: "Sign up in a few minutes with your phone number and basic details.",
              },
              {
                number: "02",
                title: "Fund your wallet",
                text: "Add money from your bank or receive transfers from anyone.",
              },
              {
                number: "03",
                title: "Get things done",
                text: "Pay, send, top up and track your spending in one calm place.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="border-t-2 border-ajora-dark pt-5"
              >
                <span className="text-sm font-bold text-ajora-dark">
                  {step.number}
                </span>
                <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-6 rounded-xl bg-black px-6 py-20 text-center sm:px-10">
          <h2 className="text-balance text-4xl font-bold tracking-[-0.06em] text-white sm:text-5xl">
            Ready to simplify how you pay?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-neutral-300">
            A smarter wallet for the way Nigerians live, work and connect.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-neutral-900 shadow-brand transition-all hover:-translate-y-0.5 hover:bg-ajora-dark hover:text-white"
            >
              Create free account
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section id="support" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Support
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                We are here when you need us.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-muted-foreground">
                Questions about your account or a transaction? Our support team
                is ready to help.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="mailto:hello@ajora.com"
                className="rounded-xl border border-border p-5 transition-colors hover:bg-muted"
              >
                <MessageCircle className="text-primary" size={22} />
                <h3 className="mt-5 font-semibold">Talk to support</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  hello@ajora.com
                </p>
              </a>
              <a
                href="tel:*347%23"
                className="rounded-xl border border-border p-5 transition-colors hover:bg-muted"
              >
                <CircleHelp className="text-primary" size={22} />
                <h3 className="mt-5 font-semibold">Help centre</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Answers, when you need them
                </p>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-black text-primary-foreground dark:bg-primary">
              A
            </span>
            <span className="font-bold">ajora</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Ajora. Money made simpler.
          </p>
          <div />
        </div>
      </footer>
      <button
        type="button"
        aria-label="Back to top"
        title="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-brand transition-all duration-300 hover:-translate-y-1 hover:bg-ajora-dark sm:bottom-8 sm:right-8 ${scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <ArrowUp size={19} />
      </button>
    </div>
  );
}
