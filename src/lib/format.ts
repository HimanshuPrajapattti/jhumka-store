/** Display helpers shared by server and client code. */

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a SQLite `datetime('now')` string ("YYYY-MM-DD HH:MM:SS")
 * without ever constructing a Date object — safe during prerender.
 */
export function formatDbDate(value: string): string {
  const m = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/,
  );
  if (!m) return value;
  const [, year, month, day, hour, minute] = m;
  const monthLabel = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthLabel} ${year}, ${hour}:${minute}`;
}

export function formatDbDay(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return value;
  const [, , month, day] = m;
  const monthLabel = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthLabel}`;
}
