export type AirtimeNetwork =
  | "MTN"
  | "AIRTEL"
  | "GLO"
  | "9MOBILE";

export type AirtimePurchase = {
  network: AirtimeNetwork;
  networkName: string;
  phone: string;
  displayPhone: string;
  amount: number;
  fee: number;
  total: number;
};

export function normalizeNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("8")) {
    return `234${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("234")) {
    return digits;
  }

  return digits;
}

export function formatNigerianPhone(phone: string) {
  const normalized = normalizeNigerianPhone(phone);

  if (normalized.length === 13 && normalized.startsWith("234")) {
    return `0${normalized.slice(3)}`;
  }

  return phone;
}

export function isValidNigerianPhone(phone: string) {
  const normalized = normalizeNigerianPhone(phone);

  return (
    normalized.length === 13 &&
    normalized.startsWith("234") &&
    normalized.slice(3).length === 10
  );
}