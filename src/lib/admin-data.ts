import "server-only";

import { connection } from "next/server";
import { getInsforgeAdmin, throwInsforgeError } from "./insforge-admin";
import { ORDER_STATUSES, type OrderStatus } from "./order-statuses";
import { toProduct, type Product, type ProductRecord } from "./data";

export async function getAdminProducts(): Promise<Product[]> {
  await connection();
  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("id, slug, name, description, price, category, images, stock, featured, created_at")
    .order("id", { ascending: false })
    .limit(500);
  throwInsforgeError(error);
  return ((data ?? []) as ProductRecord[]).map(toProduct);
}

export async function getAdminProduct(id: number): Promise<Product | null> {
  await connection();
  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("id, slug, name, description, price, category, images, stock, featured, created_at")
    .eq("id", id)
    .maybeSingle();
  throwInsforgeError(error);
  return data ? toProduct(data as ProductRecord) : null;
}

export type AdminOrder = {
  id: number;
  ref: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  message: string;
  created_at: string;
  items: {
    id: number;
    order_id: number;
    product_id: number | null;
    product_name: string;
    price: number;
    qty: number;
  }[];
  item_count: number;
};

type OrderRecord = Omit<AdminOrder, "items" | "item_count">;
type OrderItemRecord = AdminOrder["items"][number];

async function attachItems(orders: OrderRecord[]): Promise<AdminOrder[]> {
  if (orders.length === 0) return [];

  const { data, error } = await getInsforgeAdmin()
    .database.from("order_items")
    .select("id, order_id, product_id, product_name, price, qty")
    .in("order_id", orders.map((order) => order.id))
    .order("id")
    .limit(5000);
  throwInsforgeError(error);

  const grouped = new Map<number, OrderItemRecord[]>();
  for (const item of (data ?? []) as OrderItemRecord[]) {
    const bucket = grouped.get(item.order_id) ?? [];
    bucket.push(item);
    grouped.set(item.order_id, bucket);
  }

  return orders.map((order) => {
    const items = grouped.get(order.id) ?? [];
    return {
      ...order,
      items,
      item_count: items.reduce((sum, item) => sum + item.qty, 0),
    };
  });
}

export async function getAdminOrders(status?: string): Promise<AdminOrder[]> {
  await connection();
  let query = getInsforgeAdmin()
    .database.from("orders")
    .select("id, ref, customer_name, phone, address, note, subtotal, total, status, message, created_at");
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) {
    query = query.eq("status", status);
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(200);
  throwInsforgeError(error);
  return attachItems((data ?? []) as OrderRecord[]);
}

export async function getAdminOrder(id: number): Promise<AdminOrder | null> {
  await connection();
  const { data, error } = await getInsforgeAdmin()
    .database.from("orders")
    .select("id, ref, customer_name, phone, address, note, subtotal, total, status, message, created_at")
    .eq("id", id)
    .maybeSingle();
  throwInsforgeError(error);
  if (!data) return null;
  const [order] = await attachItems([data as OrderRecord]);
  return order ?? null;
}

export async function getOrderByRef(ref: string): Promise<AdminOrder | null> {
  await connection();
  const { data, error } = await getInsforgeAdmin()
    .database.from("orders")
    .select("id, ref, customer_name, phone, address, note, subtotal, total, status, message, created_at")
    .eq("ref", ref)
    .maybeSingle();
  throwInsforgeError(error);
  if (!data) return null;
  const [order] = await attachItems([data as OrderRecord]);
  return order ?? null;
}

export type DashboardStats = {
  revenue: number;
  orderCount: number;
  pendingCount: number;
  productCount: number;
  unitCount: number;
  salesByDay: { day: string; total: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  recentOrders: AdminOrder[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();
  const { data, error } = await getInsforgeAdmin().database.rpc(
    "get_store_dashboard_stats",
    {},
  );
  throwInsforgeError(error);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("InsForge returned invalid dashboard statistics.");
  }
  return data as DashboardStats;
}
