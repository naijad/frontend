
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../lib/api";

type InitializeResponse = {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    authorizationUrl: string;
    accessCode?: string;
  };
};

const PRESET_AMOUNTS = [1000, 5000, 10000, 20000, 50000];

export default function AddMoney() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [amount, setAmount] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  // Forward Paystack's payment reference to the dedicated success page.
  useEffect(() => {
    if (!reference) return;

    navigate(
      `/deposit-success?reference=${encodeURIComponent(reference)}`,
      { replace: true }
    );
  }, [reference, navigate]);

  async function handleInitializePayment() {
    const numericAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount < 100 ||
      numericAmount > 5_000_000 ||
      Math.round(numericAmount * 100) !== numericAmount * 100
    ) {
      toast.error(
        "Enter an amount between ₦100 and ₦5,000,000, with up to two decimal places."
      );
      return;
    }

    setIsInitializing(true);

    try {
      const result = await apiRequest<InitializeResponse>(
        "/transactions/deposit/initialize",
        {
          method: "POST",
          body: JSON.stringify({ amount: numericAmount }),
        }
      );

      if (!result.success || !result.data?.authorizationUrl) {
        throw new Error(
          result.message || "Unable to start payment. Please try again."
        );
      }

      // Paystack processes the payment. The backend verifies it
      // before the wallet is credited.
      window.location.assign(result.data.authorizationUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to initialize payment."
      );

      setIsInitializing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-10">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Add money
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fund your Ajora wallet securely
          </p>
        </div>
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-900/10 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/75">Add money to</p>
            <h2 className="mt-1 text-xl font-bold">Ajora Wallet</h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Wallet size={25} />
          </div>
        </div>

        <div className="mt-7">
          <label
            htmlFor="deposit-amount"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Amount (NGN)
          </label>

          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/60">
            <span className="text-xl font-semibold text-white/80">₦</span>

            <input
              id="deposit-amount"
              type="number"
              inputMode="decimal"
              min="100"
              max="5000000"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              disabled={isInitializing}
              className="min-w-0 flex-1 bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/40 disabled:opacity-60"
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                disabled={isInitializing}
                className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  Number(amount) === preset
                    ? "border-white bg-white text-violet-700"
                    : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                ₦{preset.toLocaleString("en-NG")}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleInitializePayment()}
          disabled={isInitializing}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isInitializing ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Preparing payment...
            </>
          ) : (
            <>
              Continue to payment
              <ArrowUpRight size={19} />
            </>
          )}
        </button>
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#151522]">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-300"
          />

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Secure payment
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your payment is processed through Paystack. Ajora verifies
              successful payments on the server before crediting your wallet.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock3
            size={20}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Payment pending?
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A bank or card confirmation may take a little time. Avoid
              repeating a payment if you have already been charged.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
