
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";

type BackendTransaction = {
  id: string;
  reference: string;
  type:
    | "TRANSFER"
    | "AIRTIME"
    | "DATA"
    | "ELECTRICITY"
    | "CABLE"
    | "DEPOSIT"
    | "WITHDRAWAL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
  direction: "INCOME" | "EXPENSE";
  title: string;
  description?: string | null;
  amount: string | number;
  fee: string | number;
  currency: string;
  recipientName?: string | null;
  recipientAccount?: string | null;
  recipientBank?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

type TransactionResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: BackendTransaction;
  };
};

type TransactionsResponse = {
  success: boolean;
  message: string;
  data: {
    transactions: BackendTransaction[];
  };
};

type DashboardResponse = {
  success: boolean;
  message: string;
  data: {
    account: {
      balance: string | number;
      currency?: string;
    };
  };
};

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getTransactionLabel(transaction: BackendTransaction) {
  if (transaction.recipientName) return transaction.recipientName;

  if (transaction.type === "DEPOSIT") return "Account deposit";
  if (transaction.type === "WITHDRAWAL") return "Cash withdrawal";

  return transaction.title || "Ajora transaction";
}

function getTransactionType(transaction: BackendTransaction) {
  switch (transaction.type) {
    case "TRANSFER":
      return transaction.direction === "INCOME"
        ? "Money received"
        : "Money transfer";

    case "AIRTIME":
      return "Airtime purchase";

    case "DATA":
      return "Data purchase";

    case "ELECTRICITY":
      return "Electricity bill";

    case "CABLE":
      return "Cable bill";

    case "DEPOSIT":
      return "Account deposit";

    case "WITHDRAWAL":
      return "Withdrawal";

    default:
      return transaction.title || "Transaction";
  }
}

function getStatusConfig(status: BackendTransaction["status"]) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className: "text-success",
        bgClassName: "bg-success/10",
      };

    case "PENDING":
      return {
        label: "Pending",
        icon: Clock3,
        className: "text-warning",
        bgClassName: "bg-warning/10",
      };

    case "FAILED":
    case "REVERSED":
      return {
        label: status === "REVERSED" ? "Reversed" : "Failed",
        icon: XCircle,
        className: "text-danger",
        bgClassName: "bg-danger/10",
      };

    default:
      return {
        label: status,
        icon: Clock3,
        className: "text-muted-foreground",
        bgClassName: "bg-muted",
      };
  }
}

