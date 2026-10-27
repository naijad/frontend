import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Lightbulb,
  MonitorPlay,
  ShieldCheck,
  Tv,
  Zap,
} from "lucide-react";

type BillCategory = "electricity" | "cable";

type Provider = {
  id: string;
  name: string;
  description: string;
  category: BillCategory;
};

const providers: Record<BillCategory, Provider[]> = {
  electricity: [
    {
      id: "ikedc",
      name: "Ikeja Electric",
      description: "IKEDC",
      category: "electricity",
    },
    {
      id: "ekedc",
      name: "Eko Electric",
      description: "EKEDC",
      category: "electricity",
    },
    {
      id: "aedc",
      name: "Abuja Electric",
      description: "AEDC",
      category: "electricity",
    },
    {
      id: "phed",
      name: "Port Harcourt Electric",
      description: "PHED",
      category: "electricity",
    },
    {
      id: "bedc",
      name: "Benin Electric",
      description: "BEDC",
      category: "electricity",
    },
    {
      id: "kedco",
      name: "Kano Electric",
      description: "KEDCO",
      category: "electricity",
    },
  ],
  cable: [
    {
      id: "dstv",
      name: "DStv",
      description: "Digital satellite TV",
      category: "cable",
    },
    {
      id: "gotv",
      name: "GOtv",
      description: "Digital terrestrial TV",
      category: "cable",
    },
    {
      id: "startimes",
      name: "StarTimes",
      description: "Digital TV subscription",
      category: "cable",
    },
  ],
};

function formatNaira(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Bills() {
  const navigate = useNavigate();

  const [category, setCategory] = useState<BillCategory>("electricity");
  const [providerId, setProviderId] = useState("");
  const [customerType, setCustomerType] = useState<"prepaid" | "postpaid">(
    "prepaid",
  );
  const [customerNumber, setCustomerNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedProvider = providers[category].find(
    (provider) => provider.id === providerId,
  );

  function changeCategory(nextCategory: BillCategory) {
    setCategory(nextCategory);
    setProviderId("");
    setCustomerNumber("");
    setAmount("");
    setNotice("");
    setShowReview(false);
  }

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!selectedProvider) {
      setNotice("Please select a bill provider.");
      return;
    }

    if (customerNumber.trim().length < 5) {
      setNotice(
        category === "electricity"
          ? "Enter a valid meter number."
          : "Enter a valid smart-card or IUC number.",
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      setNotice("Enter an amount of at least ₦100.");
      return;
    }

    setShowReview(true);
  }

  function handlePaymentAttempt() {
    setNotice(
      "Bill payments are not connected yet. Your account has not been charged. Provider verification and secure payment processing will be enabled after API integration.",
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <p className="text-sm text-muted-foreground">Payments</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pay bills
          </h1>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                What would you like to pay?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a bill category to get started.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => changeCategory("electricity")}
                className={`rounded-2xl border p-4 text-left transition ${
                  category === "electricity"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Zap size={23} />
                </span>
                <span className="block font-semibold text-foreground">
                  Electricity
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Pay your power bill
                </span>
              </button>

              <button
                type="button"
                onClick={() => changeCategory("cable")}
                className={`rounded-2xl border p-4 text-left transition ${
                  category === "cable"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Tv size={23} />
                </span>
                <span className="block font-semibold text-foreground">
                  Cable TV
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Renew your subscription
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {category === "electricity"
                ? "Electricity details"
                : "Cable TV details"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter your details to prepare your bill payment.
            </p>

            <form onSubmit={handleReview} className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="bill-provider"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Select provider
                </label>

                <select
                  id="bill-provider"
                  value={providerId}
                  onChange={(event) => {
                    setProviderId(event.target.value);
                    setNotice("");
                    setShowReview(false);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Choose a provider</option>
                  {providers[category].map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              {category === "electricity" && (
                <div>
                  <p className="mb-2 block text-sm font-medium text-foreground">
                    Meter type
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {(["prepaid", "postpaid"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCustomerType(type)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                          customerType === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="customer-number"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  {category === "electricity"
                    ? "Meter number"
                    : "Smart-card / IUC number"}
                </label>

                <input
                  id="customer-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={customerNumber}
                  onChange={(event) => {
                    setCustomerNumber(event.target.value.replace(/\s/g, ""));
                    setNotice("");
                    setShowReview(false);
                  }}
                  placeholder={
                    category === "electricity"
                      ? "Enter your meter number"
                      : "Enter your decoder number"
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                  minLength={5}
                  maxLength={30}
                />

                <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                  Your number will need to be verified by the provider before
                  payment can be completed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="bill-amount"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Amount (₦)
                </label>

                <input
                  id="bill-amount"
                  type="number"
                  inputMode="decimal"
                  min="100"
                  step="1"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setNotice("");
                    setShowReview(false);
                  }}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {[1000, 2000, 5000, 10000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setAmount(String(value));
                        setNotice("");
                        setShowReview(false);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        amount === String(value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      ₦{value.toLocaleString("en-NG")}
                    </button>
                  ))}
                </div>
              </div>

              {notice && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-foreground"
                >
                  {notice}
                </div>
              )}

              {!showReview ? (
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition hover:opacity-90"
                >
                  Review bill
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={19} className="text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Review your details
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    This is a review of the information you entered, not
                    confirmation that the provider has verified your account.
                  </p>

                  <div className="space-y-3 rounded-xl bg-background p-4">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="text-right font-medium text-foreground">
                        {category === "electricity"
                          ? "Electricity"
                          : "Cable TV"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="text-right font-medium text-foreground">
                        {selectedProvider?.name}
                      </span>
                    </div>

                    {category === "electricity" && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Meter type</span>
                        <span className="font-medium capitalize text-foreground">
                          {customerType}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Customer number
                      </span>
                      <span className="max-w-[55%] break-all text-right font-medium text-foreground">
                        {customerNumber}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">
                        Amount
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {formatNaira(amount)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePaymentAttempt}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition hover:opacity-90"
                  >
                    Continue to payment
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReview(false);
                      setNotice("");
                    }}
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Edit details
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={22} />
            </span>
            <h2 className="font-semibold text-foreground">
              Payments with care
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Always check your meter or decoder number before paying. The
              provider must confirm the customer details before a real payment
              is processed.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Clock3 size={22} />
            </span>
            <h2 className="font-semibold text-foreground">Coming soon</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Provider verification, secure PIN authorization, live payment
              processing, receipts and transaction history will be enabled
              during API integration.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CircleHelp size={22} />
            </span>
            <h2 className="font-semibold text-foreground">Need help?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              If you are unsure which provider or customer number to use, check
              your bill or contact your service provider.
            </p>
            <button
              type="button"
              onClick={() => navigate("/profile/help")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Visit Help & Support
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <Lightbulb
              size={18}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              More bill categories can be added after electricity and cable
              payments are connected to a verified provider.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <MonitorPlay size={15} />
            Designed for mobile and desktop
          </div>
        </aside>
      </div>
    </section>
  );
}