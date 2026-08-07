import React from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatedNumber, Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

function Figure({ icon: Icon, label, value, format, tone }) {
  const tones = {
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
  };
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <p className="eyebrow truncate">{label}</p>
      </div>
      <p className="mt-2 truncate text-lg font-medium tabular tracking-tight text-foreground sm:text-xl">
        <AnimatedNumber value={value} format={format} />
      </p>
    </div>
  );
}

/**
 * Section 2 — the hero. One oversized balance, three supporting figures,
 * all animating from their previous value.
 */
export function BalancePanel({
  balance = 0,
  income = 0,
  expenses = 0,
  netSavings = 0,
  format,
  message,
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <Card className={cn('p-7 sm:p-8', className)}>
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="mt-4 h-14 w-64 max-w-full" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-6 w-28" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const down = Number(netSavings) < 0;
  const DeltaIcon = down ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className={cn('rise relative overflow-hidden p-7 sm:p-8', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative">
        <span className="eyebrow">Current balance</span>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h2 className="text-4xl font-medium leading-none tabular tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <AnimatedNumber value={balance} format={format} />
          </h2>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium',
              down ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            {format(Math.abs(Number(netSavings) || 0))} this month
          </span>
        </div>
        {message && (
          <p className="mt-5 max-w-[54ch] text-sm leading-relaxed text-pretty text-muted-foreground">{message}</p>
        )}

        <div className="mt-7 grid grid-cols-1 gap-6 border-t border-hairline pt-6 sm:grid-cols-3">
          <Figure icon={TrendingUp} label="Monthly income" value={income} format={format} tone="success" />
          <Figure icon={TrendingDown} label="Monthly expenses" value={expenses} format={format} tone="destructive" />
          <Figure icon={PiggyBank} label="Net savings" value={netSavings} format={format} tone="info" />
        </div>
      </div>
    </Card>
  );
}
