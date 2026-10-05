/**
 * Static mock data for the UI build-out. Replace with real API data later.
 * Deterministic — no `Math.random()` — so lists don't shuffle between renders.
 */

export interface MockUser {
  /** First name — used for greetings. */
  name: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  accountNumber: string;
  balance: number;
  verified: boolean;
}

export const user: MockUser = {
  name: "Ada",
  fullName: "Ada Obi",
  email: "ada@ajora.com",
  phone: "+234 803 145 8790",
  avatarInitials: "AO",
  accountNumber: "2103 4567 89",
  balance: 248500,
  verified: true,
};

export type TransactionType =
  | "sent"
  | "received"
  | "airtime"
  | "data"
  | "bill"
  | "topup";

export type TransactionStatus = "completed" | "pending" | "failed";

export type Network = "MTN" | "Airtel" | "Glo" | "9mobile";

export interface Transaction {
  id: string;
  type: TransactionType;
  counterparty: string;
  counterpartyBank?: string; // sent
  counterpartyAccount?: string; // sent
  phone?: string; // airtime / data
  network?: Network; // airtime / data
  dataPlan?: string; // data
  billerName?: string; // bill
  billerAccount?: string; // bill
  reference: string;
  memo?: string;
  timestamp: Date;
  amount: number; // signed: negative = outflow
  fee: number;
  balanceAfter: number;
  paymentMethod?: string; // received / topup
  status: TransactionStatus;
}

const INFLOW_TYPES: TransactionType[] = ["received", "topup"];

