import Link from "next/link";
import { getAdminOrders } from "@/lib/admin-data";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { formatDbDate, formatINR } from "@/lib/format";
import { StatusPill } from "@/components/admin/status-pill";

const TABS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  ...ORDER_STATUSES.map((s) => ({
    key: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  })),
];

export default async function AdminOrdersPage(
  props: PageProps<"/admin/orders">,
) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = ORDER_STATUSES.includes(raw as (typeof ORDER_STATUSES)[number])
    ? raw
    : "";

  const all = await getAdminOrders();
  const counts = new Map<string, number>();
  for (const order of all) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  const orders = status ? all.filter((o) => o.status === status) : all;

  return (
    <div className="space-y-8">
      <div>
        <p className="label-caps text-gold-deep">Fulfilment</p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
          Orders
        </h1>
        <p className="mt-1 text-sm text-ash">
          {all.length} {all.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2.5">
        {TABS.map((tab) => {
          const active = status === tab.key;
          const count =
            tab.key === ""
              ? all.length
              : (counts.get(tab.key) ?? 0);
          return (
            <Link
              key={tab.key}
              href={tab.key ? `/admin/orders?status=${tab.key}` : "/admin/orders"}
              className={`label-caps rounded-full border px-5 py-2.5 transition ${
                active
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-sand bg-ivory text-ash hover:border-maroon hover:text-maroon"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-[10px] ${active ? "text-gold" : "text-gold-deep"}`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/60 bg-ivory px-8 py-16 text-center">
          <p className="font-display text-3xl text-maroon-deep">
            {status ? `No ${status} orders` : "No orders yet"}
          </p>
          <p className="mt-2 text-sm text-ash">
            Customer orders from the website land here — and in your WhatsApp.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex flex-col gap-4 rounded-2xl border border-sand bg-ivory p-5 transition hover:border-gold/70 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-xl font-semibold text-maroon-deep">
                      {order.ref}
                    </span>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-ash">
                    {order.customer_name} · {order.phone}
                  </p>
                  <p className="mt-0.5 text-xs text-ash">
                    {formatDbDate(order.created_at)} · {order.item_count}{" "}
                    {order.item_count === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-display text-2xl font-semibold text-maroon">
                    {formatINR(order.total)}
                  </span>
                  <span className="label-caps text-gold-deep">Open →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
