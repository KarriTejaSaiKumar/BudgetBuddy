import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui';

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

/** Frosted tooltip shared by every chart on the page. */
export function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur-xl">
      {label && <p className="mb-1 text-[0.6875rem] font-medium text-muted-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-xs font-medium text-foreground">
          <span className="text-muted-foreground">{p.name}: </span>
          {format(p.value)}
        </p>
      ))}
    </div>
  );
}

const axisTick = { fontSize: 11, fill: 'var(--color-muted-foreground)' };

function ChartFrame({ title, subtitle, children, className }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ChartSkeleton({ className }) {
  return (
    <Card className={className}>
      <div className="p-6 sm:p-7">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-6 h-56 w-full" />
      </div>
    </Card>
  );
}

/** Income against spending across the last six months. */
export function IncomeVsExpenseChart({ data, format, className }) {
  const empty = data.every((d) => !d.Income && !d.Spending);
  return (
    <ChartFrame title="Income vs expenses" subtitle="Last six months" className={className}>
      {empty ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to plot yet"
          description="Log an income or an expense and this chart fills in straight away."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="dashIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={axisTick}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <ReTooltip content={<ChartTooltip format={format} />} />
              <Area type="monotone" dataKey="Income" stroke="var(--chart-2)" strokeWidth={2} fill="url(#dashIncome)" />
              <Area type="monotone" dataKey="Spending" stroke="var(--chart-1)" strokeWidth={2} fill="url(#dashSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartFrame>
  );
}

/** Where this month's money went. */
export function CategoryDonut({ data, format, total, className }) {
  return (
    <ChartFrame title="Category spending" subtitle="This month" className={className}>
      {data.length === 0 ? (
        <EmptyState
          icon={PieIcon}
          title="No spending yet"
          description="Once you log expenses the split shows up here."
        />
      ) : (
        <>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="66%"
                  outerRadius="94%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip content={<ChartTooltip format={format} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="eyebrow">Spent</p>
                <p className="mt-1 text-base font-medium tabular text-foreground">{format(total)}</p>
              </div>
            </div>
          </div>
          <ul className="mt-5 space-y-2">
            {data.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="truncate text-muted-foreground">{c.name}</span>
                </span>
                <span className="money shrink-0 text-foreground">{format(c.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartFrame>
  );
}

/** Monthly spending only, as bars, so the rhythm of a month is obvious. */
export function SpendingTrendChart({ data, format, className }) {
  const empty = data.every((d) => !d.Spending);
  return (
    <ChartFrame title="Monthly spending trend" subtitle="How your outflow is moving" className={className}>
      {empty ? (
        <EmptyState
          icon={BarChart3}
          title="No spending history"
          description="Your monthly rhythm appears after your first few expenses."
        />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="dashBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={axisTick}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <ReTooltip cursor={{ fill: 'var(--color-hairline)' }} content={<ChartTooltip format={format} />} />
              <Bar dataKey="Spending" fill="url(#dashBar)" radius={[8, 8, 4, 4]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartFrame>
  );
}
