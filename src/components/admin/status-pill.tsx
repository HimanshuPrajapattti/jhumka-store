const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  packed: "bg-sky-100 text-sky-800 border-sky-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-neutral-200 text-neutral-600 border-neutral-300",
};

const LABELS: Record<string, string> = {
  pending: "Pending",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase ${
        STYLES[status] ?? STYLES.pending
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
