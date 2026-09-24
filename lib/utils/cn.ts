/** Join class names, keeping only non-empty strings. Keep variant maps non-overlapping instead of relying on merge magic. */
export function cn(...classes: unknown[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}
