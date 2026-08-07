/**
 * Expense client-side helpers.
 *
 * Everything the UI shows now lives on the server: the Expense model stores
 * title, amount, currency, category, payment_method, transaction_time,
 * description, expense_date and an optional budget foreign key. No local
 * metadata layer — the API is the single source of truth.
 */
import {
  Home,
  UtensilsCrossed,
  ShoppingBasket,
  Plug,
  Bus,
  Clapperboard,
  HeartPulse,
  Shapes,
  Banknote,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
} from 'lucide-react';

/** Mirrors Expense.CATEGORY_CHOICES on the server — do not invent new keys. */
export const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing / Rent', icon: Home },
  { value: 'food', label: 'Food', icon: UtensilsCrossed },
  { value: 'groceries', label: 'Groceries', icon: ShoppingBasket },
  { value: 'utilities', label: 'Utilities', icon: Plug },
  { value: 'transport', label: 'Transport', icon: Bus },
  { value: 'entertainment', label: 'Entertainment', icon: Clapperboard },
  { value: 'insurance', label: 'Insurance / Healthcare', icon: HeartPulse },
  { value: 'other', label: 'Other', icon: Shapes },
];

/** Mirrors Expense.PAYMENT_METHOD_CHOICES. */
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'credit_card', label: 'Credit card', icon: CreditCard },
  { value: 'debit_card', label: 'Debit card', icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank transfer', icon: Landmark },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
];

/** Mirrors Expense.CURRENCY_CHOICES (note: no AED for expenses). */
export const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'SGD', symbol: 'S$' },
];

/**
 * Category metadata for a server value. Unknown values are NOT folded into
 * "Other" — they are shown verbatim with a neutral glyph so a vocabulary
 * mismatch between the client and the API is visible rather than masked.
 */
export const categoryMeta = (value) => {
  const known = EXPENSE_CATEGORIES.find((c) => c.value === value);
  if (known) return known;
  return { value, label: String(value ?? '—'), icon: Shapes, unknown: true };
};

export const categoryLabel = (value) => categoryMeta(value).label;

export const paymentMeta = (value) => PAYMENT_METHODS.find((p) => p.value === value) || null;

export const paymentLabel = (value) => paymentMeta(value)?.label || '';

/** HH:MM:SS from the API → HH:MM for display and <input type="time">. */
export const shortTime = (value) => (typeof value === 'string' ? value.slice(0, 5) : '');

/** Normalise an API record into everything the UI needs. */
export function decorateExpense(record) {
  return {
    ...record,
    notes: record.description || '',
    currency: record.currency || null,
    time: shortTime(record.transaction_time),
    paymentMethod: record.payment_method || null,
    budgetId: record.budget || null,
    amountValue: Number.parseFloat(record.amount || 0) || 0,
  };
}

export function nowLocalParts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
