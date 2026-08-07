/**
 * Income client-side helpers.
 *
 * TEMPORARY COMPATIBILITY LAYER — scheduled for removal.
 * ------------------------------------------------------
 * The Income model on the server currently stores only: source, amount,
 * description, date. `title`, `currency` and `transaction_time` are being
 * added. Until they land this module fills the gap:
 *
 *   title    -> first line of `description` (notes are the remaining lines)
 *   currency -> per-device meta map in localStorage
 *   time     -> per-device meta map in localStorage
 *
 * Everything is server-first: the moment the API returns the real columns,
 * `incomeCapabilities()` flips, the legacy reads/writes stop being reached
 * and the stale local map is purged automatically. No page needs editing.
 *
 * TO REMOVE THE SHIM once the migration ships, delete:
 *   parseDescription, buildDescription, readMetaMap, readMeta, writeMeta,
 *   removeMeta, purgeLegacyMeta, incomeCapabilities, noteCapabilities
 * and simplify decorateIncome / buildIncomePayload to read and send the
 * server fields directly. Callers keep the same signatures.
 */

const META_KEY = 'bb.income.meta';

export const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance / Side hustle' },
  { value: 'investments', label: 'Investments' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'other', label: 'Other' },
];

export const INCOME_CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'JPY', symbol: '¥' },
];

export const sourceLabel = (value) =>
  INCOME_SOURCES.find((s) => s.value === value)?.label || value || 'Other';

/* ------------------------------------------------------------------ *
 * Capability detection
 * ------------------------------------------------------------------ */

/**
 * What the API actually returns, learned from a real record rather than
 * hardcoded. Cached for the session; `null` means "not observed yet", in
 * which case we assume the columns are missing and keep the shim on.
 */
let caps = null;

/** Record the shape of a live API payload. Safe to call repeatedly. */
export function noteCapabilities(record) {
  if (!record || typeof record !== 'object') return incomeCapabilities();
  caps = {
    title: 'title' in record,
    currency: 'currency' in record,
    time: 'transaction_time' in record,
  };
  if (caps.currency && caps.time) purgeLegacyMeta();
  return caps;
}

/** Current capabilities. All false until a record proves otherwise. */
export function incomeCapabilities() {
  return caps || { title: false, currency: false, time: false };
}

/** True while any part of the local workaround is still in play. */
export const incomeShimActive = () => {
  const c = incomeCapabilities();
  return !(c.title && c.currency && c.time);
};

/* ------------------------------------------------------------------ *
 * Legacy shim (delete with the migration)
 * ------------------------------------------------------------------ */

/** Split the stored description into a title + notes pair. */
export function parseDescription(description, fallback = '') {
  const raw = (description || '').replace(/\r/g, '');
  if (!raw.trim()) return { title: fallback, notes: '' };
  const [first, ...rest] = raw.split('\n');
  return { title: first.trim() || fallback, notes: rest.join('\n').trim() };
}

/** Recombine a title + notes pair into the single description column. */
export function buildDescription(title, notes) {
  return [String(title || '').trim(), String(notes || '').trim()]
    .filter(Boolean)
    .join('\n')
    .slice(0, 500);
}

function readMetaMap() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Local-only extras (currency + time of day) for one income record. */
export function readMeta(id) {
  if (!id) return {};
  return readMetaMap()[id] || {};
}

export function writeMeta(id, meta) {
  if (!id) return;
  const map = readMetaMap();
  map[id] = { ...map[id], ...meta };
  try {
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    /* storage full or unavailable — extras are non-critical */
  }
}

export function removeMeta(id) {
  const map = readMetaMap();
  if (!(id in map)) return;
  delete map[id];
  try {
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** One-shot cleanup once the server owns currency + time. */
export function purgeLegacyMeta() {
  try {
    localStorage.removeItem(META_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ *
 * Read / write
 * ------------------------------------------------------------------ */

/** HH:MM:SS from the API → HH:MM for display and <input type="time">. */
export const shortTime = (value) => (typeof value === 'string' ? value.slice(0, 5) : '');

/**
 * Normalise an API record into everything the UI needs.
 * Server fields win; the shim only fills what the payload does not carry.
 */
export function decorateIncome(record) {
  const c = noteCapabilities(record);

  let title = c.title ? record.title || '' : '';
  let notes = record.description || '';
  if (!c.title) {
    const split = parseDescription(record.description, sourceLabel(record.source));
    title = split.title;
    notes = split.notes;
  }

  const legacy = c.currency && c.time ? {} : readMeta(record.id);

  return {
    ...record,
    title: title || sourceLabel(record.source),
    notes,
    currency: (c.currency ? record.currency : legacy.currency) || null,
    time: (c.time ? shortTime(record.transaction_time) : legacy.time) || null,
    amountValue: Number.parseFloat(record.amount || 0) || 0,
  };
}

/**
 * Build the create/update payload. Real fields are always sent — the server
 * ignores what it does not know — and the legacy description packing is only
 * added while the `title` column is still missing.
 */
export function buildIncomePayload({ title, source, amount, currency, date, time, notes }) {
  const c = incomeCapabilities();
  const payload = {
    source,
    amount,
    date,
    title: String(title || '').trim(),
    currency,
    transaction_time: time ? `${time}:00` : null,
    description: c.title ? String(notes || '').trim() : buildDescription(title, notes),
  };
  return payload;
}

/** Extras that still need a local home, or null when the server owns them. */
export function localExtras({ currency, time }) {
  const c = incomeCapabilities();
  if (c.currency && c.time) return null;
  return {
    ...(c.currency ? {} : { currency }),
    ...(c.time ? {} : { time }),
  };
}

/** Today's date + current time, pre-filled for the Add Income form. */
export function nowLocalParts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
