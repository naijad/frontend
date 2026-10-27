
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Database,
  Phone,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import { formatNaira } from "@/lib/format";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Network = {
  id: "MTN" | "AIRTEL" | "GLO" | "9MOBILE";
  name: string;
};

type DataBundle = {
  id: string;
  variationCode: string;
  name: string;
  price: number;
  fixedPrice?: boolean;
};

type DataBundlesResponse = {
  success: boolean;
  message?: string;
  data: {
    network: Network["id"];
    networkName: string;
    serviceId: string;
    bundles: DataBundle[];
  };
};

type DashboardResponse = {
  success: boolean;
  data: {
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    } | null;
  };
};

const NETWORKS: Network[] = [
  { id: "MTN", name: "MTN" },
  { id: "AIRTEL", name: "Airtel" },
  { id: "GLO", name: "Glo" },
  { id: "9MOBILE", name: "9mobile" },
];

const NETWORK_STYLES = {
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

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return (
    (digits.length === 11 && digits.startsWith("0")) ||
    (digits.length === 13 && digits.startsWith("234"))
  );
}

function toInternationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  return digits;
}

function getBundleName(bundle: DataBundle) {
  return bundle.name?.trim() || bundle.variationCode;
}

/**
 * VTpass may occasionally return duplicate catalogue entries.
 * variationCode is the identifier used when submitting the purchase,
 * so retain only the first valid entry for each variationCode.
 */
function normalizeBundles(receivedBundles: DataBundle[]): DataBundle[] {
  const uniqueBundles = new Map<string, DataBundle>();

  for (const bundle of receivedBundles) {
    if (
      !bundle ||
      typeof bundle.id !== "string" ||
      !bundle.id.trim() ||
      typeof bundle.variationCode !== "string" ||
      !bundle.variationCode.trim()
    ) {
      continue;
    }

    const variationCode = bundle.variationCode.trim();
    const price = Number(bundle.price);

    if (!Number.isFinite(price) || price <= 0) {
      continue;
    }

    if (uniqueBundles.has(variationCode)) {
      continue;
    }

    uniqueBundles.set(variationCode, {
      ...bundle,
      id: bundle.id.trim(),
      variationCode,
      name:
        typeof bundle.name === "string" && bundle.name.trim()
          ? bundle.name.trim()
          : variationCode,
      price,
    });
  }

  return Array.from(uniqueBundles.values());
}

