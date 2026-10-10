
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Gift,
  Phone,
  Smartphone,
  Store,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import type {
  Transaction,
  TransactionType,
} from "@/lib/mock-data";

import PageHeader from "@/components/shared/PageHeader";
import SectionHeader from "@/components/shared/SectionHeader";
import BalanceCard from "@/components/shared/BalanceCard";
import QuickAction from "@/components/shared/QuickAction";
import type { Tone } from "@/components/shared/tones";
import TransactionRow from "@/components/shared/TransactionRow";
import StatCard from "@/components/shared/StatCard";

type BackendTransaction = {
  id: string;
  reference: string;
  type: string;
  status: string;
  direction: string;
  title: string;
  description?: string | null;
  amount: string;
  fee: string;
  currency: string;
  recipientName?: string | null;
  recipientAccount?: string | null;
  recipientBank?: string | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt?: string;
};

type DashboardResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    } | null;
    recentTransactions: BackendTransaction[];
  };
};

type BonusStatusResponse = {
  success: boolean;
  data: {
    eligible: boolean;
    claimed: boolean;
    amount: number;
    claimedAt: string | null;
  };
};

type BonusClaimResponse = {
  success: boolean;
  message: string;
  bonus: {
    amount: number;
    reference: string;
    status: string;
    claimedAt: string;
  };
  account: {
    accountNumber: string;
    balance: string;
    currency: string;
  };
};

function mapType(
  transaction: BackendTransaction,
): TransactionType {
  const raw = transaction.type.toLowerCase();
  const direction = transaction.direction.toLowerCase();

  if (raw === "transfer") {
    return direction === "income"
      ? "received"
      : "sent";
  }

  if (raw === "deposit") return "topup";
  if (raw === "withdrawal") return "sent";
  if (raw === "airtime") return "airtime";
  if (raw === "data") return "data";

  if (
    raw === "electricity" ||
    raw === "cable"
  ) {
    return "bill";
  }

  return direction === "income"
    ? "received"
    : "sent";
}

function mapTransaction(
  transaction: BackendTransaction,
): Transaction {
  const direction =
    transaction.direction.toLowerCase();

  const amount = Number(transaction.amount);

  return {
    id: transaction.id,

    type: mapType(transaction),

    counterparty:
      transaction.recipientName ||
      transaction.title ||
      "Ajora transaction",

    counterpartyBank:
      transaction.recipientBank || undefined,

    counterpartyAccount:
      transaction.recipientAccount || undefined,

    reference: transaction.reference,

    memo:
      transaction.description || undefined,

    timestamp: new Date(
      transaction.createdAt,
    ),

    amount:
      direction === "income"
        ? Math.abs(amount)
        : -Math.abs(amount),

    fee: Number(transaction.fee || 0),

    balanceAfter: 0,

    status:
      transaction.status.toLowerCase() ===
      "reversed"
        ? "failed"
        : (transaction.status.toLowerCase() as Transaction["status"]),
  };
}

const quickActions: {
  icon: typeof Phone;
  label: string;
  tone: Tone;
  to: string;
}[] = [
  {
    icon: Phone,
    label: "Airtime",
    tone: "info",
    to: "/airtime",
  },
  {
    icon: Smartphone,
    label: "Data",
    tone: "success",
    to: "/data",
  },
  {
    icon: Zap,
    label: "Bills",
    tone: "warning",
    to: "/bills",
  },
  {
    icon: Store,
    label: "Pay merchant",
    tone: "primary",
    to: "/merchant",
  },
];

const segmentColor: Record<
  string,
  string
> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
};

