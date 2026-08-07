import { useCallback, useEffect, useState } from 'react';
import {
  deleteNotification as apiDelete,
  deleteRead as apiDeleteRead,
  getUnreadCount,
  listNotifications,
  markAllRead,
  markRead,
} from '../services/notifications';

/**
 * Live notification feed backed by /api/notifications/.
 * Owns the list, the unread count and every write the UI can trigger.
 */
export function useNotifications({ auto = true } = {}) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([listNotifications(), getUnreadCount().catch(() => 0)]);
      setItems(list);
      setUnread(count || list.filter((n) => !n.is_read).length);
      setError('');
    } catch (err) {
      setError('We could not load your notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return undefined;
    if (!localStorage.getItem('access_token')) {
      setLoading(false);
      return undefined;
    }
    refresh();
    return undefined;
  }, [auto, refresh]);

  const read = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    try {
      await markRead(id);
    } catch {
      refresh();
    }
  }, [refresh]);

  const readAll = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await markAllRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const remove = useCallback(async (id) => {
    const removed = items.find((n) => n.id === id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (removed && !removed.is_read) setUnread((c) => Math.max(0, c - 1));
    try {
      await apiDelete(id);
    } catch {
      refresh();
    }
  }, [items, refresh]);

  const clearRead = useCallback(async () => {
    setItems((prev) => prev.filter((n) => !n.is_read));
    try {
      await apiDeleteRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  return { items, unread, loading, error, refresh, read, readAll, remove, clearRead };
}
