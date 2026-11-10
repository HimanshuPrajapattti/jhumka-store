import { formatINR } from "./format";

export { formatINR } from "./format";

export function getBusinessNumber(): string {
  const raw = (process.env.WHATSAPP_NUMBER || "919256863315").replace(/\D/g, "");
  return raw;
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function businessLink(text: string): string {
  return waLink(getBusinessNumber(), text);
}

/** Normalise an Indian mobile number to international digits (91…). */
export function normalizeCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 12) return `91${digits.slice(1)}`;
  return digits;
}

export type OrderMessageItem = {
  name: string;
  price: number;
  qty: number;
};

export type OrderMessageInput = {
  ref: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderMessageItem[];
  total: number;
};

/**
 * The formatted order message that lands in the business WhatsApp inbox.
 * Uses WhatsApp's *bold* markup so it reads beautifully on the phone.
 */
export function buildOrderMessage(input: OrderMessageInput): string {
  const lines: string[] = [];
  lines.push("🛍️ *New Order — AVRANI*");
  lines.push(`Ref: ${input.ref}`);
  lines.push("");
  lines.push("*Items:*");

  input.items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name}`);
    lines.push(`   ${formatINR(item.price)} × ${item.qty} = ${formatINR(item.price * item.qty)}`);
  });

  lines.push("");
  lines.push(`*Total: ${formatINR(input.total)}*`);
  lines.push("");
  lines.push("*Customer:*");
  lines.push(`Name: ${input.customerName}`);
  lines.push(`Phone: ${input.phone}`);
  lines.push(`Address: ${input.address}`);
  if (input.note?.trim()) {
    lines.push(`Note: ${input.note.trim()}`);
  }
  lines.push("");
  lines.push("— ordered via AVRANI website");

  return lines.join("\n");
}

/** Friendly WhatsApp reply the business can send to a customer. */
export function buildReplyMessage(customerName: string, ref: string): string {
  return `Hi ${customerName}! 👋 Thank you for your order ${ref} at AVRANI. We've received it and will confirm your shipping details shortly. ✨`;
}
