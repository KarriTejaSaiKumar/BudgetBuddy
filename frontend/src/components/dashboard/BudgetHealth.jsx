import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Progress, Skeleton } from '@/components/ui';
import { budgetCategoryMeta } from '../../utils/budgets';
import { cn } from '@/lib/utils';

/** Derive the three-state health label from spend against limit. */
export function budgetStatus(pct) {
  if (pct > 100) return { label: 'Over Budget', tone: 'destructive', bar: 'destructive' };
  if (pct >= 80) return { label: 'Near Limit', tone: 'warning', bar: 'warning' };
  return { label: 'On Track', tone: 'success', bar: 'success' };
}

function BudgetRow({ budget, format }) {
  const limit = Number.parseFloat(budget.budget_amount ?? 0) || 0;
  const spent = Number(budget.amount_spent ?? 0) || 0;
  const remaining = Number(budget.remaining_amount ?? limit - spent) || 0;
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const status = budgetStatus(pct);
  const meta = budgetCategoryMeta(budget.category);
  const Icon = meta.icon;

  return (
    <div className="rounded-xl p-3 transition-colors duration-200 hover:bg-accent/40">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {budget.budget_name || meta.label}
            </p>
            <p className="truncate text-xs text-muted-foreground">{meta.label}</p>
          </div>
        </div>
        <Badge variant={status.tone}>{status.label}</Badge>
      </div>

      <Progress
        className="mt-3"
        value={Math.min(100, pct)}
        tone={status.bar}
        label={`${budget.budget_name || meta.label} usage`}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          <span className="money text-foreground">{format(spent)}</span> spent of {format(limit)}
        </span>
        <span className={cn('money', remaining < 0 ? 'text-destructive' : 'text-muted-foreground')}>
          {remaining < 0 ? `${format(Math.abs(remaining))} over` : `${format(remaining)} left`}
        </span>
      </div>
    </div>
  );
}

export function BudgetHealth({ budgets = [], format, loading, className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle>Budget health</CardTitle>
          <p className="text-xs text-muted-foreground">Spending against your limits</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/budgets">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No budgets yet"
            description="One monthly limit is enough to make overspending obvious."
            action={
              <Button asChild variant="secondary">
                <Link to="/budgets">Create a budget</Link>
              </Button>
            }
          />
        ) : (
          budgets.slice(0, 4).map((b) => <BudgetRow key={b.id} budget={b} format={format} />)
        )}
      </CardContent>
    </Card>
  );
}
