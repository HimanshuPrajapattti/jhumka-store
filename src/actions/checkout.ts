"use server";

import { updateTag } from "next/cache";
import { createOrderFromCart } from "@/lib/orders";
import { businessLink } from "@/lib/whatsapp";

export type CheckoutState = {
  ok?: boolean;
  error?: string;
  ref?: string;
  waUrl?: string;
} | null;

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const address = String(formData.get("address") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: { id: number; qty: number }[];
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
    if (!Array.isArray(parsed)) throw new Error("bad shape");
    items = parsed.map((raw: { id: unknown; qty: unknown }) => ({
      id: Number(raw.id),
      qty: Number(raw.qty),
    }));
  } catch {
    return { error: "Your cart looks empty. Please add some pieces first." };
  }

  try {
    const created = createOrderFromCart({
      name,
      phone,
      address,
      note,
      items,
    });

    // Catalog cache holds stock counts — expire it so views refresh.
    updateTag("products");

    return {
      ok: true,
      ref: created.ref,
      waUrl: businessLink(created.message),
    };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
    };
  }
}
