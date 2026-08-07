/** Analytics API — one call gives the whole dashboard payload. */
import api from './api';

export async function getAnalyticsDashboard(params = {}) {
  const { data } = await api.get('/analytics/dashboard/', { params });
  return data || {};
}

export async function getFinancialSummary() {
  const { data } = await api.get('/analytics/financial-summary/');
  return data || {};
}

export async function getRecentTransactions(limit = 10) {
  const { data } = await api.get('/analytics/recent-transactions/', { params: { limit } });
  return Array.isArray(data) ? data : data?.results || [];
}

/** '2026-03' → 'Mar 26' for chart axes. */
export function monthLabel(value) {
  if (typeof value !== 'string' || !value.includes('-')) return value || '';
  const [y, m] = value.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(m) - 1] || m} ${String(y).slice(2)}`;
}
