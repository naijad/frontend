
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Store,
} from "lucide-react";

const merchantCategories = [
  "Shopping & retail",
  "Food & drinks",
  "Groceries",
  "Health & beauty",
  "Transport",
  "Professional services",
  "Other",
];

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

export default function Merchant() {
  const navigate = useNavigate();

  const [merchantName, setMerchantName] = useState("");
  const [merchantCode, setMerchantCode] = useState("");
  const [category, setCategory] = useState("Shopping & retail");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [notice, setNotice] = useState("");

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (merchantName.trim().length < 2) {
      setNotice("Enter the merchant's name.");
      return;
    }

    if (merchantCode.trim().length < 3) {
      setNotice("Enter a valid merchant code or ID.");
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
      "Merchant payments are not connected yet. No money has been deducted from your account. API integration is required to verify the merchant and securely process this payment.",
    );
  }

  function clearReview() {
    setShowReview(false);
    setNotice("");
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
            Pay a merchant
          </h1>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="bg-primary p-6 text-white sm:p-8">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Store size={25} />
              </span>

              <h2 className="text-xl font-bold sm:text-2xl">
                Pay businesses with Ajora
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">
                Prepare a merchant payment using the business details provided
                by the merchant.
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              <div className="p-3 text-center sm:p-4">
                <ShieldCheck
                  size={19}
                  className="mx-auto mb-2 text-primary"
                />
                <p className="text-xs font-medium text-foreground">
                  Secure flow
                </p>
              </div>

              <div className="p-3 text-center sm:p-4">
                <ReceiptText
                  size={19}
                  className="mx-auto mb-2 text-primary"
                />
                <p className="text-xs font-medium text-foreground">
                  Payment review
                </p>
              </div>

              <div className="p-3 text-center sm:p-4">
                <LockKeyhole
                  size={19}
                  className="mx-auto mb-2 text-primary"
                />
                <p className="text-xs font-medium text-foreground">
                  Authorization
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Merchant details
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Use the merchant name and code supplied by the business. These
              details will need to be verified when the payment API is
              connected.
            </p>

            <form onSubmit={handleReview} className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="merchant-name"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Merchant or business name
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="merchant-name"
                    type="text"
                    autoComplete="organization"
                    value={merchantName}
                    onChange={(event) => {
                      setMerchantName(event.target.value);
                      clearReview();
                    }}
                    placeholder="e.g. Example Stores"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="merchant-code"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Merchant code or ID
                </label>

                <input
                  id="merchant-code"
                  type="text"
                  autoComplete="off"
                  value={merchantCode}
                  onChange={(event) => {
                    setMerchantCode(event.target.value.trimStart());
                    clearReview();
                  }}
                  placeholder="Enter the code supplied by the merchant"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  minLength={3}
                  maxLength={80}
                  required
                />

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  This field is for the merchant's identifier, not a bank
                  account number. The identifier format will depend on the
                  payment provider we integrate.
                </p>
              </div>

              <div>
                <label
                  htmlFor="merchant-category"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Business category
                </label>

                <select
                  id="merchant-category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    clearReview();
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {merchantCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="merchant-amount"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Payment amount (₦)
                </label>

                <input
                  id="merchant-amount"
                  type="number"
                  inputMode="decimal"
                  min="100"
                  step="1"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    clearReview();
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
                        clearReview();
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

              <div>
                <label
                  htmlFor="merchant-note"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Payment note{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="merchant-note"
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    clearReview();
                  }}
                  placeholder="What is this payment for?"
                  rows={3}
                  maxLength={180}
                  className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {note.length}/180
                </p>
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
                  Review payment
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={19} className="text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Confirm payment details
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    Review the information below. The merchant has not yet
                    been verified, and no payment has been made.
                  </p>

                  <div className="space-y-3 rounded-xl bg-background p-4">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Merchant</span>
                      <span className="max-w-[60%] break-words text-right font-medium text-foreground">
                        {merchantName.trim()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Merchant code
                      </span>
                      <span className="max-w-[60%] break-all text-right font-medium text-foreground">
                        {merchantCode.trim()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="max-w-[60%] text-right font-medium text-foreground">
                        {category}
                      </span>
                    </div>

                    {note.trim() && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Note</span>
                        <span className="max-w-[60%] break-words text-right text-foreground">
                          {note.trim()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">
                        Total amount
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
              Verify before paying
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Always confirm the merchant name, identifier and amount before
              authorizing a transaction. Live verification will be added with
              API integration.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <LockKeyhole size={22} />
            </span>

            <h2 className="font-semibold text-foreground">
              Secure authorization
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your transaction PIN and wallet balance will only be used when
              the backend payment flow is connected and verified.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CircleHelp size={22} />
            </span>

            <h2 className="font-semibold text-foreground">Need assistance?</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              If you are unsure about a merchant code, ask the business to
              confirm the correct payment details.
            </p>

            <button
              type="button"
              onClick={() => navigate("/profile/help")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Help & Support
              <ArrowRight size={16} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
