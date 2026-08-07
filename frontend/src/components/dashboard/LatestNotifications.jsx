import React from 'react';
import { Link } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui';
import { priorityTone } from '../../services/notifications';
import { relativeTime } from '../../utils/formatters';

/** Section 9 — the five newest notifications, unread marked with a dot. */
export function LatestNotifications({ items = [], unread = 0, loading, className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle>Needs attention</CardTitle>
          <p className="text-xs text-muted-foreground">
            {unread > 0 ? `${unread} unread` : 'You are all caught up'}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/notifications">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : items.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="Nothing needs you today"
            description="Budget warnings and goal milestones will show up here."
          />
        ) : (
          items.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className="flex gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-accent/40"
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? 'bg-muted' : 'bg-primary'}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                  <Badge variant={priorityTone(n.priority)}>{n.priority_display || n.priority}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">{relativeTime(n.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
