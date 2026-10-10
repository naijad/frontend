
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ShieldCheck,
} from "lucide-react";

import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";

export type DataPurchaseState = {
  network: "MTN" | "AIRTEL" | "GLO" | "9MOBILE";
  networkName: string;
  phone: string;
  displayPhone: string;
  bundleId: string;
  variationCode: string;
  bundleName: string;
  validity: string;
  amount: number;
  fee: number;
  total: number;
};

export default function DataConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const purchase = location.state as DataPurchaseState | null;

  useEffect(() => {
    if (
      !purchase ||
      !purchase.network ||
      !purchase.phone ||
      !purchase.variationCode ||
      !purchase.bundleName ||
      !Number.isFinite(Number(purchase.total)) ||
      Number(purchase.total) <= 0
    ) {
      navigate("/data", { replace: true });
    }
  }, [purchase, navigate]);

  if (
    !purchase ||
    !purchase.network ||
    !purchase.phone ||
    !purchase.variationCode ||
    !purchase.bundleName ||
    !Number.isFinite(Number(purchase.total)) ||
    Number(purchase.total) <= 0
  ) {
    return null;
  }

  const details = [
    { label: "Network", value: purchase.networkName },
    { label: "Phone number", value: purchase.displayPhone },
    { label: "Data bundle", value: purchase.bundleName },
    { label: "Validity", value: purchase.validity },
    { label: "Data price", value: formatNaira(purchase.amount) },
    { label: "Service fee", value: formatNaira(purchase.fee) },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-[#0D0D16] dark:text-white sm:px-6">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => navigate("/data")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
        >
          <ArrowLeft size={18} />
          Back to data
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Database size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold">Review data purchase</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Check your selected plan before proceeding.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151522] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selected bundle
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {purchase.bundleName}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {purchase.networkName}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Database size={23} />
            </div>
          </div>

          <div className="space-y-4">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="text-right font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="my-5 border-t border-dashed border-gray-200 dark:border-white/10" />

          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-violet-600 dark:text-violet-400">
              {formatNaira(purchase.total)}
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-violet-300/70 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-400/10">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-400"
              />
              <div>
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-300">
                  Secure purchase
                </p>
                <p className="mt-1 text-sm leading-6 text-violet-800 dark:text-violet-200/80">
                  Review the network, recipient, bundle and amount carefully.
                  You will be asked to enter your transaction PIN before
                  the purchase request is submitted.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() =>
              navigate("/data/pin", { state: purchase })
            }
          >
            Continue to PIN
            <CheckCircle2 size={18} className="ml-2" />
          </Button>

          <button
            type="button"
            onClick={() => navigate("/data")}
            className="mt-4 w-full text-sm text-gray-500 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
          >
            Change bundle
          </button>
        </section>
      </div>
    </main>
  );
}
