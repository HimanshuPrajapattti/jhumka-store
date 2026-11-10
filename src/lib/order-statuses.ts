/** Shared order-status vocabulary — safe to import from client components. */

export const ORDER_STATUSES = [
  "pending",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