function SpendingBreakdown({
  breakdown,
}: {
  breakdown: {
    category: string;
    amount: number;
    color: string;
  }[];
}) {
  const total = breakdown.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (
    !total ||
    breakdown.length === 0
  ) {
    return (
      <p className="py-4 text-xs text-muted-foreground">
        No spending recorded this month.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        {breakdown.map((item) => (
          <div
            key={item.category}
            className={
              segmentColor[item.color] ??
              "bg-primary"
            }
            style={{
              width: `${
                (item.amount / total) * 100
              }%`,
            }}
          />
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {breakdown.map((item) => (
          <li
            key={item.category}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  segmentColor[item.color] ??
                    "bg-primary",
                )}
              />

              {item.category}
            </span>

            <span className="tabular-nums">
              {formatNaira(item.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  /*
   * ============================================================
   * BALANCE VISIBILITY
   * ============================================================
   */

  const [showBalance, setShowBalance] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ajora-show-balance",
        );

      return saved !== "false";
    });

  function toggleBalanceVisibility() {
    setShowBalance((current) => {
      const next = !current;

      localStorage.setItem(
        "ajora-show-balance",
        String(next),
      );

      return next;
    });
  }

  const [loading, setLoading] =
    useState(true);

  const [dashboard, setDashboard] =
    useState<
      DashboardResponse["data"] | null
    >(null);

  /*
   * ============================================================
   * BONUS STATE
   * ============================================================
   */

  const [bonusEligible, setBonusEligible] =
    useState(false);

  const [bonusAmount, setBonusAmount] =
    useState(1000);

  const [bonusLoading, setBonusLoading] =
    useState(false);

  const [bonusStatusLoading, setBonusStatusLoading] =
    useState(true);

  const [bonusError, setBonusError] =
    useState("");

  const [bonusClaimed, setBonusClaimed] =
    useState(false);

  /*
   * ============================================================
   * LOAD DASHBOARD
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const response =
          await apiRequest<DashboardResponse>(
            "/dashboard",
          );

        if (!mounted) return;

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadBonusStatus() {
      try {
        setBonusStatusLoading(true);

        const response =
          await apiRequest<BonusStatusResponse>(
            "/bonus/status",
          );

        if (!mounted) return;

        const bonus =
          response.data;

        console.log(
          "Ajora bonus status:",
          bonus,
        );

        setBonusAmount(
          bonus.amount || 1000,
        );

        setBonusClaimed(
          Boolean(bonus.claimed),
        );

        setBonusEligible(
          Boolean(
            bonus.eligible &&
              !bonus.claimed,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load bonus status:",
          error,
        );

        if (mounted) {
          setBonusEligible(false);
        }
      } finally {
        if (mounted) {
          setBonusStatusLoading(false);
        }
      }
    }

    loadDashboard();
    loadBonusStatus();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * CLAIM BONUS
   * ============================================================
   */

  async function handleClaimBonus() {
    if (bonusLoading) return;

    setBonusLoading(true);
    setBonusError("");

    try {
      const response =
        await apiRequest<BonusClaimResponse>(
          "/bonus/claim",
          {
            method: "POST",
          },
        );

      /*
       * Immediately update displayed balance.
       */
      setDashboard((current) => {
        if (!current) {
          return current;
        }

        if (!current.account) {
          return current;
        }

        return {
          ...current,
          account: {
            ...current.account,
            balance:
              response.account.balance,
          },
        };
      });

      /*
       * Immediately hide popup.
       */
      setBonusClaimed(true);
      setBonusEligible(false);

      /*
       * Refresh dashboard so the new bonus
       * transaction appears in recent activity.
       */
      try {
        const refreshed =
          await apiRequest<DashboardResponse>(
            "/dashboard",
          );

        setDashboard(
          refreshed.data,
        );
      } catch (refreshError) {
        console.error(
          "Failed to refresh dashboard after bonus claim:",
          refreshError,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to claim your app bonus.";

      setBonusError(message);
    } finally {
      setBonusLoading(false);
    }
  }

  /*
   * ============================================================
   * TRANSACTIONS
   * ============================================================
   */

  const transactions = useMemo(
    () =>
      (
        dashboard?.recentTransactions ?? []
      ).map(mapTransaction),
    [dashboard],
  );

  /*
   * ============================================================
   * SPENDING
   * ============================================================
   */

  const spending = useMemo(() => {
    const currentMonth = new Date();

    const month =
      currentMonth.getMonth();

    const year =
      currentMonth.getFullYear();

    const current = transactions.filter(
      (transaction) =>
        transaction.timestamp.getMonth() ===
          month &&
        transaction.timestamp.getFullYear() ===
          year &&
        transaction.amount < 0,
    );

    const categories = new Map<
      string,
      number
    >();

    for (const transaction of current) {
      const category =
        transaction.type === "sent"
          ? "Transfers"
          : transaction.type === "airtime"
            ? "Airtime"
            : transaction.type === "data"
              ? "Data"
              : transaction.type === "bill"
                ? "Bills"
                : "Other";

      categories.set(
        category,
        (categories.get(category) ?? 0) +
          Math.abs(transaction.amount),
      );
    }

    const colors = [
      "primary",
      "info",
      "success",
      "warning",
    ];

    return Array.from(
      categories.entries(),
    ).map(
      (
        [category, amount],
        index,
      ) => ({
        category,
        amount,
        color:
          colors[
            index % colors.length
          ],
      }),
    );
  }, [transactions]);

  const monthlyTotal =
    spending.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    );

  const firstName =
    dashboard?.user.firstName ??
    "there";

  const balance = Number(
    dashboard?.account?.balance ?? 0,
  );

  const accountNumber =
    dashboard?.account
      ?.accountNumber ?? "";

  return (
    <>
      <div className="space-y-6 lg:grid lg:auto-rows-min lg:grid-cols-5 lg:gap-6 lg:space-y-0">
        {/* Greeting */}
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <PageHeader
            heading={`${getGreeting()}, ${firstName} 👋`}
            subheading="Here's what's happening with your money today."
            action={
              <button
                type="button"
                aria-label="Notifications"
                className="relative hidden h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
              >
                <Bell className="size-5" />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </button>
            }
          />
        </div>

        {/* Balance */}
        <div className="lg:col-span-3 lg:col-start-1 lg:row-start-2">
          <BalanceCard
            balance={balance}
            variant="hero"
            accountNumber={accountNumber}
            hidden={!showBalance}
            onToggleVisibility={
              toggleBalanceVisibility
            }
          />
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-3">
          <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map(
                (action) => (
                  <QuickAction
                    key={action.label}
                    {...action}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3 lg:col-start-1 lg:row-start-4">
          <div className="rounded-xl border border-border bg-background p-4 sm:p-6">
            <SectionHeader
              title="Recent activity"
              action={{
                label: "See all",
                to: "/transactions",
              }}
            />

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading your activity...
              </p>
            ) : transactions.length > 0 ? (
              <div className="mt-1 divide-y divide-border">
                {transactions
                  .slice(0, 5)
                  .map(
                    (transaction) => (
                      <TransactionRow
                        key={
                          transaction.id
                        }
                        transaction={
                          transaction
                        }
                        onClick={() =>
                          navigate(
                            `/transactions/details?id=${transaction.id}`,
                          )
                        }
                      />
                    ),
                  )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity yet — send your first ₦ to get started
              </p>
            )}
          </div>
        </div>

        {/* Spending */}
        <div className="lg:col-span-2 lg:col-start-4 lg:row-start-2">
          <StatCard
            label="Spending this month"
            value={formatNaira(
              monthlyTotal,
            )}
            chart={
              <SpendingBreakdown
                breakdown={spending}
              />
            }
            action={{
              label: "View insights",
              to: "/analytics",
            }}
          />
        </div>

        {/* Account snapshot + offline */}
        <div className="space-y-6 lg:col-span-2 lg:col-start-4 lg:row-start-4">
          <div className="rounded-xl border border-border bg-background p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Account snapshot
            </p>

            <p className="mt-2 text-2xl font-bold tabular-nums">
              {showBalance
                ? formatNaira(balance)
                : "••••••••"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Current available balance
            </p>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Account number
              </p>

              <p className="mt-1 font-medium tabular-nums">
                {accountNumber || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-accent p-6 text-accent-foreground">
            <div className="flex items-center gap-2">
              <WifiOff className="size-5" />

              <h3 className="font-semibold">
                Works offline too.
              </h3>
            </div>

            <p className="mt-2 text-sm">
              Dial{" "}
              <span className="font-semibold">
                *347*AJORA#
              </span>{" "}
              from any phone with signal to buy
              airtime and data without
              internet.
            </p>

            <Link
              to="/offline-guide"
              className="mt-3 inline-block text-sm font-medium transition-colors hover:underline"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          AJORA ₦1,000 APP BONUS POPUP
         ========================================================= */}

      {!bonusStatusLoading &&
        bonusEligible &&
        !bonusClaimed && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="bonus-title"
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  setBonusEligible(false);
                  setBonusError("");
                }}
                disabled={bonusLoading}
                aria-label="Close bonus popup"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-5" />
              </button>

              {/* Header */}
              <div className="relative overflow-hidden bg-primary px-6 pb-8 pt-10 text-primary-foreground">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Gift className="size-8" />
                </div>

                <div className="relative mt-5 text-center">
                  <p className="text-sm font-medium text-primary-foreground/80">
                    Welcome to Ajora
                  </p>

                  <h2
                    id="bonus-title"
                    className="mt-1 text-2xl font-bold tracking-tight"
                  >
                    Claim your app bonus 🎁
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-primary-foreground/80">
                    We've added a special welcome
                    bonus for you. Claim it now
                    and get{" "}
                    <span className="font-bold text-primary-foreground">
                      {formatNaira(
                        bonusAmount,
                      )}
                    </span>{" "}
                    directly into your Ajora
                    account.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        App bonus
                      </p>

                      <p className="mt-1 text-2xl font-bold tabular-nums">
                        {formatNaira(
                          bonusAmount,
                        )}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Gift className="size-5" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary" />

                    <span>
                      One-time welcome bonus
                    </span>
                  </div>
                </div>

                {bonusError && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {bonusError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClaimBonus}
                  disabled={bonusLoading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bonusLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />

                      Claiming bonus...
                    </>
                  ) : (
                    <>
                      <Gift className="size-4" />

                      Claim{" "}
                      {formatNaira(
                        bonusAmount,
                      )}
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                  This bonus can only be claimed once
                  per Ajora account.
                </p>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
