import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Progress } from '@/components/ui';
import { budgetCategoryMeta } from '../../utils/budgets';
import { formatCurrency, formatDate } from '../../utils/formatters';

/** One budget: limit, spend, remaining, rail, period, status. */
export default function BudgetCard({ budget, currency, dateFormat, numberFormat, onEdit, onDelete }) {
  const meta = budgetCategoryMeta(budget.category);
  const Icon = meta.icon;
  const code = budget.currency || currency;
  const money = (v) => formatCurrency(v, code, numberFormat);
  const pct = Math.min(999, Math.round(budget.status.pct));

  return (
    <Card interactive className="group flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{budget.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.label}</p>
        </div>
        <Badge variant={budget.status.tone}>{budget.status.label}</Badge>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="money text-xl tracking-tight text-foreground">{money(budget.spent)}</p>
          <p className="text-xs text-muted-foreground">
            of <span className="money">{money(budget.limit)}</span>
          </p>
        </div>
        <Progress
          value={budget.spent}
          max={budget.limit || 1}
          tone={budget.status.key === 'over' ? 'destructive' : budget.status.key === 'near' ? 'warning' : 'primary'}
          label={`${budget.name} budget`}
          className="mt-3"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{pct}% used</span>
          {budget.overspent > 0 ? (
            <span className="money text-destructive">{money(budget.overspent)} over</span>
          ) : (
            <span className="money text-muted-foreground">{money(budget.remaining)} left</span>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(budget.startDate, dateFormat)} — {formatDate(budget.endDate, dateFormat)}
        </p>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${budget.name}`} onClick={() => onEdit(budget)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${budget.name}`}
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(budget)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {budget.notes && <p className="-mt-1 line-clamp-2 text-xs text-muted-foreground">{budget.notes}</p>}
    </Card>
  );
}
