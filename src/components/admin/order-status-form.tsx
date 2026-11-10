"use client";

import { useFormStatus } from "react-dom";
import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUSES } from "@/lib/order-statuses";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="label-caps rounded-full bg-maroon px-6 py-3 text-ivory transition hover:bg-maroon-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : "Update"}
    </button>
  );
}

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  return (
    <form action={updateOrderStatus} className="space-y-4">
      <input type="hidden" name="id" value={orderId} />
      <label className="block">
        <span className="label-caps text-ash">Order status</span>
        <select
          name="status"
          defaultValue={status}
          className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition focus:border-maroon focus:bg-ivory"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton />
    </form>
  );
}
