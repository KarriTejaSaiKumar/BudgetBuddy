import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  CircleCheck,
  Info,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useNotifications } from '../hooks/useNotifications';
import { NOTIFICATION_TYPES, priorityTone } from '../services/notifications';
import { relativeTime } from '../utils/formatters';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Select,
  Skeleton,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { cn } from '@/lib/utils';

const toneIcon = {
  destructive: AlertTriangle,
  warning: TriangleAlert,
  success: CircleCheck,
  info: Info,
};

const toneRing = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/12 text-warning',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
};

const Notifications = () => {
  const { items, unread, loading, error, read, readAll, remove, clearRead } = useNotifications();
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter((n) => {
        if (tab === 'unread' && n.is_read) return false;
        if (tab === 'read' && !n.is_read) return false;
        if (type !== 'all' && n.notification_type !== type) return false;
        return true;
      }),
    [items, tab, type],
  );

  const critical = items.filter((n) => n.priority === 'critical' && !n.is_read).length;

  const list = (
    <div className="space-y-2">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-3 h-3 w-full max-w-md" />
          </Card>
        ))
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellOff}
            title="Nothing here"
            description="Notifications about budgets, savings and reports will land in this feed."
          />
        </Card>
      ) : (
        filtered.map((n) => {
          const tone = priorityTone(n.priority);
          const Icon = toneIcon[tone] || Info;
          return (
            <Card
              key={n.id}
              className={cn(
                'flex gap-4 p-4 transition-colors sm:p-5',
                !n.is_read && 'bg-accent/40',
              )}
            >
              <span className={cn('mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl', toneRing[tone])}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {!n.is_read && <Badge variant="outline">New</Badge>}
                  <Badge variant="secondary">{n.notification_type_display || n.notification_type}</Badge>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-[0.6875rem] text-muted-foreground/80">
                  {n.priority_display || n.priority} · {relativeTime(n.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {!n.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Mark "${n.title}" as read`}
                    onClick={() => read(n.id)}
                  >
                    <Check className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete "${n.title}"`}
                  onClick={() => remove(n.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <AppLayout title="Notifications">
      <PageHeader
        eyebrow="Signals"
        title="Notifications"
        description="Everything BudgetBuddy noticed while you were away — quiet by design."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={readAll} disabled={unread === 0}>
              <CheckCheck className="size-4" /> Mark all read
            </Button>
            <Button variant="outline" onClick={() => setConfirmClear(true)}>
              <Trash2 className="size-4" /> Clear read
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="destructive" title="Could not load notifications" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="In your feed" value={String(items.length)} icon={Bell} loading={loading} />
        <StatCard label="Unread" value={String(unread)} icon={Info} tone="info" loading={loading} />
        <StatCard
          label="Needs attention"
          value={String(critical)}
          icon={AlertTriangle}
          tone={critical > 0 ? 'destructive' : 'muted'}
          loading={loading}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by type"
            className="w-44"
          >
            <option value="all">All types</option>
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <TabsContent value="all">{list}</TabsContent>
        <TabsContent value="unread">{list}</TabsContent>
        <TabsContent value="read">{list}</TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear read notifications?"
        description="Read notifications will be permanently removed from your account."
        confirmLabel="Clear them"
        onConfirm={() => {
          clearRead();
          setConfirmClear(false);
        }}
      />
    </AppLayout>
  );
};

export default Notifications;
