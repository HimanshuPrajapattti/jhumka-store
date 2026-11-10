import "server-only";

import crypto from "node:crypto";
import {
  validateCheckoutInput,
  type CheckoutInput,
  type CreatedOrder,
} from "./checkout-input";
import { getInsforgeAdmin, throwInsforgeError } from "./insforge-admin";

export async function createStoreOrder(
  input: CheckoutInput,
): Promise<CreatedOrder> {
  const validated = validateCheckoutInput(input);
  const ref = `AVR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const { data, error } = await getInsforgeAdmin().database.rpc(
    "place_store_order",
    {
      p_ref: ref,
      p_name: validated.name,
      p_phone: validated.phone,
      p_address: validated.address,
      p_note: validated.note,
      p_items: validated.items,
    },
  );
  throwInsforgeError(error);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("InsForge returned an invalid order response.");
  }

  const result = data as Record<string, unknown>;
  if (result.error === "invalid_cart") {
    throw new Error("Your cart looks empty or contains too many pieces.");
  }
  if (result.error === "product_unavailable") {
    throw new Error("A piece in your cart is no longer available.");
  }
  if (result.error === "out_of_stock") {
    const name = typeof result.name === "string" ? result.name : "this piece";
    const available =
      typeof result.available === "number" ? result.available : 0;
    throw new Error(`Only ${available} left of "${name}".`);
  }
  if (
    typeof result.ref !== "string" ||
    typeof result.message !== "string" ||
    typeof result.total !== "number"
  ) {
    throw new Error("InsForge returned an incomplete order response.");
  }
  return { ref: result.ref, message: result.message, total: result.total };
}
