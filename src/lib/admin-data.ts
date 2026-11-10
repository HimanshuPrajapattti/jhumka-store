import { getDb, parseImages, ORDER_STATUSES, type OrderRow, type OrderItemRow, type ProductRow, type OrderStatus } from "./db";
import type { Product } from "./data";

/**
 * Uncached reads for the admin panel.
 * Admin routes opt out of prerendering (`instant = false`), so these always
 * return fresh data on every request.
 */

export function getAdminProducts(): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products ORDER BY id DESC")
    .all() as ProductRow[];
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    images: parseImages(row.images),
    stock: row.stock,
    featured: row.featured === 1,
  }));
}

export function getAdminProduct(id: number): Product | null {
  const row = getDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as ProductRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    images: parseImages(row.images),
    stock: row.stock,
    featured: row.featured === 1,
  };
}

export type AdminOrder = OrderRow & { items: OrderItemRow[]; item_count: number };

export function getAdminOrders(status?: string): AdminOrder[] {
  const db = getDb();
  const rows = (
    status && ORDER_STATUSES.includes(status as OrderStatus)
      ? db
          .prepare("SELECT * FROM orders WHERE status = ? ORDER BY datetime(created_at) DESC")
          .all(status)
      : db.prepare("SELECT * FROM orders ORDER BY datetime(created_at) DESC").all()
  ) as OrderRow[];

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  return rows.map((row) => {
    const items = itemsStmt.all(row.id) as OrderItemRow[];
    return {
      ...row,
      items,
      item_count: items.reduce((sum, i) => sum + i.qty, 0),
    };
  });
}

export function getAdminOrder(id: number): AdminOrder | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | OrderRow
    | undefined;
  if (!row) return null;
  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(id) as OrderItemRow[];
  return { ...row, items, item_count: items.reduce((s, i) => s + i.qty, 0) };
}

export function getOrderByRef(ref: string): AdminOrder | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE ref = ?").get(ref) as
    | OrderRow
    | undefined;
  if (!row) return null;
  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(row.id) as OrderItemRow[];
  return { ...row, items, item_count: items.reduce((s, i) => s + i.qty, 0) };
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

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total END), 0) AS revenue,
         COUNT(*) AS orders,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending
       FROM orders`,
    )
    .get() as { revenue: number; orders: number; pending: number };

  const productCount = (
    db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }
  ).n;

  const unitCount = (
    db
      .prepare(
        `SELECT COALESCE(SUM(oi.qty), 0) AS n
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled'`,
      )
      .get() as { n: number }
  ).n;

  const salesByDay = db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS day,
              SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) AS total
       FROM orders
       WHERE created_at >= datetime('now', '-13 days', 'start of day')
       GROUP BY day
       ORDER BY day`,
    )
    .all() as { day: string; total: number }[];

  const topProducts = db
    .prepare(
      `SELECT oi.product_name AS name,
              SUM(oi.qty) AS qty,
              SUM(oi.qty * oi.price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'cancelled'
       GROUP BY oi.product_name
       ORDER BY revenue DESC
       LIMIT 5`,
    )
    .all() as { name: string; qty: number; revenue: number }[];

  const recentIds = db
    .prepare("SELECT id FROM orders ORDER BY datetime(created_at) DESC LIMIT 6")
    .all() as { id: number }[];

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  const orderStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
  const recentOrders = recentIds
    .map(({ id }) => {
      const row = orderStmt.get(id) as OrderRow | undefined;
      if (!row) return null;
      const items = itemsStmt.all(id) as OrderItemRow[];
      return {
        ...row,
        items,
        item_count: items.reduce((s, i) => s + i.qty, 0),
      } as AdminOrder;
    })
    .filter((o): o is AdminOrder => o !== null);

  return {
    revenue: totals.revenue,
    orderCount: totals.orders,
    pendingCount: totals.pending,
    productCount,
    unitCount,
    salesByDay,
    topProducts,
    recentOrders,
  };
}