function at(daysAgo: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// [type, counterparty, absAmount, status, daysAgo, hour, minute]
type Seed = [
  TransactionType,
  string,
  number,
  TransactionStatus,
  number,
  number,
  number,
];

const seeds: Seed[] = [
  ["received", "Chidinma Okafor", 50000, "completed", 0, 9, 12],
  ["airtime", "MTN Airtime", 1000, "completed", 0, 8, 5],
  ["sent", "Segun Adeyemi", 25000, "completed", 0, 14, 30],
  ["data", "Glo Data", 3500, "pending", 0, 19, 45],
  ["bill", "Ikeja Electric", 12000, "completed", 1, 15, 18],
  ["received", "Amaka Nwosu", 8000, "completed", 1, 11, 2],
  ["sent", "Tunde Bakare", 40000, "failed", 1, 20, 11],
  ["sent", "Kemi Alabi", 15000, "completed", 2, 10, 0],
  ["topup", "Wallet top-up", 100000, "completed", 2, 9, 0],
  ["airtime", "Airtel Airtime", 500, "completed", 3, 7, 30],
  ["bill", "DStv Subscription", 24500, "completed", 3, 18, 0],
  ["received", "Emeka Balogun", 62000, "completed", 3, 13, 20],
  ["data", "MTN Data", 5000, "completed", 4, 8, 40],
  ["sent", "Ngozi Eze", 30000, "completed", 4, 16, 5],
  ["received", "Yusuf Ibrahim", 12500, "completed", 6, 12, 12],
  ["sent", "Blessing Obi", 7500, "completed", 6, 17, 33],
  ["airtime", "9mobile Airtime", 2000, "failed", 6, 21, 0],
  ["bill", "EKEDC", 18000, "completed", 7, 14, 0],
  ["topup", "Card top-up", 50000, "completed", 7, 10, 30],
  ["sent", "Chinedu Okafor", 55000, "completed", 9, 11, 45],
  ["data", "Glo Data", 15000, "completed", 9, 9, 15],
  ["received", "Funke Akindele", 90000, "completed", 10, 15, 50],
  ["airtime", "MTN Airtime", 1500, "completed", 10, 8, 0],
  ["sent", "Musa Danjuma", 12000, "pending", 10, 19, 20],
  ["bill", "Ibadan Disco", 9500, "completed", 12, 13, 5],
  ["received", "Halima Sule", 4500, "completed", 12, 10, 10],
  ["sent", "Obinna Kalu", 78000, "completed", 14, 16, 40],
  ["data", "Airtel Data", 3500, "completed", 14, 7, 55],
  ["topup", "Wallet top-up", 120000, "completed", 16, 9, 30],
  ["sent", "Zainab Bello", 20000, "completed", 16, 14, 22],
  ["airtime", "Airtel Airtime", 1000, "completed", 16, 20, 0],
  ["received", "Chidinma Okafor", 35000, "completed", 18, 12, 0],
  ["bill", "DStv Subscription", 24500, "failed", 18, 18, 30],
  ["sent", "Segun Adeyemi", 45000, "completed", 21, 11, 11],
  ["data", "MTN Data", 8000, "completed", 21, 8, 20],
  ["received", "Amaka Nwosu", 15000, "completed", 21, 17, 0],
  ["airtime", "MTN Airtime", 3000, "completed", 24, 7, 45],
  ["sent", "Kemi Alabi", 6000, "completed", 24, 15, 30],
  ["bill", "Ikeja Electric", 14500, "completed", 27, 13, 40],
  ["topup", "Card top-up", 75000, "completed", 27, 10, 0],
  ["received", "Emeka Balogun", 50000, "completed", 27, 19, 5],
  ["sent", "Tunde Bakare", 100000, "completed", 30, 12, 25],
  ["data", "Glo Data", 15000, "completed", 30, 9, 0],
  ["received", "Ngozi Eze", 22000, "completed", 34, 14, 15],
  ["airtime", "Glo Airtime", 500, "completed", 34, 8, 30],
  ["sent", "Blessing Obi", 33000, "completed", 38, 16, 50],
  ["bill", "EKEDC", 20000, "pending", 38, 11, 20],
  ["received", "Yusuf Ibrahim", 145000, "completed", 42, 10, 40],
  ["sent", "Chinedu Okafor", 9000, "completed", 42, 18, 10],
  ["data", "MTN Data", 5000, "completed", 47, 7, 15],
  ["topup", "Wallet top-up", 60000, "completed", 47, 9, 45],
  ["sent", "Funke Akindele", 27000, "failed", 47, 20, 30],
  ["bill", "Ibadan Disco", 11000, "completed", 52, 13, 0],
  ["received", "Musa Danjuma", 40000, "completed", 52, 15, 25],
  ["sent", "Halima Sule", 18000, "completed", 58, 12, 34],
  ["airtime", "Airtel Airtime", 2500, "completed", 58, 8, 0],
];

// memos keyed by seed index
const MEMOS: Record<number, string> = {
  2: "Half of this month's rent", // sent · Segun Adeyemi
  8: "Payday top-up", // topup
  13: "For the market supplies", // sent · Ngozi Eze
  19: "Balance for the laptop", // sent · Chinedu Okafor
  26: "Family upkeep — September", // sent · Obinna Kalu
  33: "Split for Saturday's dinner", // sent · Segun Adeyemi
  37: "Thanks for the ride 🙏", // sent · Kemi Alabi
};

const BANKS = [
  "GTBank",
  "Access Bank",
  "Zenith Bank",
  "Kuda",
  "UBA",
  "First Bank",
  "OPay",
  "Moniepoint",
  "PalmPay",
];
const RECEIVE_METHODS = ["Bank transfer", "Ajora to Ajora", "USSD"];
const DATA_PLANS = [
  "1.5GB · 7 days",
  "6GB · 30 days",
  "10GB · 30 days",
  "25GB · 30 days",
  "3GB · 30 days",
];

function networkFrom(name: string): Network | undefined {
  if (name.startsWith("MTN")) return "MTN";
  if (name.startsWith("Airtel")) return "Airtel";
  if (name.startsWith("Glo")) return "Glo";
  if (name.startsWith("9mobile")) return "9mobile";
  return undefined;
}

function makeReference(date: Date, i: number): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = ((i + 7) * 9173)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0")
    .slice(-4);
  return `TXN${y}${mo}${d}AJ${suffix}`;
}

function feeFor(type: TransactionType, abs: number): number {
  if (type === "sent") return abs >= 50000 ? 50 : abs >= 5000 ? 25 : 10;
  if (type === "bill") return 100;
  return 0;
}

