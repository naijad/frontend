
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Phone,
  Smartphone,
} from "lucide-react";

import { formatNaira } from "@/lib/format";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Network = {
  id: "MTN" | "AIRTEL" | "GLO" | "9MOBILE";
  name: string;
  shortName: string;
};

type DashboardResponse = {
  success: boolean;
  data: {
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    };
  };
};

const NETWORKS: Network[] = [
  { id: "MTN", name: "MTN", shortName: "MTN" },
  { id: "AIRTEL", name: "Airtel", shortName: "Airtel" },
  { id: "GLO", name: "Glo", shortName: "Glo" },
  { id: "9MOBILE", name: "9mobile", shortName: "9mobile" },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (/^0[789]\d{9}$/.test(digits)) return true;
  if (/^[789]\d{9}$/.test(digits)) return true;
  if (/^234[789]\d{9}$/.test(digits)) return true;

  return false;
}

function toInternationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (/^0[789]\d{9}$/.test(digits)) {
    return `234${digits.slice(1)}`;
  }

  if (/^[789]\d{9}$/.test(digits)) {
    return `234${digits}`;
  }

  if (/^234[789]\d{9}$/.test(digits)) {
    return digits;
  }

  return digits;
}

export default function Airtime() {
  const navigate = useNavigate();

  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [error, setError] = useState("");

  const numericAmount = Number(amount.replace(/,/g, "")) || 0;

  const selectedNetwork = useMemo(
    () => NETWORKS.find((item) => item.id === network) ?? null,
    [network],
  );

  useEffect(() => {
    let mounted = true;

    async function loadBalance() {
      try {
        setLoadingBalance(true);
        setError("");

        const response = await apiRequest<DashboardResponse>(
          "/dashboard",
          { method: "GET" },
        );

        if (!mounted) return;

        const currentBalance = Number(
          response?.data?.account?.balance ?? 0,
        );

        setBalance(
          Number.isFinite(currentBalance) ? currentBalance : 0,
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your account balance.",
        );
      } finally {
        if (mounted) setLoadingBalance(false);
      }
    }

    void loadBalance();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");

    setAmount(
      cleaned ? Number(cleaned).toLocaleString("en-NG") : "",
    );
    setError("");
  };

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhoneNumber(value));
    setError("");
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toLocaleString("en-NG"));
    setError("");
  };

  const handleContinue = () => {
    setError("");

    if (!selectedNetwork) {
      setError("Please select a network.");
      return;
    }

    if (!isValidNigerianPhone(phone)) {
      setError("Please enter a valid Nigerian mobile phone number.");
      return;
    }

    if (numericAmount < 100) {
      setError("Minimum airtime purchase is ₦100.");
      return;
    }

    if (numericAmount > 100000) {
      setError("Maximum airtime purchase is ₦100,000.");
      return;
    }

    if (numericAmount > balance) {
      setError("Insufficient balance for this airtime purchase.");
      return;
    }

    navigate("/airtime/confirm", {
      state: {
        network: selectedNetwork.id,
        networkName: selectedNetwork.name,
        phone: toInternationalPhone(phone),
        displayPhone: phone,
        amount: numericAmount,
        fee: 0,
        total: numericAmount,
      },
    });
  };

  const networkStyles = {
    MTN: {
      container:
        "border-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20",
      icon: "bg-yellow-400 text-black",
      text: "text-yellow-700 dark:text-yellow-300",
      ring: "ring-yellow-400/40",
      selectedBorder: "border-yellow-500",
    },
    AIRTEL: {
      container:
        "border-red-500 bg-red-500/10 hover:bg-red-500/20",
      icon: "bg-red-500 text-white",
      text: "text-red-600 dark:text-red-400",
      ring: "ring-red-500/40",
      selectedBorder: "border-red-500",
    },
    GLO: {
      container:
        "border-green-300 bg-green-300/10 hover:bg-green-300/20",
      icon: "bg-green-300 text-green-950",
      text: "text-green-700 dark:text-green-300",
      ring: "ring-green-300/40",
      selectedBorder: "border-green-400",
    },
    "9MOBILE": {
      container:
        "border-green-500 bg-gradient-to-br from-black via-black to-green-600 hover:from-black hover:via-green-950 hover:to-green-500",
      icon: "bg-gradient-to-br from-black to-green-500 text-white",
      text: "text-white",
      ring: "ring-green-500/50",
      selectedBorder: "border-green-400",
    },
  } as const;

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-background px-4 pb-10 pt-6 text-foreground">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-foreground">
            Buy Airtime
          </h1>
          <p className="text-sm text-muted-foreground">
            Recharge any Nigerian network
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6 rounded-3xl border border-border bg-card p-5 text-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Available balance
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {loadingBalance ? "Loading..." : formatNaira(balance)}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Network */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold text-foreground">
          Select network
        </label>

        <div className="grid grid-cols-2 gap-3">
          {NETWORKS.map((item) => {
            const selected = network === item.id;
            const style = networkStyles[item.id];

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setNetwork(item.id);
                  setError("");
                }}
                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${style.container} ${
                  selected
                    ? `${style.selectedBorder} -translate-y-0.5 ring-2 ${style.ring} shadow-md`
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}
                  >
                    <Smartphone className="h-5 w-5" />
                  </div>

                  {selected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[11px] font-bold text-black shadow-sm">
                      ✓
                    </div>
                  )}
                </div>

                <p className={`mt-3 text-sm font-semibold ${style.text}`}>
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label
          htmlFor="airtime-phone"
          className="mb-3 block text-sm font-semibold text-foreground"
        >
          Phone number
        </label>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="airtime-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(event) => handlePhoneChange(event.target.value)}
            className="h-14 rounded-2xl border-border bg-background pl-12 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label
          htmlFor="airtime-amount"
          className="mb-3 block text-sm font-semibold text-foreground"
        >
          Amount
        </label>

        <Input
          id="airtime-amount"
          type="text"
          inputMode="numeric"
          placeholder="₦0"
          value={amount ? `₦${amount}` : ""}
          onChange={(event) => handleAmountChange(event.target.value)}
          className="h-14 rounded-2xl border-border bg-background text-lg font-semibold text-foreground placeholder:text-muted-foreground"
        />

        <div className="mt-3 grid grid-cols-5 gap-2">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => handleQuickAmount(quickAmount)}
              className="rounded-xl border border-border bg-card px-2 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              ₦{quickAmount.toLocaleString("en-NG")}
            </button>
          ))}
        </div>
      </div>

      {/* Continue */}
      <Button
        type="button"
        onClick={handleContinue}
        disabled={loadingBalance}
        className="h-14 w-full rounded-2xl text-base font-semibold"
      >
        Continue
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Your transaction is secured by Ajora.
      </p>
    </div>
  );
}