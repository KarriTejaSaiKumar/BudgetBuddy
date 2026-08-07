/** Notifications API. */
import api from './api';

export const NOTIFICATION_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'budget', label: 'Budget' },
  { value: 'savings', label: 'Savings' },
  { value: 'report', label: 'Report' },
  { value: 'system', label: 'System' },
];

export const NOTIFICATION_PRIORITIES = [
  { value: 'info', label: 'Info', tone: 'info' },
  { value: 'success', label: 'Success', tone: 'success' },
  { value: 'warning', label: 'Warning', tone: 'warning' },
  { value: 'critical', label: 'Critical', tone: 'destructive' },
];

export const priorityTone = (priority) =>
  NOTIFICATION_PRIORITIES.find((p) => p.value === priority)?.tone || 'info';

const listOf = (data) => (Array.isArray(data) ? data : data?.results || []);

export async function listNotifications(params = {}) {
  const { data } = await api.get('/notifications/', { params });
  return listOf(data);
}

export async function listUnread() {
  const { data } = await api.get('/notifications/unread/');
  return listOf(data);
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count/');
  return Number(data?.unread_count ?? data?.count ?? 0) || 0;
}

export async function markRead(id) {
  const { data } = await api.post(`/notifications/${id}/read/`);
  return data;
}

export async function markAllRead() {
  const { data } = await api.post('/notifications/read-all/');
  return data;
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}/delete/`);
}

export async function deleteRead() {
  const { data } = await api.delete('/notifications/delete-read/');
  return data;
}