const enriched: Transaction[] = seeds.map(
  ([type, counterparty, abs, status, d, h, m], i) => {
    const timestamp = at(d, h, m);
    const isMobile = type === "airtime" || type === "data";
    return {
      id: `txn_${3000 - i}`,
      type,
      counterparty,
      timestamp,
      amount: INFLOW_TYPES.includes(type) ? abs : -abs,
      fee: feeFor(type, abs),
      balanceAfter: 0, // filled in below
      status,
      reference: makeReference(timestamp, i),
      memo: MEMOS[i],
      network: isMobile ? networkFrom(counterparty) : undefined,
      phone: isMobile ? `080${31450000 + i * 137}` : undefined,
      dataPlan:
        type === "data" ? DATA_PLANS[i % DATA_PLANS.length] : undefined,
      counterpartyBank: type === "sent" ? BANKS[i % BANKS.length] : undefined,
      counterpartyAccount:
        type === "sent"
          ? `0${1234500000 + i * 77}`.slice(0, 10)
          : undefined,
      billerName: type === "bill" ? counterparty : undefined,
      billerAccount:
        type === "bill"
          ? `${45000000000 + i * 137}`.slice(0, 11)
          : undefined,
      paymentMethod:
        type === "received" || type === "topup"
          ? RECEIVE_METHODS[i % RECEIVE_METHODS.length]
          : undefined,
    };
  },
);

// Deterministic running balance, computed chronologically so `balanceAfter`
// lands on `user.balance` for the most recent transaction.
function assignRunningBalances(list: Transaction[]): void {
  const chrono = [...list].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );
  const totalDelta = chrono.reduce((sum, t) => sum + t.amount - t.fee, 0);
  let running = user.balance - totalDelta;
  for (const t of chrono) {
    running += t.amount - t.fee;
    t.balanceAfter = Math.round(running);
  }
}
assignRunningBalances(enriched);

