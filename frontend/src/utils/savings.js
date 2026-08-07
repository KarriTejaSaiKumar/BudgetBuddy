/**
 * Savings goal service.
 *
 * Backed by the real /api/savings/ endpoints. The SavingsGoal model stores
 * goal_name, target_amount, current_amount, deadline and notes; is_completed,
 * remaining_amount, progress_percentage, days_remaining and status are all
 * computed server-side and returned by the serializer.
 */
import api from '../services/api';

const LEGACY_KEY = 'bb.savings.goals';

const pad = (n) => String(n).padStart(2, '0');

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const daysUntil = (deadline) => {
  if (!deadline) return null;
  const end = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end - start) / 86400000);
};

const STATUS_TONES = {
  Completed: { key: 'done', label: 'Completed', tone: 'success' },
  Overdue: { key: 'overdue', label: 'Past deadline', tone: 'destructive' },
  'Not Started': { key: 'behind', label: 'Not started', tone: 'warning' },
  'In Progress': { key: 'active', label: 'On track', tone: 'info' },
};

/** Map the server's status string onto the tone the cards expect. */
export function goalStatus(record, pct) {
  const base = STATUS_TONES[record.status] || STATUS_TONES['In Progress'];
  const left = daysUntil(record.deadline);
  if (base.key === 'active' && left != null && left <= 30 && pct < 75) {
    return { key: 'behind', label: 'Needs a push', tone: 'warning', pct };
  }
  return { ...base, pct };
}

/** Turn one API goal into the view model the cards use. */
export function decorateGoal(record) {
  const target = Number(record.target_amount) || 0;
  const saved = Number(record.current_amount) || 0;
  const remaining = Number(record.remaining_amount ?? Math.max(target - saved, 0)) || 0;
  const pct = Number(record.progress_percentage ?? (target > 0 ? (saved / target) * 100 : 0)) || 0;
  const left = record.days_remaining ?? daysUntil(record.deadline);
  return {
    ...record,
    target,
    saved,
    remaining,
    daysLeft: left,
    monthlyNeeded: left != null && left > 0 ? remaining / Math.max(1, left / 30) : remaining,
    status: goalStatus(record, pct),
  };
}

export async function listGoals() {
  const { data } = await api.get('/savings/');
  return (Array.isArray(data) ? data : []).map(decorateGoal);
}

export async function getSummary() {
  const { data } = await api.get('/savings/summary/');
  return data;
}

export async function createGoal(values) {
  const { data } = await api.post('/savings/create/', values);
  return decorateGoal(data);
}

export async function updateGoal(id, values) {
  const { data } = await api.put(`/savings/${id}/update/`, values);
  return decorateGoal(data);
}

export async function deleteGoal(id) {
  await api.delete(`/savings/${id}/delete/`);
}

/**
 * Add (or subtract) money on a goal. The serializer rejects a current amount
 * above the target, so contributions clamp at the target.
 */
export async function contribute(goal, amount) {
  const delta = Number(amount) || 0;
  const target = Number(goal.target_amount) || 0;
  const next = Math.min(target, Math.max(0, (Number(goal.current_amount) || 0) + delta));
  return updateGoal(goal.id, {
    goal_name: goal.goal_name,
    target_amount: goal.target_amount,
    current_amount: next.toFixed(2),
    deadline: goal.deadline,
    notes: goal.notes || '',
  });
}

/** Goals saved on this device before /api/savings/ existed, if any remain. */
export function readLegacyGoals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearLegacyGoals() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing to clean up */
  }
}

/** One-click move of device-only goals into the account. */
export async function importLegacyGoals() {
  const legacy = readLegacyGoals();
  let imported = 0;
  for (const g of legacy) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await createGoal({
        goal_name: g.goal_name || 'Imported goal',
        target_amount: Number(g.target_amount) || 0,
        current_amount: Number(g.current_amount) || 0,
        deadline: g.deadline || todayISO(),
        notes: g.notes || '',
      });
      imported += 1;
    } catch {
      /* skip goals the server rejects (e.g. a deadline already in the past) */
    }
  }
  clearLegacyGoals();
  return { imported, total: legacy.length };
}
