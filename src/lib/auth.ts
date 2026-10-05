import { apiRequest } from "./api";
import { user, allTransactions, recentTransactions } from "./mock-data";

interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  account?: { accountNumber: string; balance: string; currency: string } | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: BackendUser; token: string };
}

interface DashboardResponse {
  success: boolean;
  data: {
    user: BackendUser;
    account: { accountNumber: string; balance: string; currency: string } | null;
    recentTransactions: BackendTransaction[];
  };
}

interface BackendTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  direction: string;
  title: string;
  description: string;
  amount: string;
  fee: string;
  currency: string;
  recipientName?: string | null;
  recipientAccount?: string | null;
  recipientBank?: string | null;
  createdAt: string;
}

function applyUser(apiUser: BackendUser) {
  const fullName = `${apiUser.firstName} ${apiUser.lastName}`.trim();
  const initials = fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  Object.assign(user, {
    name: apiUser.firstName,
    fullName,
    email: apiUser.email,
    phone: apiUser.phone,
    avatarInitials: initials,
    accountNumber: apiUser.account?.accountNumber ?? "",
    balance: Number(apiUser.account?.balance ?? 0),
    verified: true,
  });
}

function mapTransaction(t: BackendTransaction) {
  const direction = t.direction.toLowerCase();
  const rawType = t.type.toLowerCase();
  const type = rawType === "transfer" ? (direction === "income" ? "received" : "sent") :
    (["airtime", "data", "bill", "topup", "received", "sent"].includes(rawType) ? rawType : (direction === "income" ? "received" : "sent"));
  const amount = Number(t.amount);
  return {
    id: t.id,
    type: type as any,
    counterparty: t.recipientName || t.title || "Ajora transaction",
    counterpartyBank: t.recipientBank || undefined,
    counterpartyAccount: t.recipientAccount || undefined,
    reference: t.reference,
    memo: t.description,
    timestamp: new Date(t.createdAt),
    amount: direction === "income" ? Math.abs(amount) : -Math.abs(amount),
    fee: Number(t.fee),
    balanceAfter: 0,
    status: t.status.toLowerCase() as any,
  };
}

function applyTransactions(transactions: BackendTransaction[]) {
  const mapped = transactions.map(mapTransaction);
  allTransactions.splice(0, allTransactions.length, ...mapped);
  recentTransactions.splice(0, recentTransactions.length, ...mapped.slice(0, 5));
}

export async function login(identifier: string, password: string): Promise<void> {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  localStorage.setItem("ajora_token", response.data.token);
  applyUser(response.data.user);
  await hydrateSession();
}

export interface SignupPayload { fullName: string; phone: string; email: string; password: string }

export async function signup(values: SignupPayload): Promise<void> {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
  localStorage.setItem("ajora_token", response.data.token);
  applyUser(response.data.user);
}

export async function hydrateSession(): Promise<boolean> {
  const token = localStorage.getItem("ajora_token");
  if (!token) return false;
  try {
    const me = await apiRequest<{ data: { user: BackendUser } }>("/auth/me");
    applyUser(me.data.user);
    const dashboard = await apiRequest<DashboardResponse>("/dashboard");
    applyUser(dashboard.data.user);
    if (dashboard.data.recentTransactions) applyTransactions(dashboard.data.recentTransactions);
    return true;
  } catch {
    localStorage.removeItem("ajora_token");
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem("ajora_token");
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiRequest("/auth/password/change", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
}

export async function executeTransfer(payload: { recipientName: string; recipientAccount: string; recipientBank: string; amount: number; memo?: string }, pin: string) {
  const response = await apiRequest<{ data: { transaction: BackendTransaction; account: { balance: string } } }>("/transfers", {
    method: "POST",
    body: JSON.stringify({ ...payload, amount: String(payload.amount), pin }),
  });
  await hydrateSession();
  return response.data;
}
