import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, PiggyBank } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Progress, Skeleton } from '@/components/ui';
import { formatDate } from '../../utils/formatters';

function GoalRow({ goal, format, dateFormat }) {
  const pct = Math.min(100, Math.round(Number(goal.status?.pct ?? 0)));
  const tone = goal.status?.tone || 'info';

  return (
    <div className="rounded-xl p-3 transition-colors duration-200 hover:bg-accent/40">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{goal.goal_name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {goal.deadline ? formatDate(goal.deadline, dateFormat) : 'No deadline'}
              {goal.daysLeft != null && goal.daysLeft >= 0 ? ` · ${goal.daysLeft}d left` : ''}
            </span>
          </p>
        </div>
        <Badge variant={tone}>{goal.status?.label || 'In progress'}</Badge>
      </div>

      <Progress className="mt-3" value={pct} tone={tone === 'destructive' ? 'destructive' : 'info'} label={`${goal.goal_name} progress`} />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          <span className="money text-foreground">{format(goal.saved)}</span> of {format(goal.target)}
        </span>
        <span className="money text-muted-foreground">{format(goal.remaining)} to go · {pct}%</span>
      </div>
    </div>
  );
}

export function SavingsGoals({ goals = [], format, dateFormat, loading, className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle>Savings goals</CardTitle>
          <p className="text-xs text-muted-foreground">What you are putting money aside for</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/savings">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : goals.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No goals yet"
            description="Name something you are saving for and watch the bar fill."
            action={
              <Button asChild variant="secondary">
                <Link to="/savings">Create a goal</Link>
              </Button>
            }
          />
        ) : (
          goals.slice(0, 3).map((g) => <GoalRow key={g.id} goal={g} format={format} dateFormat={dateFormat} />)
        )}
      </CardContent>
    </Card>
  );
}
