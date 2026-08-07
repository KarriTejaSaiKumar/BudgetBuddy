/** Reports API, including authenticated PDF / CSV downloads. */
import api from './api';

export const REPORT_PERIODS = [
  { value: 'current_month', label: 'This month' },
  { value: 'previous_month', label: 'Last month' },
  { value: 'current_year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

export async function getMonthlyReport(params) {
  const { data } = await api.get('/reports/monthly/', { params });
  return data || {};
}

export async function getExpenseReport(params) {
  const { data } = await api.get('/reports/expenses/', { params });
  return data || {};
}

export async function getIncomeReport(params) {
  const { data } = await api.get('/reports/incomes/', { params });
  return data || {};
}

export async function getSavingsReport(params) {
  const { data } = await api.get('/reports/savings/', { params });
  return data || {};
}

export async function getCombinedReport(params) {
  const { data } = await api.get('/reports/combined/', { params });
  return data || {};
}

/**
 * Download an export through the authenticated axios instance so the JWT
 * header is attached, then hand the blob to the browser.
 */
export async function downloadReport(kind, format, params) {
  const response = await api.get(`/reports/export/${kind}/${format}/`, {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `budgetbuddy-${kind}-report.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
