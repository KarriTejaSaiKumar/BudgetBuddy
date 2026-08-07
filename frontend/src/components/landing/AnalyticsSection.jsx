import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, PieChart, Target } from 'lucide-react';
import Reveal from './Reveal';

const data = [
  { month: 'Apr', income: 52000, expenses: 31000 },
  { month: 'May', income: 58000, expenses: 34500 },
  { month: 'Jun', income: 54000, expenses: 29800 },
  { month: 'Jul', income: 61000, expenses: 38200 },
  { month: 'Aug', income: 59500, expenses: 33100 },
  { month: 'Sep', income: 64200, expenses: 21340 },
];

const points = [
  { icon: Activity, title: 'Income vs expenses', copy: 'See the gap you are actually saving each month.' },
  { icon: PieChart, title: 'Category breakdown', copy: 'Find the three categories that move your total.' },
  { icon: Target, title: 'Budget utilisation', copy: 'Know how much runway is left before month end.' },
];

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <Reveal from="none" className="min-w-0 order-2 lg:order-1">
          <div className="glass rounded-[1.75rem] p-5 shadow-[var(--shadow-lg)] sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="eyebrow">Net position</p>
                <p className="money mt-1 text-2xl font-semibold tracking-tight text-foreground">₹1,42,860.00</p>
              </div>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                +18.4% this month
              </span>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landing-income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="landing-expenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-border)' }}
                    contentStyle={{
                      background: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      color: 'var(--color-foreground)',
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#landing-income)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={2}
                    fill="url(#landing-expenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Avg. monthly income', '₹58,116'],
                ['Avg. monthly spend', '₹31,323'],
                ['Savings rate', '46%'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-card p-3 shadow-[0_0_0_1px_var(--color-hairline)]">
                  <p className="truncate text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="money mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="min-w-0 order-1 lg:order-2">
          <p className="eyebrow">Analytics</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Numbers that explain themselves.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Analytics are computed on the server from your real transactions, then presented as a handful of
            charts you can read in a glance — not a wall of tables.
          </p>
          <ul className="mt-8 space-y-5">
            {points.map((p) => (
              <li key={p.title} className="flex gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <p.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}