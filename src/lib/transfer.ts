export type TransferRecipient = {
  method: "ajora" | "bank";
  name: string;
  initials: string;
  ajoraPhone?: string;
  bankName?: string;
  accountNumber?: string;
};

export type TransferPayload = {
  recipient: TransferRecipient;
  amount: number;
  memo: string;
  fee: number;
  total: number;
  reference?: string;
  timestamp?: string;
};

/** A valid transfer payload in flight (confirm / pin / processing screens). */
export function isTransferPayload(value: unknown): value is TransferPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const r = v.recipient as Record<string, unknown> | undefined;
  return (
    typeof v.amount === "number" &&
    v.amount > 0 &&
    typeof v.fee === "number" &&
    typeof v.total === "number" &&
    !!r &&
    typeof r === "object" &&
    typeof r.name === "string" &&
    typeof r.initials === "string"
  );
}

/** A completed transfer (success screen) — reference + timestamp added. */
export function isCompletedTransfer(
  value: unknown,
): value is TransferPayload & { reference: string; timestamp: string } {
  if (!isTransferPayload(value)) return false;
  const v = value as TransferPayload;
  return typeof v.reference === "string" && typeof v.timestamp === "string";
}

/** "01234567890" → "01••••7890" (first 2, last 4, middle masked). */
export function maskAccount(account?: string): string {
  if (!account) return "";
  if (account.length <= 6) return account;
  return `${account.slice(0, 2)}••••${account.slice(-4)}`;
}

export function formatAjoraPhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
}
