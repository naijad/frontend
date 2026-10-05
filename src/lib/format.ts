const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

/** Format a Naira amount, e.g. `formatNaira(248500)` → "₦248,500.00". */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount);
}

const nairaShortFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** No-decimals Naira, e.g. `formatNairaShort(42500)` → "₦42,500". */
export function formatNairaShort(amount: number): string {
  return nairaShortFormatter.format(amount);
}

/** Compact Naira for chart axes: "₦50k", "₦1.2m", "₦0". */
export function formatNairaCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}₦${m % 1 === 0 ? m : m.toFixed(1)}m`;
  }
  if (abs >= 1_000) return `${sign}₦${Math.round(abs / 1_000)}k`;
  return `${sign}₦${abs}`;
}

/** Full timestamp for a receipt: "12 September 2025 at 2:14 PM". */
export function formatTimestamp(date: Date): string {
  const day = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} at ${time}`;
}

/**
 * Human-friendly transaction timestamp: "Today, 10:42 AM",
 * "Yesterday, 3:18 PM", or "12 Mar, 9:05 AM".
 */
export function formatTransactionTime(date: Date): string {
  const now = new Date();
  const time = date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  const day = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
  return `${day}, ${time}`;
}
