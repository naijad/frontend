import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Download,
  Filter,
  MoreVertical,
  Search,
  SearchX,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import type {
  Filters,
  Transaction,
  TransactionType,
} from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import TransactionRow from "@/components/shared/TransactionRow";
import EmptyState from "@/components/shared/EmptyState";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

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

const PAGE_SIZE = 25;
const LOAD_STEP = 10;

const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "all",
  dateRange: "all",
  status: "all",
};

const TYPE_OPTIONS: {
  value: Filters["type"];
  label: string;
}[] = [
  {
    value: "all",
    label: "All types",
  },
  {
    value: "received",
    label: "Received",
  },
  {
    value: "sent",
    label: "Sent",
  },
  {
    value: "airtime",
    label: "Airtime",
  },
  {
    value: "data",
    label: "Data",
  },
  {
    value: "bill",
    label: "Bills",
  },
  {
    value: "topup",
    label: "Top-ups",
  },
];

const DATE_OPTIONS: {
  value: Filters["dateRange"];
  label: string;
}[] = [
  {
    value: "all",
    label: "All time",
  },
  {
    value: "week",
    label: "This week",
  },
  {
    value: "month",
    label: "This month",
  },
  {
    value: "quarter",
    label: "Last 3 months",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

const STATUS_OPTIONS: {
  value: Filters["status"];
  label: string;
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "failed",
    label: "Failed",
  },
];

const labelFor = <T extends string>(
  options: {
    value: T;
    label: string;
  }[],
  value: T,
) =>
  options.find(
    (option) => option.value === value,
  )?.label ?? value;

function mapType(
  transaction: BackendTransaction,
): TransactionType {
  const raw =
    transaction.type.toLowerCase();

  const direction =
    transaction.direction.toLowerCase();

  if (raw === "transfer") {
    return direction === "income"
      ? "received"
      : "sent";
  }

  if (raw === "deposit") {
    return "topup";
  }

  if (raw === "withdrawal") {
    return "sent";
  }

  if (raw === "airtime") {
    return "airtime";
  }

  if (raw === "data") {
    return "data";
  }

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

  const amount =
    Number(transaction.amount);

  return {
    id: transaction.id,

    type: mapType(transaction),

    counterparty:
      transaction.recipientName ||
      transaction.title ||
      "Ajora transaction",

    counterpartyBank:
      transaction.recipientBank ||
      undefined,

    counterpartyAccount:
      transaction.recipientAccount ||
      undefined,

    reference:
      transaction.reference,

    memo:
      transaction.description ||
      undefined,

    timestamp: new Date(
      transaction.createdAt,
    ),

    amount:
      direction === "income"
        ? Math.abs(amount)
        : -Math.abs(amount),

    fee: Number(
      transaction.fee || 0,
    ),

    balanceAfter: 0,

    status:
      transaction.status.toLowerCase() ===
      "reversed"
        ? "failed"
        : (transaction.status.toLowerCase() as Transaction["status"]),
  };
}

function dayKey(date: Date) {
  return date.toDateString();
}

function dayLabel(date: Date): string {
  const now = new Date();

  const today =
    now.toDateString();

  const yesterday =
    new Date(now);

  yesterday.setDate(
    now.getDate() - 1,
  );

  if (
    date.toDateString() === today
  ) {
    return "Today";
  }

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  const diffDays =
    (now.getTime() -
      date.getTime()) /
    86_400_000;

  if (diffDays < 7) {
    return date.toLocaleDateString(
      "en-NG",
      {
        weekday: "long",
      },
    );
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );
}

function groupByDay(
  transactions: Transaction[],
) {
  const groups: {
    key: string;
    label: string;
    items: Transaction[];
  }[] = [];

  for (const transaction of transactions) {
    const key = dayKey(
      transaction.timestamp,
    );

    const last = groups.at(-1);

    if (
      last &&
      last.key === key
    ) {
      last.items.push(transaction);
    } else {
      groups.push({
        key,
        label: dayLabel(
          transaction.timestamp,
        ),
        items: [transaction],
      });
    }
  }

  return groups;
}

interface FilterSelectsProps {
  filters: Filters;
  onChange: (
    patch: Partial<Filters>,
  ) => void;
  className?: string;
}

function FilterSelects({
  filters,
  onChange,
  className,
}: FilterSelectsProps) {
  return (
    <div className={className}>
      <Select
        value={filters.type}
        onValueChange={(value) =>
          onChange({
            type: value as Filters["type"],
          })
        }
      >
        <SelectTrigger className="w-full lg:w-[130px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {TYPE_OPTIONS.map(
            (option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Select
        value={filters.dateRange}
        onValueChange={(value) =>
          onChange({
            dateRange:
              value as Filters["dateRange"],
          })
        }
      >
        <SelectTrigger className="w-full lg:w-[150px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {DATE_OPTIONS.map(
            (option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({
            status:
              value as Filters["status"],
          })
        }
      >
        <SelectTrigger className="w-full lg:w-[120px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {STATUS_OPTIONS.map(
            (option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Transactions() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const [filters, setFilters] =
    useState<Filters>(() => ({
      ...DEFAULT_FILTERS,

      search:
        searchParams.get(
          "search",
        ) ?? "",

      type:
        (searchParams.get(
          "type",
        ) as Filters["type"]) ??
        "all",
    }));

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(PAGE_SIZE);

  const [
    sheetOpen,
    setSheetOpen,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiRequest<TransactionsResponse>(
            "/transactions",
          );

        if (mounted) {
          setTransactions(
            response.data.transactions.map(
              mapTransaction,
            ),
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transactions.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    useMemo(() => {
      const now = new Date();

      return transactions.filter(
        (transaction) => {
          const search =
            filters.search
              .trim()
              .toLowerCase();

          const matchesSearch =
            !search ||
            [
              transaction.counterparty,
              transaction.reference,
              transaction.amount.toString(),
              transaction.counterpartyBank,
              transaction.counterpartyAccount,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(search),
              );

          const matchesType =
            filters.type === "all" ||
            transaction.type ===
              filters.type;

          const matchesStatus =
            filters.status === "all" ||
            transaction.status ===
              filters.status;

          let matchesDate = true;

          const age =
            (now.getTime() -
              transaction.timestamp.getTime()) /
            86_400_000;

          if (
            filters.dateRange ===
            "week"
          ) {
            matchesDate =
              age <= 7;
          }

          if (
            filters.dateRange ===
            "month"
          ) {
            matchesDate =
              age <= 30;
          }

          if (
            filters.dateRange ===
            "quarter"
          ) {
            matchesDate =
              age <= 90;
          }

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesDate
          );
        },
      );
    }, [
      transactions,
      filters,
    ]);

  const visible =
    filtered.slice(
      0,
      visibleCount,
    );

  const groups = useMemo(
    () =>
      groupByDay(visible),
    [visible],
  );

  const monthSummary =
    useMemo(() => {
      const now = new Date();

      const current =
        transactions.filter(
          (transaction) =>
            transaction.timestamp.getMonth() ===
              now.getMonth() &&
            transaction.timestamp.getFullYear() ===
              now.getFullYear(),
        );

      const incoming =
        current
          .filter(
            (transaction) =>
              transaction.amount >
              0,
          )
          .reduce(
            (
              sum,
              transaction,
            ) =>
              sum +
              transaction.amount,
            0,
          );

      const outgoing =
        current
          .filter(
            (transaction) =>
              transaction.amount <
              0,
          )
          .reduce(
            (
              sum,
              transaction,
            ) =>
              sum +
              Math.abs(
                transaction.amount,
              ),
            0,
          );

      return {
        in: incoming,
        out: outgoing,
        net:
          incoming -
          outgoing,
      };
    }, [transactions]);

  const patchFilters = (
    patch: Partial<Filters>,
  ) => {
    setFilters(
      (previous) => ({
        ...previous,
        ...patch,
      }),
    );

    setVisibleCount(
      PAGE_SIZE,
    );
  };

  const resetFilters = () => {
    setFilters(
      DEFAULT_FILTERS,
    );

    setVisibleCount(
      PAGE_SIZE,
    );
  };

  const chips: {
    key: string;
    label: string;
    value: string;
    clear: () => void;
  }[] = [];

  if (
    filters.search.trim()
  ) {
    chips.push({
      key: "search",
      label: "Search",
      value: `“${filters.search.trim()}”`,
      clear: () =>
        patchFilters({
          search: "",
        }),
    });
  }

  if (
    filters.type !== "all"
  ) {
    chips.push({
      key: "type",
      label: "Type",
      value: labelFor(
        TYPE_OPTIONS,
        filters.type,
      ),
      clear: () =>
        patchFilters({
          type: "all",
        }),
    });
  }

  if (
    filters.dateRange !==
    "all"
  ) {
    chips.push({
      key: "date",
      label: "Date",
      value: labelFor(
        DATE_OPTIONS,
        filters.dateRange,
      ),
      clear: () =>
        patchFilters({
          dateRange: "all",
        }),
    });
  }

  if (
    filters.status !== "all"
  ) {
    chips.push({
      key: "status",
      label: "Status",
      value: labelFor(
        STATUS_OPTIONS,
        filters.status,
      ),
      clear: () =>
        patchFilters({
          status: "all",
        }),
    });
  }

  const exportTransactions =
    () => {
      if (
        !transactions.length
      ) {
        return;
      }

      const rows = [
        [
          "Date",
          "Reference",
          "Type",
          "Status",
          "Amount",
          "Fee",
        ],

        ...transactions.map(
          (transaction) => [
            transaction.timestamp.toISOString(),
            transaction.reference,
            transaction.type,
            transaction.status,
            transaction.amount.toString(),
            transaction.fee.toString(),
          ],
        ),
      ];

      const csv =
        rows
          .map((row) =>
            row
              .map((value) =>
                `"${String(value).replaceAll('"', '""')}"`,
              )
              .join(","),
          )
          .join("\n");

      const blob =
        new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      anchor.download = `ajora-transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);
    };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Transactions"
        subheading="Every kobo in and out of your Ajora wallet."
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={
                exportTransactions
              }
              disabled={
                !transactions.length
              }
            >
              <Download className="size-4" />
              Export
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Export"
              onClick={
                exportTransactions
              }
              disabled={
                !transactions.length
              }
            >
              <MoreVertical className="size-4" />
            </Button>
          </>
        }
      />

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
        <StatCard
          compact
          className="min-w-[220px] lg:min-w-0"
          label="In this month"
          value={formatNaira(
            monthSummary.in,
          )}
          valueClassName="text-success"
        />

        <StatCard
          compact
          className="min-w-[220px] lg:min-w-0"
          label="Out this month"
          value={formatNaira(
            monthSummary.out,
          )}
        />

        <StatCard
          compact
          className="min-w-[220px] lg:min-w-0"
          label="Net this month"
          value={formatNaira(
            monthSummary.net,
          )}
          valueClassName="text-primary"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={
                filters.search
              }
              onChange={(event) =>
                patchFilters({
                  search:
                    event.target
                      .value,
                })
              }
              placeholder="Search by name, reference, or amount"
              className="pl-9"
            />
          </div>

          <FilterSelects
            filters={filters}
            onChange={
              patchFilters
            }
            className="hidden gap-2 lg:flex"
          />

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Filters"
            onClick={() =>
              setSheetOpen(true)
            }
          >
            <Filter className="size-4" />
          </Button>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map(
              (chip) => (
                <ActiveFilterChip
                  key={
                    chip.key
                  }
                  label={
                    chip.label
                  }
                  value={
                    chip.value
                  }
                  onRemove={
                    chip.clear
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-background p-10 text-center text-sm text-muted-foreground">
          Loading your transaction history...
        </div>
      ) : error ? (
        <EmptyState
          icon={SearchX}
          heading="Unable to load transactions"
          body={error}
          action={{
            label: "Try again",
            variant:
              "outline",
            onClick: () =>
              window.location.reload(),
          }}
        />
      ) : filtered.length ===
        0 ? (
        <EmptyState
          icon={SearchX}
          heading="No transactions match your filters"
          body="Try clearing your filters or search terms."
          action={{
            label:
              "Clear filters",
            variant:
              "outline",
            onClick:
              resetFilters,
          }}
        />
      ) : (
        <>
          <div className="lg:rounded-xl lg:border lg:border-border lg:bg-background lg:p-2">
            {groups.map(
              (group) => (
                <div
                  key={
                    group.key
                  }
                >
                  <div className="sticky top-14 z-10 bg-background/95 px-1 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm lg:top-0 lg:px-2">
                    {
                      group.label
                    }
                  </div>

                  <div className="divide-y divide-border px-1 lg:px-2">
                    {group.items.map(
                      (
                        transaction,
                      ) => (
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
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            {visible.length <
              filtered.length && (
              <Button
                variant="outline"
                onClick={() =>
                  setVisibleCount(
                    (count) =>
                      count +
                      LOAD_STEP,
                  )
                }
              >
                Load more
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Showing{" "}
              {visible.length}{" "}
              of{" "}
              {filtered.length}{" "}
              transactions
            </p>
          </div>
        </>
      )}

      <Sheet
        open={sheetOpen}
        onOpenChange={
          setSheetOpen
        }
      >
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>
              Filters
            </SheetTitle>
          </SheetHeader>

          <div className="grid gap-4 px-4 pb-6">
            <FilterSelects
              filters={filters}
              onChange={
                patchFilters
              }
              className="grid gap-3"
            />

            {chips.length >
              0 && (
              <Button
                variant="ghost"
                onClick={
                  resetFilters
                }
              >
                Clear all filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}