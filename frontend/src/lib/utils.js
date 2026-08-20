import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional + conflicting Tailwind classes. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency. Defaults to INR, the app's primary currency. */
export function formatCurrency(value, currency = "INR", locale = "en-IN") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Short, human date: 12 Aug 2026 */
export function formatDate(value, locale = "en-IN") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}
