const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-US");
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export const formatCurrency = (value: number) => usd.format(value);
export const formatNumber = (value: number) => num.format(value);
export const formatPercent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : longDate.format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

/** "3h ago", "2d ago", falling back to a date after a week. */
export function formatRelative(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "—";
  const diff = now - new Date(iso).getTime();
  const future = diff < 0;
  const abs = Math.abs(diff);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (abs < min) return "just now";
  const wrap = (s: string) => (future ? `in ${s}` : `${s} ago`);
  if (abs < hour) return wrap(`${Math.round(abs / min)}m`);
  if (abs < day) return wrap(`${Math.round(abs / hour)}h`);
  if (abs < 7 * day) return wrap(`${Math.round(abs / day)}d`);
  return formatDate(iso);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function hostname(url: string | null | undefined): string {
  if (!url) return "—";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
