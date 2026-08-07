/**
 * Budget client-side helpers.
 *
 * The Budget model stores budget_name, category, budget_amount, currency,
 * notes, start_date, end_date and is_active; month / year are derived from
 * start_date server-side. The list serializer also returns amount_spent,
 * remaining_amount, utilization_percentage and status, so nothing is
 * computed or cached locally any more.
 */
import {
  UtensilsCrossed,
  Plane,
  ShoppingBag,
  GraduationCap,
  Clapperboard,
  HeartPulse,
  ReceiptText,
  Shapes,
} from 'lucide-react';

/** Mirrors Budget.CATEGORY_CHOICES on the server. */
export const BUDGET_CATEGORIES = [
  { value: 'food', label: 'Food', icon: UtensilsCrossed },
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'entertainment', label: 'Entertainment', icon: Clapperboard },
  { value: 'healthcare', label: 'Healthcare', icon: HeartPulse },
  { value: 'bills', label: 'Bills', icon: ReceiptText },
  { value: 'miscellaneous', label: 'Miscellaneous', icon: Shapes },
];

/** Mirrors Budget.CURRENCY_CHOICES. */
export const BUDGET_CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'JPY', symbol: '¥' },
];

/**
 * Category metadata for a server value. Unknown values are shown as-is with
 * a neutral glyph instead of being collapsed into "Miscellaneous", so a
 * mismatch with the server vocabulary stays visible.
 */
export const budgetCategoryMeta = (value) => {
  const known = BUDGET_CATEGORIES.find((c) => c.value === value);
  if (known) return known;
  return { value, label: String(value ?? '—'), icon: Shapes, unknown: true };
};

export const budgetCategoryLabel = (value) => budgetCategoryMeta(value).label;

const pad = (n) => String(n).padStart(2, '0');

/** First day of a month + year, as an input[type=date] value. */
export const periodStart = (month, year) => `${year}-${pad(month)}-01`;

/** Last day of a month + year. */
export const periodEnd = (month, year) => {
  const last = new Date(Number(year), Number(month), 0).getDate();
  return `${year}-${pad(month)}-${pad(last)}`;
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const periodLabel = (month, year) => `${MONTHS[Number(month) - 1] || ''} ${year}`;

/** On track / near limit / over budget, from the server's utilization. */
export function budgetStatus(pct) {
  const used = Number(pct) || 0;
  if (used >= 100) return { key: 'over', label: 'Over budget', tone: 'destructive', pct: used };
  if (used >= 80) return { key: 'near', label: 'Near limit', tone: 'warning', pct: used };
  return { key: 'ok', label: 'On track', tone: 'success', pct: used };
}

/** Turn one API budget into the view model the cards and dialogs expect. */
export function decorateBudget(record) {
  const limit = Number.parseFloat(record.budget_amount || 0) || 0;
  const spent = Number(record.amount_spent ?? 0) || 0;
  const pct = Number(
    record.utilization_percentage ?? (limit > 0 ? (spent / limit) * 100 : 0),
  ) || 0;
  return {
    ...record,
    name: record.budget_name || budgetCategoryLabel(record.category),
    currency: record.currency || null,
    notes: record.notes || '',
    startDate: record.start_date || periodStart(record.month, record.year),
    endDate: record.end_date || periodEnd(record.month, record.year),
    isActive: record.is_active !== false,
    limit,
    spent,
    remaining: Number(record.remaining_amount ?? Math.max(limit - spent, 0)) || 0,
    overspent: Math.max(spent - limit, 0),
    status: budgetStatus(pct),
  };
}
