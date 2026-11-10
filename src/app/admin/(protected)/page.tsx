import Link from "next/link";
import { getDashboardStats } from "@/lib/admin-data";
import { formatDbDate, formatDbDay, formatINR } from "@/lib/format";
import { StatusPill } from "@/components/admin/status-pill";

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const maxDay = Math.max(1, ...stats.salesByDay.map((d) => d.total));

  const cards = [
    { label: "Revenue", value: formatINR(stats.revenue), note: "all confirmed orders" },
    { label: "Orders", value: String(stats.orderCount), note: `${stats.unitCount} pairs shipped-ish` },
    { label: "Pending", value: String(stats.pendingCount), note: "awaiting confirmation" },
    { label: "Products", value: String(stats.productCount), note: "live in the shop" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-gold-deep">Overview</p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
            Dashboard
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="label-caps rounded-full bg-maroon px-6 py-3 text-ivory transition hover:bg-maroon-deep"
        >
          + Add product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-sand bg-ivory p-5 sm:p-6"
          >
            <p className="label-caps text-ash">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-maroon-deep sm:text-4xl">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-ash">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="rounded-2xl border border-sand bg-ivory p-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="label-caps text-gold-deep">Last 14 days</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-maroon-deep">
              Daily sales
            </h2>
          </div>
          <p className="text-xs text-ash">excludes cancelled orders</p>
        </div>

        {stats.salesByDay.length === 0 ? (
          <p className="py-10 text-center text-sm text-ash">
            No sales yet — orders will chart here as they come in.
          </p>
        ) : (
          <div className="flex h-44 items-end gap-2">
            {stats.salesByDay.map((day) => {
              const height = Math.max(4, (day.total / maxDay) * 100);
              return (
                <div
                  key={day.day}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  title={`${formatDbDay(day.day)}: ${formatINR(day.total)}`}
                >
                  <span className="mb-1.5 whitespace-nowrap text-[10px] font-medium text-maroon opacity-0 transition group-hover:opacity-100">
                    {formatINR(day.total)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-maroon to-gold transition group-hover:from-maroon-deep"
                    style={{ height: `${height}%` }}
                  />
                  <span className="mt-2 text-[10px] tracking-wide text-ash">
                    {formatDbDay(day.day)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-sand bg-ivory p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-maroon-deep">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="label-caps text-maroon hover:text-gold-deep"
            >
              View all →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-ash">
              No orders yet. Your first one will show up right here.
            </p>
          ) : (
            <ul className="divide-y divide-sand">
              {stats.recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 transition hover:bg-cream/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-maroon-deep">
                        {order.ref}
                        <span className="ml-2 text-sm font-normal text-ash">
                          {order.customer_name}
                        </span>
                      </p>
                      <p className="text-xs text-ash">
                        {formatDbDate(order.created_at)} · {order.item_count}{" "}
                        {order.item_count === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-medium text-ink">
                        {formatINR(order.total)}
                      </span>
                      <StatusPill status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-sand bg-ivory p-6">
          <h2 className="mb-4 font-display text-2xl font-semibold text-maroon-deep">
            Top pieces
          </h2>

          {stats.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-ash">
              Sales by product appear here once orders come in.
            </p>
          ) : (
            <ul className="space-y-4">
              {stats.topProducts.map((product, i) => {
                const width = Math.max(
                  8,
                  (product.revenue / stats.topProducts[0].revenue) * 100,
                );
                return (
                  <li key={product.name}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate text-ink">
                        <span className="mr-2 font-display text-gold-deep">
                          {i + 1}.
                        </span>
                        {product.name}
                      </span>
                      <span className="shrink-0 text-ash">
                        {product.qty} sold · {formatINR(product.revenue)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
