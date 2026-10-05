import { formatNaira } from "@/lib/format";
import type { TransferPayload } from "@/lib/transfer";

/** Plain-text receipt shared by the download and share actions. */
export function buildReceiptText(
  payload: TransferPayload & { reference: string; timestamp: string },
): string {
  const date = new Date(payload.timestamp);
  const dateStr = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const recipientLines =
    payload.recipient.method === "bank"
      ? `Bank: ${payload.recipient.bankName}\nAccount: •••• ${payload.recipient.accountNumber?.slice(-4)}`
      : `Ajora phone: ${payload.recipient.ajoraPhone}`;

  return `AJORA TRANSFER RECEIPT

Status: Successful
Amount: ${formatNaira(payload.amount)}

Recipient: ${payload.recipient.name}
${recipientLines}

Transfer fee: ${payload.fee === 0 ? "Free" : formatNaira(payload.fee)}
Total: ${formatNaira(payload.total)}

Reference: ${payload.reference}
Date: ${dateStr}
Time: ${timeStr}

Powered by Ajora — ajora.com`;
}
