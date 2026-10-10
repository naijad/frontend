
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  History,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DataPurchaseState } from "./DataConfirmation";

type DataApiResult = {
  success?: boolean;
  status?: string;
  reference?: string;
  transactionReference?: string;
  amount?: number | string;
  balanceAfter?: number | string;
  createdAt?: string;
  transaction?: {
    id?: string;
    reference?: string;
    status?: string;
    amount?: number | string;
    balanceAfter?: number | string;
    createdAt?: string;
  };
};

type DataSuccessRouteState = {
  purchase?: DataPurchaseState;
  result?: DataApiResult;
};

function getStatus(result: DataApiResult): string {
  return String(
    result.status ?? result.transaction?.status ?? "",
  ).trim().toUpperCase();
}

function formatNaira(value: number | string | undefined): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DataSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state as DataSuccessRouteState | null;
  const purchase = routeState?.purchase;
  const result = routeState?.result;

  const status = result ? getStatus(result) : "";
  const isConfirmedSuccess = [
    "COMPLETED",
    "SUCCESS",
    "SUCCESSFUL",
  ].includes(status);

  useEffect(() => {
    if (!purchase || !result || !isConfirmedSuccess) {
      navigate("/transactions", { replace: true });
    }
  }, [purchase, result, isConfirmedSuccess, navigate]);

  if (!purchase || !result || !isConfirmedSuccess) {
    return null;
  }

  const reference =
    result.reference ??
    result.transactionReference ??
    result.transaction?.reference ??
    result.transaction?.id;

  const transactionDate =
    result.createdAt ?? result.transaction?.createdAt;

  const balanceAfter =
    result.balanceAfter ?? result.transaction?.balanceAfter;

  const amountPaid =
    result.transaction?.amount ?? result.amount ?? purchase.total;

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

        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#151522] sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400">
            <CheckCircle2 size={36} />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Purchase successful
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Data purchase completed
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
            The backend has confirmed your data purchase for{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {purchase.displayPhone}
            </span>
            .
          </p>

          <div className="mt-7 rounded-2xl border border-gray-200 p-5 text-left dark:border-white/10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Amount paid
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatNaira(amountPaid)}
            </p>

            <div className="my-5 border-t border-dashed border-gray-200 dark:border-white/10" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Database size={23} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold">{purchase.networkName}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {purchase.bundleName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {purchase.displayPhone}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {purchase.validity}
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-gray-200 dark:border-white/10" />

            {reference && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction reference
                </p>
                <p className="mt-1 break-all text-sm font-medium">
                  {reference}
                </p>
              </div>
            )}

            {transactionDate && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction date
                </p>
                <p className="mt-1 text-sm font-medium">
                  {Number.isNaN(Date.parse(transactionDate))
                    ? transactionDate
                    : new Date(transactionDate).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                </p>
              </div>
            )}

            {balanceAfter !== undefined && balanceAfter !== null && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Balance after purchase
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatNaira(balanceAfter)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-300/70 bg-emerald-50 p-4 text-left dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400"
            />
            <p className="text-sm leading-6 text-emerald-900 dark:text-emerald-200">
              Keep your transaction reference for your records. Your purchase
              status was confirmed by the backend.
            </p>
          </div>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() => navigate("/data")}
          >
            Buy data again
          </Button>

          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
          >
            <History size={17} />
            View transaction history
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
          >
            <ReceiptText size={17} />
            Print receipt
          </button>
        </section>
      </div>
    </main>
  );
}
