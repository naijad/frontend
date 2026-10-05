
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

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

type CashFlowPoint = {
  date: Date;
  label: string;
  incoming: number;
  outgoing: number;
};

type Category = {
  name: string;
  amount: number;
  percentage: number;
};

type Recipient = {
  name: string;
  count: number;
  total: number;
};

function money(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function shortMoney(amount: number) {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}m`;
  }

  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return `₦${Math.round(amount)}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getCategory(transaction: BackendTransaction) {
  switch (transaction.type) {
    case "TRANSFER":
      return transaction.direction === "INCOME"
        ? "Money received"
        : "Transfers";

    case "AIRTIME":
      return "Airtime";

    case "DATA":
      return "Data";

    case "ELECTRICITY":
      return "Electricity";

    case "CABLE":
      return "Cable";

    case "DEPOSIT":
      return "Deposits";

    case "WITHDRAWAL":
      return "Withdrawals";

    default:
      return transaction.title || "Other";
  }
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function Trend({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const positive = value >= 0;
  const isGood = inverse ? !positive : positive;

  if (Math.abs(value) < 0.05) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        No change
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isGood ? "text-success" : "text-danger"
      }`}
    >
      {positive ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}

      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function Analytics() {
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("NGN");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [transactionResponse, dashboardResponse] =
          await Promise.all([
            apiRequest<TransactionsResponse>("/transactions"),
            apiRequest<DashboardResponse>("/dashboard"),
          ]);

        if (cancelled) return;

        setTransactions(transactionResponse.data.transactions || []);

        setBalance(
          Number(dashboardResponse.data.account.balance ?? 0)
        );

        setCurrency(
          dashboardResponse.data.account.currency || "NGN"
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.status === "COMPLETED"
      ),
    [transactions]
  );

  const now = new Date();

  const currentMonth = useMemo(
    () => monthKey(now),
    [now]
  );

  const previousMonthDate = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() - 1, 1),
    [now]
  );

  const previousMonth = monthKey(previousMonthDate);

  const currentMonthTransactions = useMemo(
    () =>
      completedTransactions.filter(
        (transaction) =>
          monthKey(new Date(transaction.createdAt)) === currentMonth
      ),
    [completedTransactions, currentMonth]
  );

  const previousMonthTransactions = useMemo(
    () =>
      completedTransactions.filter(
        (transaction) =>
          monthKey(new Date(transaction.createdAt)) === previousMonth
      ),
    [completedTransactions, previousMonth]
  );

  const summary = useMemo(() => {
    const calculate = (items: BackendTransaction[]) => {
      let incoming = 0;
      let outgoing = 0;

      for (const transaction of items) {
        const amount = Math.abs(Number(transaction.amount));
        const fee = Math.abs(Number(transaction.fee));

        if (transaction.direction === "INCOME") {
          incoming += amount;
        } else {
          outgoing += amount + fee;
        }
      }

      return {
        incoming,
        outgoing,
        net: incoming - outgoing,
      };
    };

    const current = calculate(currentMonthTransactions);
    const previous = calculate(previousMonthTransactions);

    return {
      ...current,
      trends: {
        incoming: percentageChange(
          current.incoming,
          previous.incoming
        ),
        outgoing: percentageChange(
          current.outgoing,
          previous.outgoing
        ),
        net: percentageChange(
          Math.abs(current.net),
          Math.abs(previous.net)
        ),
      },
    };
  }, [currentMonthTransactions, previousMonthTransactions]);

  const cashFlow = useMemo<CashFlowPoint[]>(() => {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        index + 1
      );

      const dayTransactions = currentMonthTransactions.filter(
        (transaction) => {
          const transactionDate = new Date(transaction.createdAt);

          return (
            transactionDate.getDate() === date.getDate()
          );
        }
      );

      let incoming = 0;
      let outgoing = 0;

      for (const transaction of dayTransactions) {
        const amount = Math.abs(Number(transaction.amount));
        const fee = Math.abs(Number(transaction.fee));

        if (transaction.direction === "INCOME") {
          incoming += amount;
        } else {
          outgoing += amount + fee;
        }
      }

      return {
        date,
        label: date.toLocaleDateString("en-NG", {
          day: "numeric",
        }),
        incoming,
        outgoing,
      };
    });
  }, [currentMonthTransactions, now]);

  const maxCashFlow = useMemo(() => {
    const values = cashFlow.flatMap((item) => [
      item.incoming,
      item.outgoing,
    ]);

    return Math.max(...values, 1);
  }, [cashFlow]);

  const categories = useMemo<Category[]>(() => {
    const totals = new Map<string, number>();

    for (const transaction of currentMonthTransactions) {
      if (transaction.direction !== "EXPENSE") continue;

      const category = getCategory(transaction);
      const amount =
        Math.abs(Number(transaction.amount)) +
        Math.abs(Number(transaction.fee));

      totals.set(
        category,
        (totals.get(category) || 0) + amount
      );
    }

    const total = [...totals.values()].reduce(
      (sum, amount) => sum + amount,
      0
    );

    return [...totals.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total
          ? (amount / total) * 100
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [currentMonthTransactions]);

  const topRecipients = useMemo<Recipient[]>(() => {
    const recipientMap = new Map<
      string,
      { count: number; total: number }
    >();

    for (const transaction of currentMonthTransactions) {
      if (transaction.direction !== "EXPENSE") continue;

      const name =
        transaction.recipientName ||
        transaction.title ||
        "Unknown recipient";

      const amount =
        Math.abs(Number(transaction.amount)) +
        Math.abs(Number(transaction.fee));

      const existing = recipientMap.get(name);

      if (existing) {
        existing.count += 1;
        existing.total += amount;
      } else {
        recipientMap.set(name, {
          count: 1,
          total: amount,
        });
      }
    }

    return [...recipientMap.entries()]
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [currentMonthTransactions]);

  const monthName = now.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  const previousMonthName = previousMonthDate.toLocaleDateString(
    "en-NG",
    {
      month: "long",
      year: "numeric",
    }
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="h-8 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-muted" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
          <BarChart3 className="mx-auto size-10 text-danger" />

          <h1 className="mt-4 text-xl font-bold">
            Unable to load analytics
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-6 text-primary" />

          <h1 className="text-2xl font-bold tracking-tight">
            Analytics
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Understand your money movement and spending patterns.
        </p>
      </div>

      {/* Current month */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <CalendarDays className="size-4 text-primary" />

        <span className="font-medium">
          {monthName}
        </span>

        <span className="text-muted-foreground">
          compared with {previousMonthName}
        </span>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Money in
            </span>

            <span className="flex size-9 items-center justify-center rounded-full bg-success/10">
              <ArrowDownLeft className="size-4 text-success" />
            </span>
          </div>

          <p className="mt-4 text-xl font-bold">
            {money(summary.incoming, currency)}
          </p>

          <div className="mt-2">
            <Trend value={summary.trends.incoming} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Money out
            </span>

            <span className="flex size-9 items-center justify-center rounded-full bg-danger/10">
              <ArrowUpRight className="size-4 text-danger" />
            </span>
          </div>

          <p className="mt-4 text-xl font-bold">
            {money(summary.outgoing, currency)}
          </p>

          <div className="mt-2">
            <Trend
              value={summary.trends.outgoing}
              inverse
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Net flow
            </span>

            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="size-4 text-primary" />
            </span>
          </div>

          <p
            className={`mt-4 text-xl font-bold ${
              summary.net >= 0
                ? "text-success"
                : "text-danger"
            }`}
          >
            {summary.net >= 0 ? "+" : "-"}
            {money(Math.abs(summary.net), currency)}
          </p>

          <div className="mt-2">
            <Trend value={summary.trends.net} />
          </div>
        </div>
      </section>

      {/* Balance */}
      <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">
              Current balance
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight">
              {money(balance, currency)}
            </p>
          </div>

          <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
            <Wallet className="size-6" />
          </div>
        </div>
      </section>

      {/* Cash flow */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              Cash flow
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Daily money movement for {monthName}.
            </p>
          </div>

          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" />
              In
            </span>

            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-danger" />
              Out
            </span>
          </div>
        </div>

        {currentMonthTransactions.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-center">
            <div>
              <BarChart3 className="mx-auto size-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No activity this month
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Your cash flow will appear here when you make or receive transactions.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex h-52 items-end gap-1 overflow-hidden">
              {cashFlow.map((item) => {
                const incomingHeight =
                  (item.incoming / maxCashFlow) * 100;

                const outgoingHeight =
                  (item.outgoing / maxCashFlow) * 100;

                return (
                  <div
                    key={item.date.toISOString()}
                    className="group flex min-w-0 flex-1 items-end justify-center gap-0.5"
                    title={`${item.date.toLocaleDateString(
                      "en-NG",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}: ${money(
                      item.incoming,
                      currency
                    )} in / ${money(
                      item.outgoing,
                      currency
                    )} out`}
                  >
                    <div
                      className="w-full max-w-2 rounded-t-sm bg-success/70 transition-all group-hover:bg-success"
                      style={{
                        height: `${Math.max(
                          incomingHeight,
                          item.incoming > 0 ? 2 : 0
                        )}%`,
                      }}
                    />

                    <div
                      className="w-full max-w-2 rounded-t-sm bg-danger/70 transition-all group-hover:bg-danger"
                      style={{
                        height: `${Math.max(
                          outgoingHeight,
                          item.outgoing > 0 ? 2 : 0
                        )}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
              <span>1</span>
              <span>7</span>
              <span>14</span>
              <span>21</span>
              <span>
                {cashFlow.length}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Breakdown + recipients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending breakdown */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">
              Spending breakdown
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Where your money went this month.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center text-center">
              <div>
                <Wallet className="mx-auto size-8 text-muted-foreground/50" />

                <p className="mt-3 text-sm font-medium">
                  No spending yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Completed expenses will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">
                      {category.name}
                    </span>

                    <span className="text-muted-foreground">
                      {money(
                        category.amount,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.max(
                          category.percentage,
                          2
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top recipients */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">
              Top recipients
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Your largest outgoing recipients this month.
            </p>
          </div>

          {topRecipients.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center text-center">
              <div>
                <ArrowUpRight className="mx-auto size-8 text-muted-foreground/50" />

                <p className="mt-3 text-sm font-medium">
                  No recipients yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your outgoing transfers will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {topRecipients.map((recipient, index) => (
                <div
                  key={recipient.name}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {recipient.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {recipient.count}{" "}
                      {recipient.count === 1
                        ? "transaction"
                        : "transactions"}
                    </p>
                  </div>

                  <p className="text-right text-sm font-semibold">
                    {shortMoney(recipient.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Transaction count */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
        {completedTransactions.length} completed transaction
        {completedTransactions.length === 1 ? "" : "s"}{" "}
        available in your account history.
      </div>
    </div>
  );
}

