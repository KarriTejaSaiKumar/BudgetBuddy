import React from 'react';
import { CalendarDays, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Progress } from '@/components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';

/** One savings goal: target, saved, remaining, rail, deadline, status. */
export default function SavingsGoalCard({
  goal,
  currency,
  dateFormat,
  numberFormat,
  onEdit,
  onDelete,
  onContribute,
}) {
  const code = goal.currency || currency;
  const money = (v) => formatCurrency(v, code, numberFormat);
  const pct = Math.min(100, Math.round(goal.status.pct));

  const deadlineNote =
    goal.daysLeft == null
      ? null
      : goal.status.key === 'done'
        ? 'Goal reached'
        : goal.daysLeft < 0
          ? `${Math.abs(goal.daysLeft)} days late`
          : goal.daysLeft === 0
            ? 'Due today'
            : `${goal.daysLeft} days left`;

  return (
    <Card interactive className="group flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{goal.goal_name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            {formatDate(goal.deadline, dateFormat)}
            {deadlineNote && <span className="text-muted-foreground/70">· {deadlineNote}</span>}
          </p>
        </div>
        <Badge variant={goal.status.tone}>{goal.status.label}</Badge>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="money text-xl tracking-tight text-foreground">{money(goal.saved)}</p>
          <p className="text-xs text-muted-foreground">
            of <span className="money">{money(goal.target)}</span>
          </p>
        </div>
        <Progress
          value={goal.saved}
          max={goal.target || 1}
          tone={goal.status.key === 'done' ? 'success' : goal.status.key === 'overdue' ? 'destructive' : 'primary'}
          label={`${goal.goal_name} progress`}
          className="mt-3"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{pct}% saved</span>
          <span className="money text-muted-foreground">
            {goal.remaining > 0 ? `${money(goal.remaining)} to go` : 'Fully funded'}
          </span>
        </div>
      </div>

      {goal.notes && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{goal.notes}</p>}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onContribute(goal, 1)}
            aria-label={`Add to ${goal.goal_name}`}
          >
            <Plus /> Add
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onContribute(goal, -1)}
            aria-label={`Withdraw from ${goal.goal_name}`}
          >
            <Minus />
          </Button>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${goal.goal_name}`} onClick={() => onEdit(goal)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${goal.goal_name}`}
            onClick={() => onDelete(goal)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </Card>
  );
}