export const allTransactions: Transaction[] = [...enriched].sort(
  (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
);

/** The 5 most recent — used by the dashboard. */
export const recentTransactions: Transaction[] = allTransactions.slice(0, 5);

export function getTransactionById(id: string): Transaction | undefined {
  return allTransactions.find((t) => t.id === id);
}

export type Filters = {
  search: string;
  type: "all" | TransactionType;
  dateRange: "all" | "week" | "month" | "quarter" | "custom";
  status: "all" | TransactionStatus;
};

export const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "all",
  dateRange: "all",
  status: "all",
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Filters["dateRange"], number> = {
  all: Infinity,
  week: 7,
  month: 30,
  quarter: 90,
  custom: Infinity,
};

/** Apply filters client-side (v1 — later a server query). Deterministic. */
export function getTransactions(
  filters?: Filters,
  limit?: number,
): Transaction[] {
  let list = allTransactions;

  if (filters) {
    const query = filters.search.trim().toLowerCase();
    // Nigerian users search by amount a lot — "45,000" / "45000" / "45 000".
    const digits = query.replace(/\D/g, "");

    if (query) {
      list = list.filter((t) => {
        const byName = t.counterparty.toLowerCase().includes(query);
        const byAmount =
          digits.length > 0 &&
          String(Math.abs(t.amount)).includes(digits);
        return byName || byAmount;
      });
    }

    if (filters.type !== "all") {
      list = list.filter((t) => t.type === filters.type);
    }

    if (filters.status !== "all") {
      list = list.filter((t) => t.status === filters.status);
    }

    const rangeDays = RANGE_DAYS[filters.dateRange];
    if (Number.isFinite(rangeDays)) {
      const cutoff = Date.now() - rangeDays * DAY_MS;
      list = list.filter((t) => t.timestamp.getTime() >= cutoff);
    }
  }

  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getTransactionSummary(period: "month"): {
  in: number;
  out: number;
  net: number;
  trend: { in: string; out: string };
} {
  void period;
  const cutoff = Date.now() - 30 * DAY_MS;
  const window = allTransactions.filter((t) => t.timestamp.getTime() >= cutoff);

  const inflow = window
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const outflow = window
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    in: inflow,
    out: outflow,
    net: inflow - outflow,
    trend: { in: "+12% vs last month", out: "-8% vs last month" },
  };
}

export type SpendingColor = "info" | "success" | "warning" | "primary";

export interface MonthlySpending {
  total: number;
  breakdown: { category: string; amount: number; color: SpendingColor }[];
}

export const monthlySpending: MonthlySpending = {
  total: 42500,
  breakdown: [
    { category: "Airtime", amount: 5000, color: "info" },
    { category: "Data", amount: 12500, color: "success" },
    { category: "Bills", amount: 15000, color: "warning" },
    { category: "Transfers", amount: 10000, color: "primary" },
  ],
};

export interface SavingsGoal {
  name: string;
  target: number;
  saved: number;
}

export const savingsGoal: SavingsGoal | null = {
  name: "December trip",
  target: 300000,
  saved: 204000,
};

/* ============================================================
   Analytics (derived from allTransactions — deterministic)
   ============================================================ */

export type CategoryColor =
  | "info"
  | "success"
  | "warning"
  | "primary"
  | "accent"
  | "muted";

const CATEGORY_OF: Record<
  TransactionType,
  { category: string; color: CategoryColor }
> = {
  airtime: { category: "Airtime", color: "info" },
  data: { category: "Data", color: "success" },
  bill: { category: "Bills", color: "warning" },
  sent: { category: "Transfers", color: "primary" },
  received: { category: "Others", color: "muted" },
  topup: { category: "Others", color: "muted" },
};

function monthBounds(month: Date): { start: Date; end: Date } {
  return {
    start: new Date(month.getFullYear(), month.getMonth(), 1),
    end: new Date(month.getFullYear(), month.getMonth() + 1, 1),
  };
}

function txnsInMonth(month: Date): Transaction[] {
  const { start, end } = monthBounds(month);
  return allTransactions.filter(
    (t) => t.timestamp >= start && t.timestamp < end,
  );
}

function sumIn(list: Transaction[]): number {
  return list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
}
function sumOut(list: Transaction[]): number {
  return list
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

function pctTrend(current: number, base: number): string {
  if (base === 0) return current > 0 ? "New this month" : "No change";
  const pct = Math.round(((current - base) / base) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs last month`;
}

export interface MonthlyAnalytics {
  summary: {
    in: number;
    out: number;
    net: number;
    trend: { in: string; out: string; net: string };
  };
  cashFlow: Array<{ date: string; in: number; out: number }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    color: CategoryColor;
  }>;
  topRecipients: Array<{
    id: string;
    name: string;
    count: number;
    total: number;
    type: "person" | "merchant";
  }>;
}

export function getMonthlyAnalytics(month: Date): MonthlyAnalytics {
  const list = txnsInMonth(month);
  const prev = txnsInMonth(
    new Date(month.getFullYear(), month.getMonth() - 1, 1),
  );

  const inflow = sumIn(list);
  const outflow = sumOut(list);
  const net = inflow - outflow;

  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cashFlow = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayTx = list.filter((t) => t.timestamp.getDate() === day);
    return { date: String(day), in: sumIn(dayTx), out: sumOut(dayTx) };
  });

  const catMap = new Map<string, { amount: number; color: CategoryColor }>();
  for (const t of list) {
    if (t.amount >= 0) continue;
    const { category, color } = CATEGORY_OF[t.type];
    const row = catMap.get(category) ?? { amount: 0, color };
    row.amount += Math.abs(t.amount);
    catMap.set(category, row);
  }
  const categoryBreakdown = [...catMap.entries()]
    .map(([category, { amount, color }]) => ({ category, amount, color }))
    .sort((a, b) => b.amount - a.amount);

  const recMap = new Map<
    string,
    { count: number; total: number; type: "person" | "merchant" }
  >();
  for (const t of list) {
    if (t.amount >= 0) continue;
    const type = t.type === "sent" ? "person" : "merchant";
    const row = recMap.get(t.counterparty) ?? { count: 0, total: 0, type };
    row.count += 1;
    row.total += Math.abs(t.amount);
    recMap.set(t.counterparty, row);
  }
  const topRecipients = [...recMap.entries()]
    .map(([name, v], i) => ({ id: `rec_${i}`, name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    summary: {
      in: inflow,
      out: outflow,
      net,
      trend: {
        in: pctTrend(inflow, sumIn(prev)),
        out: pctTrend(outflow, sumOut(prev)),
        net:
          net >= 0
            ? `+${nairaShort(net)} saved`
            : `${nairaShort(net)} overspent`,
      },
    },
    cashFlow,
    categoryBreakdown,
    topRecipients,
  };
}

function nairaShort(n: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getYearlyTrend(): Array<{ month: string; net: number }> {
  const now = new Date();
  const out: Array<{ month: string; net: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const list = txnsInMonth(m);
    let net = list.reduce((s, t) => s + t.amount - t.fee, 0);
    if (list.length === 0) {
      // Deterministic synthetic net for months without seeded data.
      const seed = m.getFullYear() * 12 + m.getMonth();
      net = (((seed * 37) % 13) - 6) * 15000;
    }
    out.push({
      month: m.toLocaleDateString("en-NG", { month: "short" }),
      net: Math.round(net),
    });
  }
  return out;
}
