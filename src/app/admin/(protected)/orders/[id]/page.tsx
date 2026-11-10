import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/admin-data";
import { formatDbDate, formatINR } from "@/lib/format";
import {
  buildReplyMessage,
  normalizeCustomerPhone,
  waLink,
} from "@/lib/whatsapp";
import { StatusPill } from "@/components/admin/status-pill";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { CopyMessageButton } from "@/components/admin/copy-message-button";

export default async function AdminOrderDetailPage(
  props: PageProps<"/admin/orders/[id]">,
) {
  const { id } = await props.params;
  const orderId = Number(id);
  const order = Number.isInteger(orderId) ? await getAdminOrder(orderId) : null;

  if (!order) notFound();

  const customerWa = normalizeCustomerPhone(order.phone);
  const replyUrl = waLink(
    customerWa,
    buildReplyMessage(order.customer_name, order.ref),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="label-caps text-ash hover:text-maroon"
          >
            ← All orders
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold text-maroon-deep">
              {order.ref}
            </h1>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1 text-sm text-ash">
            {formatDbDate(order.created_at)}
          </p>
        </div>

        <div className="text-right">
          <p className="label-caps text-ash">Order total</p>
          <p className="font-display text-4xl font-semibold text-maroon">
            {formatINR(order.total)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* ---------- Items ---------- */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-sand bg-ivory p-6">
            <h2 className="mb-4 font-display text-2xl font-semibold text-maroon-deep">
              Items ({order.item_count})
            </h2>
            <ul className="divide-y divide-sand">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-ash">
                      {formatINR(item.price)} × {item.qty}
                    </p>
                  </div>
                  <p className="font-medium text-maroon-deep">
                    {formatINR(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp message preview */}
          <div className="rounded-2xl border border-sand bg-ivory p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-maroon-deep">
                WhatsApp message
              </h2>
              <div className="flex gap-2.5">
                <CopyMessageButton text={order.message} />
                <a
                  href={replyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-caps rounded-full bg-[#0f7a52] px-5 py-2.5 text-white transition hover:bg-[#0c6544]"
                >
                  Reply to customer
                </a>
              </div>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-cream/70 p-5 font-mono text-[13px] leading-relaxed text-ink">
              {order.message || "No message stored."}
            </pre>
          </div>
        </div>

        {/* ---------- Side ---------- */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-sand bg-ivory p-6">
            <h2 className="mb-4 font-display text-2xl font-semibold text-maroon-deep">
              Customer
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="label-caps text-ash">Name</dt>
                <dd className="mt-1 text-base text-ink">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="label-caps text-ash">Phone</dt>
                <dd className="mt-1">
                  <a
                    href={`https://wa.me/${customerWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-maroon underline-offset-4 hover:underline"
                  >
                    +{customerWa}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label-caps text-ash">Address</dt>
                <dd className="mt-1 leading-relaxed text-ink">
                  {order.address}
                </dd>
              </div>
              {order.note && (
                <div>
                  <dt className="label-caps text-ash">Note</dt>
                  <dd className="mt-1 italic leading-relaxed text-maroon-deep">
                    “{order.note}”
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-sand bg-ivory p-6">
            <h2 className="mb-4 font-display text-2xl font-semibold text-maroon-deep">
              Fulfilment
            </h2>
            <OrderStatusForm orderId={order.id} status={order.status} />
            <p className="mt-4 text-xs leading-relaxed text-ash">
              Status changes save instantly. Cancelled orders are excluded from
              revenue and charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
