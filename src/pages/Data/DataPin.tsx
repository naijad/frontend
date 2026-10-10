
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Delete,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DataPurchaseState } from "./DataConfirmation";

export default function DataPin() {
  const navigate = useNavigate();
  const location = useLocation();
  const pinInputRef = useRef<HTMLInputElement>(null);

  const purchase = location.state as DataPurchaseState | null;

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const isValidPurchase =
    !!purchase &&
    !!purchase.network &&
    !!purchase.phone &&
    !!purchase.variationCode &&
    !!purchase.bundleName &&
    Number.isFinite(Number(purchase.total)) &&
    Number(purchase.total) > 0;

  useEffect(() => {
    if (!isValidPurchase) {
      navigate("/data", { replace: true });
    }
  }, [isValidPurchase, navigate]);

  if (!isValidPurchase || !purchase) {
    return null;
  }

  const addDigit = (digit: string) => {
    setError("");

    setPin((current) => {
      if (current.length >= 4) return current;
      return current + digit;
    });
  };

  const deleteDigit = () => {
    setError("");
    setPin((current) => current.slice(0, -1));
  };

  const handleContinue = () => {
    if (!/^\d{4}$/.test(pin)) {
      setError("Enter your complete 4-digit transaction PIN.");
      return;
    }

    setError("");

    navigate("/data/processing", {
      state: {
        ...purchase,
        pin,
      },
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-[#0D0D16] dark:text-white sm:px-6">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() =>
            navigate("/data/confirm", { state: purchase })
          }
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
        >
          <ArrowLeft size={18} />
          Back to review
        </button>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#151522] sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <LockKeyhole size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Enter transaction PIN
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Authorize your data purchase for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {purchase.displayPhone}
            </span>
            .
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-white/10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {purchase.networkName} · {purchase.bundleName}
            </p>
            <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">
              ₦{Number(purchase.total).toLocaleString("en-NG")}
            </p>
          </div>

          {/* PIN indicators */}
          <button
            type="button"
            onClick={() => pinInputRef.current?.focus()}
            className="mx-auto mt-7 flex justify-center gap-4"
            aria-label="Focus PIN entry"
          >
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${
                  pin.length > index
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                    : "border-gray-200 dark:border-white/15"
                }`}
              >
                {pin.length > index && (
                  <span className="h-3 w-3 rounded-full bg-violet-600 dark:bg-violet-400" />
                )}
              </span>
            ))}
          </button>

          {/* Hidden numeric input supports physical and mobile keyboards */}
          <input
            ref={pinInputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleContinue();
              }
            }}
            aria-label="Four-digit transaction PIN"
            className="pointer-events-none absolute h-px w-px opacity-0"
            tabIndex={-1}
          />

          {/* Numeric keypad */}
          <div className="mx-auto mt-7 grid max-w-xs grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
              (digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => addDigit(digit)}
                  className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold transition hover:bg-violet-50 active:scale-95 dark:border-white/10 dark:bg-[#1B1B2A] dark:hover:bg-violet-500/10"
                >
                  {digit}
                </button>
              ),
            )}

            <span aria-hidden="true" />

            <button
              type="button"
              onClick={() => addDigit("0")}
              className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold transition hover:bg-violet-50 active:scale-95 dark:border-white/10 dark:bg-[#1B1B2A] dark:hover:bg-violet-500/10"
            >
              0
            </button>

            <button
              type="button"
              onClick={deleteDigit}
              aria-label="Delete last PIN digit"
              className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 active:scale-95 dark:border-white/10 dark:bg-[#1B1B2A] dark:hover:bg-white/5"
            >
              <Delete size={21} />
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4 text-left dark:border-violet-400/20 dark:bg-violet-500/10">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400"
              />

              <div>
                <p className="font-semibold text-violet-900 dark:text-violet-300">
                  Keep your PIN private
                </p>
                <p className="mt-1 text-sm leading-6 text-violet-800 dark:text-violet-200/80">
                  Your PIN is sent to the backend for verification.
                  Never share it with another person.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="mt-6 w-full"
            disabled={pin.length !== 4}
            onClick={handleContinue}
          >
            Authorize purchase
          </Button>

          <button
            type="button"
            onClick={() => navigate("/data")}
            className="mt-4 text-sm text-gray-500 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
          >
            Cancel purchase
          </button>
        </section>
      </div>
    </main>
  );
}
