import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  Search,
  UserRound,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import type { TransferPayload } from "@/lib/transfer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  createdAt: string;
  updatedAt?: string;
};

type TransactionsResponse = {
  success: boolean;
  data: {
    transactions: BackendTransaction[];
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

type Recipient = {
  id: string;
  name: string;
  bank: string;
  account: string;
};

const MOCK_ACCOUNTS: Record<
  string,
  {
    name: string;
    bank: string;
  }
> = {
  "1234567890": {
    name: "Daniel James",
    bank: "Ajora Bank",
  },

  "9876543210": {
    name: "Sarah Williams",
    bank: "GTBank",
  },

  "1122334455": {
    name: "Michael John",
    bank: "Access Bank",
  },

  "5566778899": {
    name: "David Okafor",
    bank: "Zenith Bank",
  },

  "4433221100": {
    name: "Grace Williams",
    bank: "UBA",
  },
};

const QUICK_AMOUNTS = [
  5000,
  10000,
  50000,
  100000,
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Transfer() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);

  const [recipients, setRecipients] =
    useState<Recipient[]>([]);

  const [selectedRecipient, setSelectedRecipient] =
    useState<Recipient | null>(null);

  const [amount, setAmount] = useState("");

  const [memo, setMemo] = useState("");

  const [search, setSearch] = useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [accountLookupLoading, setAccountLookupLoading] =
    useState(false);

  const [accountLookupError, setAccountLookupError] =
    useState("");

  const [accountVerified, setAccountVerified] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showRecipients, setShowRecipients] =
    useState(false);

  /* =========================================================
     LOAD BALANCE + SAVED RECIPIENTS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadTransferData() {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          transactionsResponse,
        ] = await Promise.all([
          apiRequest<DashboardResponse>(
            "/dashboard",
          ),

          apiRequest<TransactionsResponse>(
            "/transactions",
          ),
        ]);

        if (!mounted) return;

        setBalance(
          Number(
            dashboardResponse.data.account
              ?.balance ?? 0,
          ),
        );

        const seen = new Set<string>();

        const historyRecipients: Recipient[] =
          transactionsResponse.data.transactions
            .filter(
              (transaction) =>
                transaction.type.toLowerCase() ===
                  "transfer" &&
                transaction.direction.toLowerCase() ===
                  "expense" &&
                transaction.recipientName &&
                transaction.recipientAccount &&
                transaction.recipientBank,
            )
            .sort(
              (a, b) =>
                new Date(
                  b.createdAt,
                ).getTime() -
                new Date(
                  a.createdAt,
                ).getTime(),
            )
            .map((transaction) => ({
              id:
                transaction.recipientAccount!,
              name:
                transaction.recipientName!,
              bank:
                transaction.recipientBank!,
              account:
                transaction.recipientAccount!,
            }))
            .filter((recipient) => {
              const key = `${recipient.account}-${recipient.bank}`;

              if (seen.has(key)) {
                return false;
              }

              seen.add(key);
              return true;
            });

        setRecipients(historyRecipients);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transfer information.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTransferData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     FILTER SAVED RECIPIENTS
  ========================================================= */

  const filteredRecipients =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return recipients;
      }

      return recipients.filter(
        (recipient) =>
          recipient.name
            .toLowerCase()
            .includes(query) ||
          recipient.bank
            .toLowerCase()
            .includes(query) ||
          recipient.account.includes(query),
      );
    }, [recipients, search]);

  /* =========================================================
     ACCOUNT NUMBER
  ========================================================= */

  const handleAccountNumberChange = (
    value: string,
  ) => {
    const cleaned = value
      .replace(/[^\d]/g, "")
      .slice(0, 10);

    setAccountNumber(cleaned);

    setAccountVerified(false);
    setAccountLookupError("");
    setSelectedRecipient(null);
  };

  /* =========================================================
     ACCOUNT VERIFICATION
  ========================================================= */

  const handleVerifyAccount = () => {
    setAccountLookupError("");
    setAccountVerified(false);
    setSelectedRecipient(null);

    if (accountNumber.length !== 10) {
      setAccountLookupError(
        "Please enter a valid 10-digit account number.",
      );
      return;
    }

    setAccountLookupLoading(true);

    setTimeout(() => {
      const account =
        MOCK_ACCOUNTS[accountNumber];

      if (!account) {
        setAccountLookupError(
          "Account not found.",
        );

        setAccountLookupLoading(false);
        return;
      }

      const recipient: Recipient = {
        id: accountNumber,
        name: account.name,
        bank: account.bank,
        account: accountNumber,
      };

      setSelectedRecipient(recipient);
      setAccountVerified(true);
      setAccountLookupLoading(false);
    }, 700);
  };

  /* =========================================================
     AMOUNT
  ========================================================= */

  const numericAmount =
    Number(
      amount.replace(/,/g, ""),
    ) || 0;

  const canContinue =
    Boolean(selectedRecipient) &&
    accountVerified &&
    numericAmount > 0 &&
    numericAmount <= balance;

  const handleAmountChange = (
    value: string,
  ) => {
    const cleaned =
      value.replace(/[^\d]/g, "");

    setAmount(
      cleaned
        ? Number(cleaned).toLocaleString(
            "en-NG",
          )
        : "",
    );
  };

  /* =========================================================
     CONTINUE TO CONFIRMATION
  ========================================================= */

  const handleContinue = () => {
    if (!selectedRecipient) {
      setError(
        "Please select and verify a recipient.",
      );
      return;
    }

    if (!accountVerified) {
      setError(
        "Please verify the recipient's account number.",
      );
      return;
    }

    if (numericAmount <= 0) {
      setError(
        "Please enter a valid amount.",
      );
      return;
    }

    if (numericAmount > balance) {
      setError(
        "Insufficient account balance.",
      );
      return;
    }

    setError("");

    const transferPayload: TransferPayload = {
      recipient: {
        method: "bank",

        name: selectedRecipient.name,

        initials: getInitials(
          selectedRecipient.name,
        ),

        bankName:
          selectedRecipient.bank,

        accountNumber:
          selectedRecipient.account,
      },

      amount: numericAmount,

      memo: memo.trim(),

      fee: 0,

      total: numericAmount,
    };

    navigate(
      "/transfer/confirm",
      {
        state: transferPayload,
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Transfer money
          </h1>

          <p className="text-sm text-muted-foreground">
            Send money securely from your Ajora account.
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Available balance
        </p>

        <p className="mt-2 text-3xl font-bold tabular-nums">
          {loading
            ? "Loading..."
            : formatNaira(balance)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-success" />
          Available to transfer
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Recipient */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Recipient
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Enter an account number or choose a saved recipient.
            </p>
          </div>

          <UserRound className="size-5 text-muted-foreground" />
        </div>

        {/* Account Number */}
        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium">
            Account number
          </label>

          <div className="flex gap-2">
            <Input
              value={accountNumber}
              onChange={(event) =>
                handleAccountNumberChange(
                  event.target.value,
                )
              }
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit account number"
              className="h-12 flex-1 tracking-wide"
            />

            <Button
              type="button"
              onClick={
                handleVerifyAccount
              }
              disabled={
                accountNumber.length !==
                  10 ||
                accountLookupLoading
              }
              className="h-12 shrink-0"
            >
              {accountLookupLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          {accountLookupError && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5 text-xs text-danger">
              {accountLookupError}
            </div>
          )}

          {/* Verified Recipient */}
          {accountVerified &&
            selectedRecipient && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {getInitials(
                      selectedRecipient.name,
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">
                        {
                          selectedRecipient.name
                        }
                      </p>

                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {
                        selectedRecipient.bank
                      }{" "}
                      ·{" "}
                      {
                        selectedRecipient.account
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-success/10 pt-3">
                  <p className="text-xs text-success">
                    Account verified successfully.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Recipient verification is currently in test mode.
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Saved Recipients */}
        <div className="mt-5 border-t border-border pt-5">
          {selectedRecipient ? (
            <button
              type="button"
              onClick={() =>
                setShowRecipients(
                  (value) => !value,
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {getInitials(
                  selectedRecipient.name,
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {selectedRecipient.name}
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {selectedRecipient.bank} ·{" "}
                  {selectedRecipient.account}
                </span>
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setShowRecipients(true)
              }
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-5 text-muted-foreground" />
              </span>

              <span className="flex-1">
                <span className="block font-medium">
                  Saved recipients
                </span>

                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Choose someone you've transferred to before
                </span>
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          {showRecipients && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search recipient"
                  className="pl-9"
                />
              </div>

              {loading ? (
                <p className="py-5 text-center text-sm text-muted-foreground">
                  Loading recipients...
                </p>
              ) : filteredRecipients.length >
                0 ? (
                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {filteredRecipients.map(
                    (recipient) => (
                      <button
                        key={`${recipient.account}-${recipient.bank}`}
                        type="button"
                        onClick={() => {
                          setSelectedRecipient(
                            recipient,
                          );

                          setAccountNumber(
                            recipient.account,
                          );

                          setAccountVerified(
                            true,
                          );

                          setShowRecipients(
                            false,
                          );
                        }}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                          {getInitials(
                            recipient.name,
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {
                              recipient.name
                            }
                          </span>

                          <span className="block truncate text-xs text-muted-foreground">
                            {
                              recipient.bank
                            }{" "}
                            ·{" "}
                            {
                              recipient.account
                            }
                          </span>
                        </span>

                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <UserRound className="mx-auto size-7 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No saved recipients
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Recipients will appear here after a successful transfer.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <h2 className="font-semibold">
          Amount
        </h2>

        <div className="relative mt-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
            ₦
          </span>

          <Input
            value={amount}
            onChange={(event) =>
              handleAmountChange(
                event.target.value,
              )
            }
            inputMode="numeric"
            placeholder="0"
            className="h-16 pl-10 pr-4 text-2xl font-bold tabular-nums"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {QUICK_AMOUNTS.map(
            (quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() =>
                  handleAmountChange(
                    String(
                      quickAmount,
                    ),
                  )
                }
                disabled={
                  quickAmount >
                  balance
                }
                className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                {formatNaira(
                  quickAmount,
                )}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Memo */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <h2 className="font-semibold">
          Note
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Optional message for this transfer.
        </p>

        <Input
          value={memo}
          onChange={(event) =>
            setMemo(event.target.value)
          }
          placeholder="e.g. Payment for goods"
          maxLength={120}
          className="mt-4 h-12"
        />
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Transfer amount
            </span>

            <span className="font-medium tabular-nums">
              {formatNaira(
                numericAmount,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Transfer fee
            </span>

            <span className="font-medium tabular-nums">
              ₦0
            </span>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-bold tabular-nums">
                {formatNaira(
                  numericAmount,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue */}
      <Button
        type="button"
        className="h-12 w-full"
        disabled={
          loading ||
          !canContinue
        }
        onClick={handleContinue}
      >
        Continue
        <ArrowDown className="size-4 rotate-[-45deg]" />
      </Button>

      <p className="text-center text-xs leading-5 text-muted-foreground">
        You&apos;ll review the transfer details and enter your transaction PIN before the money is sent.
      </p>
    </div>
  );
}