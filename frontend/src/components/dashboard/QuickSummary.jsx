import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AnimatedNumber, Card, Progress, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

const TONES = {
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary-soft text-foreground',
};

/** One tile of Section 3. Icon, animated figure, trend pill, comparison line. */
export function SummaryTile({ label, value, format, icon: Icon, tone = 'primary', trend, hint, progress, loading }) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="mt-5 h-7 w-32" />
        <Skeleton className="mt-4 h-3 w-28" />
      </Card>
    );
  }

  const TrendIcon = trend?.direction === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <Card interactive className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="truncate text-2xl font-medium tabular tracking-tight text-foreground">
        {format ? <AnimatedNumber value={value} format={format} /> : value}
      </p>

      {progress != null && <Progress value={progress} tone="primary" label={`${label} usage`} />}

      <div className="flex min-h-5 flex-wrap items-center gap-2">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend.direction === 'down' ? 'text-destructive' : 'text-success',
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {trend.value}
          </span>
        )}
        {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}

export function QuickSummary({ tiles, loading, className }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {tiles.map((tile) => (
        <SummaryTile key={tile.label} {...tile} loading={loading} />
      ))}
    </div>
  );
}