export default function TransactionDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [transaction, setTransaction] =
    useState<BackendTransaction | null>(null);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const transactionId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("id");
  }, [location.search]);

  useEffect(() => {
    if (!transactionId) {
      setError("No transaction was selected.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTransaction() {
      try {
        setLoading(true);
        setError("");

        const [transactionResponse, transactionsResponse, dashboardResponse] =
          await Promise.all([
            apiRequest<TransactionResponse>(
              `/transactions/${encodeURIComponent(transactionId ?? "")}`
            ),
            apiRequest<TransactionsResponse>("/transactions"),
            apiRequest<DashboardResponse>("/dashboard"),
          ]);

        if (cancelled) return;

        const selectedTransaction =
          transactionResponse.data.transaction;

        setTransaction(selectedTransaction);

        /*
         * The backend does not currently return balanceAfter.
         * We calculate it from the current balance by walking
         * backwards through the transaction history.
         */
        const transactions = [...transactionsResponse.data.transactions].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        let runningBalance = Number(
          dashboardResponse.data.account.balance ?? 0
        );

        for (const item of transactions) {
          const amount = Math.abs(Number(item.amount));
          const fee = Math.abs(Number(item.fee));

          const signedAmount =
            item.direction === "INCOME" ? amount : -amount;

          if (item.id === selectedTransaction.id) {
            setBalanceAfter(runningBalance);
            break;
          }

          runningBalance = runningBalance - signedAmount + fee;
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transaction details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransaction();

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const handleCopyReference = async () => {
    if (!transaction?.reference) return;

    try {
      await navigator.clipboard.writeText(transaction.reference);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!transaction) return;

    const amount = Math.abs(Number(transaction.amount));

    const shareText = [
      "Ajora Transaction",
      "",
      `Type: ${getTransactionType(transaction)}`,
      `Amount: ${formatMoney(amount, transaction.currency)}`,
      `Status: ${getStatusConfig(transaction.status).label}`,
      `Reference: ${transaction.reference}`,
      `Date: ${formatDate(transaction.createdAt)}`,
    ].join("\n");

    try {
      setSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: "Ajora Transaction",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1800);
      }
    } catch {
      // User cancelled sharing.
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    if (!transaction) return;

    try {
      setDownloading(true);

      const amount = Math.abs(Number(transaction.amount));
      const fee = Math.abs(Number(transaction.fee));

      const receipt = [
        "AJORA TRANSACTION RECEIPT",
        "==========================",
        "",
        `Transaction: ${getTransactionType(transaction)}`,
        `Status: ${getStatusConfig(transaction.status).label}`,
        `Amount: ${formatMoney(amount, transaction.currency)}`,
        `Fee: ${formatMoney(fee, transaction.currency)}`,
        `Total: ${formatMoney(amount + fee, transaction.currency)}`,
        "",
        `Name: ${getTransactionLabel(transaction)}`,
        transaction.recipientBank
          ? `Bank: ${transaction.recipientBank}`
          : "",
        transaction.recipientAccount
          ? `Account: ${transaction.recipientAccount}`
          : "",
        "",
        `Reference: ${transaction.reference}`,
        `Date: ${formatDate(transaction.createdAt)}`,
        transaction.description
          ? `Description: ${transaction.description}`
          : "",
        balanceAfter !== null
          ? `Balance After: ${formatMoney(
              balanceAfter,
              transaction.currency
            )}`
          : "",
        "",
        "Generated by Ajora.",
      ]
        .filter(Boolean)
        .join("\n");

      const blob = new Blob([receipt], {
        type: "text/plain;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `ajora-${transaction.reference}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } finally {
      window.setTimeout(() => {
        setDownloading(false);
      }, 500);
    }
  };

  const handleRepeat = () => {
    if (!transaction) return;

    if (transaction.type !== "TRANSFER") return;

    navigate("/transfer", {
      state: {
        recipient: {
          name: transaction.recipientName || "",
          accountNumber: transaction.recipientAccount || "",
          bank: transaction.recipientBank || "",
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted" />
          <div className="mx-auto h-8 w-48 rounded bg-muted" />
          <div className="mx-auto h-4 w-32 rounded bg-muted" />

          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-4/5 rounded bg-muted" />
            <div className="h-5 w-3/5 rounded bg-muted" />
            <div className="h-5 w-2/3 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/10">
            <XCircle className="size-7 text-danger" />
          </div>

          <h1 className="mt-4 text-xl font-bold">
            Unable to load transaction
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This transaction could not be found."}
          </p>

          <Button
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const amount = Math.abs(Number(transaction.amount));
  const fee = Math.abs(Number(transaction.fee));
  const total = amount + fee;

  const status = getStatusConfig(transaction.status);
  const StatusIcon = status.icon;

  const isIncoming = transaction.direction === "INCOME";

  const displayAmount = isIncoming
    ? amount
    : -amount;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <span className="text-sm text-muted-foreground">
          Transaction details
        </span>
      </div>

      {/* Status hero */}
      <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <div
          className={`mx-auto flex size-20 items-center justify-center rounded-full ${status.bgClassName}`}
        >
          <StatusIcon className={`size-10 ${status.className}`} />
        </div>

        <p className="mt-5 text-sm font-medium text-muted-foreground">
          {getTransactionType(transaction)}
        </p>

        <h1
          className={`mt-2 text-3xl font-bold tracking-tight ${
            isIncoming ? "text-success" : "text-foreground"
          }`}
        >
          {isIncoming ? "+" : "-"}
          {formatMoney(amount, transaction.currency)}
        </h1>

        <p className={`mt-2 text-sm font-medium ${status.className}`}>
          {status.label}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </p>
      </section>

      {/* Main details */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Transaction information</h2>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-muted-foreground">
              {isIncoming ? "Received from" : "Sent to"}
            </span>

            <div className="text-right">
              <p className="font-medium">
                {getTransactionLabel(transaction)}
              </p>

              {transaction.recipientBank ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {transaction.recipientBank}
                </p>
              ) : null}
            </div>
          </div>

          {transaction.recipientAccount ? (
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-sm text-muted-foreground">
                Account
              </span>

              <span className="font-medium">
                {transaction.recipientAccount}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-muted-foreground">
              Transaction type
            </span>

            <span className="font-medium">
              {getTransactionType(transaction)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-muted-foreground">
              Amount
            </span>

            <span className="font-medium">
              {formatMoney(amount, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-muted-foreground">
              Fee
            </span>

            <span className="font-medium">
              {formatMoney(fee, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 bg-muted/30 px-5 py-4">
            <span className="font-medium">
              Total
            </span>

            <span className="font-bold">
              {formatMoney(total, transaction.currency)}
            </span>
          </div>

          {balanceAfter !== null ? (
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-sm text-muted-foreground">
                Balance after
              </span>

              <span className="font-medium">
                {formatMoney(balanceAfter, transaction.currency)}
              </span>
            </div>
          ) : null}

          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Reference
              </span>

              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex max-w-[65%] items-center gap-2 text-right font-medium transition-colors hover:text-primary"
              >
                <span className="truncate">
                  {transaction.reference}
                </span>

                <Copy className="size-4 shrink-0" />
              </button>
            </div>

            {copied ? (
              <p className="mt-2 text-right text-xs text-success">
                Copied to clipboard
              </p>
            ) : null}
          </div>

          {transaction.description ? (
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Description
              </p>

              <p className="mt-1 text-sm font-medium">
                {transaction.description}
              </p>
            </div>
          ) : null}

          {transaction.metadata?.memo ? (
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Memo
              </p>

              <p className="mt-1 text-sm font-medium">
                {String(transaction.metadata.memo)}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Security card */}
      <div className="flex gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" />
        </div>

        <div>
          <p className="font-medium">Secure transaction</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            This transaction is recorded securely on your Ajora account.
            Keep your transaction reference for future support requests.
          </p>
        </div>
      </div>

      {/* Actions */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12"
            onClick={handleShare}
            disabled={sharing}
          >
            <Share2 className="size-4" />
            {sharing ? "Sharing..." : "Share"}
          </Button>

          <Button
            variant="outline"
            className="h-12"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="size-4" />
            {downloading ? "Saving..." : "Download"}
          </Button>
        </div>

        {transaction.type === "TRANSFER" &&
        transaction.status === "COMPLETED" &&
        !isIncoming ? (
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={handleRepeat}
          >
            <RefreshCw className="size-4" />
            Send again
          </Button>
        ) : null}

        {transaction.status === "FAILED" ||
        transaction.status === "REVERSED" ? (
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => navigate("/transfer")}
          >
            <RefreshCw className="size-4" />
            Try another transfer
          </Button>
        ) : null}

        <Button
          variant="ghost"
          className="h-12 w-full text-muted-foreground"
          onClick={() =>
            window.alert(
              "Please contact Ajora support and provide your transaction reference."
            )
          }
        >
          <FileText className="size-4" />
          Report an issue
        </Button>
      </section>

      {/* Signed amount kept available for future UI logic */}
      <span className="sr-only">{displayAmount}</span>
    </div>
  );
}

