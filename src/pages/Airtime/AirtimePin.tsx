
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Delete,
  ShieldCheck,
} from "lucide-react";

type AirtimePinState = {
  network: string;
  networkName: string;
  phone: string;
  displayPhone: string;
  amount: number;
  fee: number;
  total: number;
};

export default function AirtimePin() {
  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef<HTMLInputElement>(null);

  const state = location.state as AirtimePinState | null;

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) {
      navigate("/airtime", { replace: true });
    }
  }, [navigate, state]);

  if (!state) {
    return null;
  }

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) {
      return;
    }

    setError("");
    setPin((current) => `${current}${digit}`);
  };

  const handleDelete = () => {
    setError("");
    setPin((current) => current.slice(0, -1));
  };

  const handleSubmit = () => {
    setError("");

    if (pin.length !== 4) {
      setError("Please enter your 4-digit transaction PIN.");
      return;
    }

    navigate("/airtime/processing", {
      state: {
        ...state,
        pin,
      },
    });
  };

  const handleInputChange = (value: string) => {
    const digits = value.replace(/\D/g, "");

    setError("");
    setPin(digits.slice(0, 4));
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-background px-4 pb-10 pt-6 text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold">
            Transaction PIN
          </h1>
          <p className="text-sm text-muted-foreground">
            Authorize your airtime purchase
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-center text-2xl font-bold">
          Enter your PIN
        </h2>

        <p className="mt-2 max-w-sm text-center text-sm leading-6 text-muted-foreground">
          Enter your 4-digit transaction PIN to authorize
          this airtime purchase.
        </p>

        {/* Hidden input for keyboard entry */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(event) =>
            handleInputChange(event.target.value)
          }
          className="sr-only"
          aria-label="Transaction PIN"
        />

        {/* PIN dots */}
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="mt-8 flex items-center gap-4"
          aria-label="Enter transaction PIN"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all ${
                index < pin.length
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {index < pin.length && (
                <span className="h-3 w-3 rounded-full bg-primary" />
              )}
            </span>
          ))}
        </button>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-5 text-center text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}

        {/* Numeric keypad */}
        <div className="mt-8 grid w-full max-w-xs grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
            (digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-2xl border border-border bg-card text-lg font-semibold text-card-foreground transition-colors hover:bg-muted active:scale-95"
              >
                {digit}
              </button>
            )
          )}

          <div />

          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-14 rounded-2xl border border-border bg-card text-lg font-semibold text-card-foreground transition-colors hover:bg-muted active:scale-95"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex h-14 items-center justify-center rounded-2xl border border-border bg-card text-card-foreground transition-colors hover:bg-muted active:scale-95"
            aria-label="Delete PIN digit"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="mt-6 h-14 w-full max-w-xs rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm Purchase
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Your PIN is used to authorize this transaction. It is
        submitted for server-side verification and is not stored
        by this page.
      </p>
    </div>
  );
}