export default function Data() {
  const navigate = useNavigate();

  const [network, setNetwork] = useState<Network["id"] | "">("");
  const [phone, setPhone] = useState("");

  // Store the provider's variation code, which identifies the actual plan.
  const [selectedBundleId, setSelectedBundleId] = useState("");

  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [error, setError] = useState("");
  const [bundleError, setBundleError] = useState("");

  const selectedNetwork = useMemo(
    () => NETWORKS.find((item) => item.id === network) ?? null,
    [network],
  );

  const selectedBundle = useMemo(
    () =>
      bundles.find(
        (bundle) => bundle.variationCode === selectedBundleId,
      ) ?? null,
    [bundles, selectedBundleId],
  );

  // Load the user's current wallet balance.
  useEffect(() => {
    let mounted = true;

    async function loadBalance() {
      try {
        setLoadingBalance(true);

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

  // Load and normalize the live catalogue whenever the network changes.
  useEffect(() => {
    let mounted = true;

    async function loadBundles(selectedNetworkId: Network["id"]) {
      try {
        setLoadingBundles(true);
        setBundleError("");
        setBundles([]);
        setSelectedBundleId("");

        const response = await apiRequest<DataBundlesResponse>(
          `/data/bundles?network=${encodeURIComponent(selectedNetworkId)}`,
          { method: "GET" },
        );

        if (!mounted) return;

        const receivedBundles = response?.data?.bundles;

        if (!response?.success || !Array.isArray(receivedBundles)) {
          throw new Error(
            "The server returned an invalid data bundle list.",
          );
        }

        const validBundles = normalizeBundles(receivedBundles);

        setBundles(validBundles);

        if (validBundles.length === 0) {
          setBundleError(
            "No data plans are currently available for this network. Please try again later.",
          );
        }
      } catch (err) {
        if (!mounted) return;

        setBundles([]);
        setBundleError(
          err instanceof Error
            ? err.message
            : "Unable to load live data plans. Please try again.",
        );
      } finally {
        if (mounted) setLoadingBundles(false);
      }
    }

    if (network) {
      void loadBundles(network);
    } else {
      setBundles([]);
      setSelectedBundleId("");
      setBundleError("");
      setLoadingBundles(false);
    }

    return () => {
      mounted = false;
    };
  }, [network]);

  const handleContinue = () => {
    setError("");

    if (!selectedNetwork) {
      setError("Please select a mobile network.");
      return;
    }

    if (!isValidNigerianPhone(phone)) {
      setError("Please enter a valid Nigerian phone number.");
      return;
    }

    if (loadingBundles) {
      setError("Please wait while the available data plans load.");
      return;
    }

    if (!selectedBundle) {
      setError("Please select an available data bundle.");
      return;
    }

    if (selectedBundle.price <= 0) {
      setError(
        "This data plan has an invalid price and cannot be purchased.",
      );
      return;
    }

    if (selectedBundle.price > balance) {
      setError("Insufficient balance for this data purchase.");
      return;
    }

    navigate("/data/confirm", {
      state: {
        network: selectedNetwork.id,
        networkName: selectedNetwork.name,
        phone: toInternationalPhone(phone),
        displayPhone: phone,
        bundleId: selectedBundle.id,
        variationCode: selectedBundle.variationCode,
        bundleName: getBundleName(selectedBundle),
        validity: "As specified by the network provider",
        amount: selectedBundle.price,
        fee: 0,
        total: selectedBundle.price,
      },
    });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-10 pt-6">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold">Buy Data</h1>
          <p className="text-sm text-muted-foreground">
            Choose a data bundle for any Nigerian network
          </p>
        </div>
      </div>

      {/* Wallet balance */}
      <div className="mb-6 rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Available balance
            </p>
            <p className="mt-1 text-2xl font-bold">
              {loadingBalance ? "Loading..." : formatNaira(balance)}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* General errors */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Network selection */}
      <section className="mb-6">
        <label className="mb-3 block text-sm font-semibold">
          Select network
        </label>

        <div className="grid grid-cols-2 gap-3">
          {NETWORKS.map((item) => {
            const selected = network === item.id;
            const style = NETWORK_STYLES[item.id];

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setNetwork(item.id);
                  setSelectedBundleId("");
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
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-black shadow-sm">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <p className={`mt-3 text-sm font-semibold ${style.text}`}>
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recipient phone */}
      <section className="mb-6">
        <label
          htmlFor="data-phone"
          className="mb-3 block text-sm font-semibold"
        >
          Phone number
        </label>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="data-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(event) => {
              setPhone(normalizePhoneNumber(event.target.value));
              setError("");
            }}
            className="h-14 rounded-2xl pl-12"
          />
        </div>
      </section>

      {/* Live bundle catalogue */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label className="text-sm font-semibold">
            Choose a data plan
          </label>

          {selectedNetwork && (
            <span className="text-xs text-muted-foreground">
              {selectedNetwork.name}
            </span>
          )}
        </div>

        {!network ? (
          <div className="rounded-2xl border border-dashed p-6 text-center">
            <Database className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">
              Select a network first
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Available plans will be loaded from the provider.
            </p>
          </div>
        ) : loadingBundles ? (
          <div className="rounded-2xl border p-6 text-center">
            <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Loading available data plans...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fetching the latest catalogue for {selectedNetwork?.name}.
            </p>
          </div>
        ) : bundleError ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-center"
          >
            <p className="text-sm text-destructive">{bundleError}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => {
                const currentNetwork = network;
                setNetwork("");
                window.setTimeout(() => setNetwork(currentNetwork), 0);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bundles.map((bundle) => {
              const selected =
                selectedBundleId === bundle.variationCode;

              return (
                <button
                  key={bundle.variationCode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSelectedBundleId(bundle.variationCode);
                    setError("");
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold">
                        {getBundleName(bundle)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Provider data plan
                      </p>
                    </div>

                    {selected && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="font-bold">
                      {formatNaira(bundle.price)}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Live plan
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected plan summary */}
      {selectedBundle && (
        <div className="mb-6 rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold">Purchase summary</p>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Data bundle</span>
            <span className="text-right font-medium">
              {getBundleName(selectedBundle)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span>{selectedNetwork?.name}</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span>{phone || "Not entered"}</span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold">
              {formatNaira(selectedBundle.price)}
            </span>
          </div>
        </div>
      )}

      {/* Continue */}
      <Button
        type="button"
        onClick={handleContinue}
        disabled={
          loadingBalance ||
          loadingBundles ||
          !network ||
          !selectedBundle
        }
        className="h-14 w-full rounded-2xl text-base font-semibold"
      >
        Continue
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Review your purchase before confirming. Your selected plan and
        price will be passed to the confirmation screen.
      </p>
    </div>
  );
}
