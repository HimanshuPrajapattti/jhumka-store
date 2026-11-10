export type CheckoutLine = { id: number; qty: number };

export type CheckoutInput = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  items: CheckoutLine[];
};

export type CreatedOrder = {
  ref: string;
  message: string;
  total: number;
};

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 12) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

export function validateCheckoutInput(input: CheckoutInput) {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Please enter your full name.");

  const phone = normalizePhone(input.phone);
  if (phone.length < 10 || phone.length > 15 || !/^\d+$/.test(phone)) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  const address = input.address.trim();
  if (address.length < 10) {
    throw new Error("Please enter your full delivery address.");
  }

  const items = (input.items ?? []).filter(
    (item) =>
      Number.isInteger(item.id) &&
      item.id > 0 &&
      Number.isInteger(item.qty) &&
      item.qty > 0 &&
      item.qty <= 20,
  );
  if (items.length === 0) {
    throw new Error("Your cart looks empty. Please add some pieces first.");
  }

  return { name, phone, address, note: input.note?.trim() ?? "", items };
}
