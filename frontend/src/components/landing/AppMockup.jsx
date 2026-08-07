import React from 'react';
import {
  BarChart3,
  CreditCard,
  LayoutGrid,
  PieChart,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const railItems = [LayoutGrid, TrendingUp, CreditCard, PieChart, PiggyBank, BarChart3];

const bars = [38, 54, 46, 72, 61, 88, 69, 94, 76, 58, 82, 66];

const rows = [
  { label: 'Groceries', meta: 'Today', amount: '−₹1,820.00', tone: 'text-foreground' },
  { label: 'Freelance project', meta: 'Yesterday', amount: '+₹6,000.00', tone: 'text-success' },
  { label: 'Metro card', meta: '2 days ago', amount: '−₹240.00', tone: 'text-foreground' },
];

/**
 * Static, non-interactive preview of the product surface. Pure presentation —
 * no data, no API calls. Reused by the hero, the showcase and the auth pages.
 */
export default function AppMockup({ className, compact = false }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'glass overflow-hidden rounded-[1.75rem] p-1.5 shadow-[var(--shadow-lg)] select-none',
        className,
      )}
    >
      <div className="overflow-hidden rounded-[1.4rem] bg-surface/80">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/20" />
          <span className="size-2.5 rounded-full bg-muted-foreground/15" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-muted/70" />
        </div>

        <div className="flex">
          {/* Rail */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-hairline py-4 sm:flex">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/90 text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            {railItems.map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  'grid size-8 place-items-center rounded-xl text-muted-foreground',
                  i === 0 && 'bg-primary-soft text-foreground',
                )}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>

          {/* Canvas */}
          <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
            <div className="rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--color-hairline)] sm:p-5">
              <p className="eyebrow">Current balance</p>
              <p className="money mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                ₹1,42,860.00
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ['Income', '₹64,200', 'text-success'],
                  ['Expenses', '₹21,340', 'text-foreground'],
                  ['Saved', '₹42,860', 'text-primary'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="min-w-0">
                    <p className="truncate text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className={cn('money truncate text-sm font-medium', tone)}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--color-hairline)]">
              <div className="flex items-end gap-1.5" style={{ height: compact ? 64 : 92 }}>
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary/25 to-primary/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {!compact && (
              <div className="space-y-2.5 rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--color-hairline)]">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="size-7 shrink-0 rounded-lg bg-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{r.label}</p>
                      <p className="truncate text-[0.65rem] text-muted-foreground">{r.meta}</p>
                    </div>
                    <span className={cn('money shrink-0 text-xs font-medium', r.tone)}>{r.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}