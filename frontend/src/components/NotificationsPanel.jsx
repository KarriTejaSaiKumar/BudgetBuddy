import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { relativeTime } from '../utils/formatters';

const toneStyles = {
  critical: { ring: 'bg-destructive/10 text-destructive', Icon: AlertTriangle },
  warning: { ring: 'bg-warning/12 text-warning', Icon: TriangleAlert },
  success: { ring: 'bg-success/10 text-success', Icon: CircleCheck },
  info: { ring: 'bg-info/10 text-info', Icon: Info },
};

/**
 * Right-hand slide-over over the real notification feed. Frosted panel on a
 * dimmed canvas, escape-to-close, single-tap read + delete.
 */
export default function NotificationsPanel({
  open,
  onClose,
  items = [],
  loading = false,
  unread = 0,
  onRead,
  onReadAll,
  onRemove,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn('fixed inset-0 z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background/85 backdrop-blur-xl',
          'shadow-[-1px_0_0_0_var(--color-hairline),var(--shadow-lg)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-5">
          <div className="flex items-center gap-2.5">
            <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-medium tracking-tight text-foreground">Notifications</h2>
            {unread > 0 && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-medium text-foreground">
                {unread} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-2.5">
            <p className="text-xs text-muted-foreground">{items.length} in your feed</p>
            <button
              onClick={onReadAll}
              disabled={unread === 0}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Mark all read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <p className="px-2 py-6 text-sm text-muted-foreground">Checking your finances…</p>
          ) : items.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <p className="text-sm font-medium text-foreground">All quiet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nothing needs your attention right now.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {items.slice(0, 20).map((n) => {
                const tone = toneStyles[n.priority] || toneStyles.info;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      'group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent/60',
                      !n.is_read && 'bg-accent/40',
                    )}
                  >
                    <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', tone.ring)}>
                      <tone.Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8125rem] font-medium leading-snug text-foreground">
                        {n.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {n.message}
                      </span>
                      <span className="mt-1.5 block text-[0.6875rem] text-muted-foreground/80">
                        {n.notification_type_display || n.notification_type} · {relativeTime(n.created_at)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      {!n.is_read && (
                        <button
                          onClick={() => onRead?.(n.id)}
                          aria-label={`Mark "${n.title}" as read`}
                          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemove?.(n.id)}
                        aria-label={`Dismiss "${n.title}"`}
                        className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-hairline p-3">
          <Button asChild variant="secondary" block onClick={onClose}>
            <Link to="/notifications">Open notification centre</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
