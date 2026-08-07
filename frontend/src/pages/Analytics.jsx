import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RePieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  Gauge,
  PiggyBank,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { categoryLabel } from '../utils/expenses';
import { listGoals } from '../utils/savings';
import {
  ActivityList,
  ActivityRow,
  BalanceHero,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  Progress,
  SectionHeader,
  Select,
  StatCard,
} from '@/components/ui';

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGES = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];

const amountOf = (v) => Number.parseFloat(v ?? 0) || 0;

function ChartTooltip({ active, payload, label, currency, numberFormat }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur-xl">
      {label && <p className="mb-1 text-[0.6875rem] font-medium text-muted-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-xs font-medium text-foreground">
          <span className="text-muted-foreground">{p.name}: </span>
          {formatCurrency(p.value, currency, numberFormat)}
        </p>
      ))}
    </div>
  );
}

const axisProps = {
  stroke: 'var(--color-muted-foreground)',
  tick: { fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

const Analytics = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_budget: 0,
    remaining_budget: 0,
  });
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('6');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [dash, incomeRes, expenseRes, budgetRes, goalList] = await Promise.all([
          api.get('/dashboard/').catch(() => ({ data: {} })),
          api.get('/incomes/').catch(() => ({ data: [] })),
          api.get('/expenses/').catch(() => ({ data: [] })),
          api.get('/budgets/').catch(() => ({ data: [] })),
          listGoals().catch(() => []),
        ]);
        if (cancelled) return;
        setSummary((s) => ({ ...s, ...dash.data }));
        setIncomes(Array.isArray(incomeRes.data) ? incomeRes.data : []);
        setExpenses(Array.isArray(expenseRes.data) ? expenseRes.data : []);
        const list = Array.isArray(budgetRes.data) ? budgetRes.data : [];
        setBudgets(list);
        setGoals(Array.isArray(goalList) ? goalList : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const months = Number(range);

  /** Bucketed income vs spending over the selected window. */
  const trend = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = months - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: months > 6 ? MONTHS[d.getMonth()][0] : MONTHS[d.getMonth()],
        Income: 0,
        Spending: 0,
      });
    }
    const index = Object.fromEntries(buckets.map((b) => [b.key, b]));
    incomes.forEach((i) => {
      const d = new Date(i.date);
      const b = index[`${d.getFullYear()}-${d.getMonth()}`];
      if (b) b.Income += amountOf(i.amount);
    });
    expenses.forEach((e) => {
      const d = new Date(e.expense_date);
      const b = index[`${d.getFullYear()}-${d.getMonth()}`];
      if (b) b.Spending += amountOf(e.amount);
    });
    return buckets.map((b) => ({ ...b, Saved: b.Income - b.Spending }));
  }, [incomes, expenses, months]);

  const windowStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  }, [months]);

  const inWindow = (value) => {
    const d = new Date(value);
    return !Number.isNaN(d.getTime()) && d >= windowStart;
  };

  const windowTotals = useMemo(() => {
    const income = incomes.filter((i) => inWindow(i.date)).reduce((s, i) => s + amountOf(i.amount), 0);
    const spend = expenses.filter((e) => inWindow(e.expense_date)).reduce((s, e) => s + amountOf(e.amount), 0);
    return {
      income,
      spend,
      saved: income - spend,
      rate: income > 0 ? ((income - spend) / income) * 100 : 0,
      avgMonthlySpend: spend / months,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes, expenses, months]);

  const categories = useMemo(() => {
    const map = new Map();
    expenses.filter((e) => inWindow(e.expense_date)).forEach((e) => {
      const key = e.category_display || categoryLabel(e.category);
      map.set(key, (map.get(key) || 0) + amountOf(e.amount));
    });
    const rows = [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const total = rows.reduce((s, r) => s + r.value, 0) || 1;
    return rows.map((r) => ({ ...r, share: (r.value / total) * 100 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, months]);

  const topCategories = categories.slice(0, 6);

  const budgetRows = useMemo(
    () =>
      budgets
        .map((b) => {
          const limit = amountOf(b.budget_amount);
          const spent = amountOf(b.amount_spent);
          return {
            id: b.id,
            name: b.budget_name || b.category_display || b.category,
            limit,
            spent,
            pct: Number(b.utilization_percentage ?? (limit > 0 ? (spent / limit) * 100 : 0)) || 0,
          };
        })
        .sort((a, b) => b.pct - a.pct),
    [budgets],
  );

  const budgetUtilisation = useMemo(() => {
    const limit = budgetRows.reduce((s, r) => s + r.limit, 0);
    const spent = budgetRows.reduce((s, r) => s + r.spent, 0);
    return { limit, spent, pct: limit > 0 ? Math.round((spent / limit) * 100) : 0 };
  }, [budgetRows]);

  const savingsRing = useMemo(() => {
    const target = goals.reduce((s, g) => s + g.target, 0);
    const saved = goals.reduce((s, g) => s + g.saved, 0);
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { target, saved, pct, data: [{ name: 'Saved', value: pct, fill: 'var(--chart-1)' }] };
  }, [goals]);

  const recent = useMemo(() => {
    const items = [
      ...incomes.map((i) => ({
        id: `i-${i.id}`,
        kind: 'income',
        title: (i.description || '').split('\n')[0] || i.source_display || i.source || 'Income',
        date: i.date,
        amount: amountOf(i.amount),
      })),
      ...expenses.map((e) => ({
        id: `e-${e.id}`,
        kind: 'expense',
        title: e.title || e.category_display || 'Expense',
        date: e.expense_date,
        amount: amountOf(e.amount),
      })),
    ];
    return items.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
  }, [incomes, expenses]);

  const tooltip = <ReTooltip content={<ChartTooltip currency={currency} numberFormat={numberFormat} />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />;

  return (
    <AppLayout title="Analytics">
      <PageHeader
        eyebrow="The long view"
        title="Analytics"
        description="Everything you have logged, read back as patterns instead of rows."
        actions={
          <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Time range" className="w-44">
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        }
      />

      <BalanceHero
        label="Current balance"
        value={formatCurrency(summary.current_balance, currency, numberFormat)}
        loading={loading}
        delta={
          windowTotals.income || windowTotals.spend
            ? {
                direction: windowTotals.saved >= 0 ? 'up' : 'down',
                value: `${formatCurrency(Math.abs(windowTotals.saved), currency, numberFormat)} over ${months} months`,
              }
            : undefined
        }
        message={`${formatCurrency(summary.total_income, currency, numberFormat)} earned and ${formatCurrency(
          summary.total_expense,
          currency,
          numberFormat,
        )} spent since you started.`}
      />

      {/* Financial summary */}
      <section>
        <SectionHeader title="Financial summary" description={`Rolling ${months}-month window`} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Income"
            value={formatCurrency(windowTotals.income, currency, numberFormat)}
            icon={TrendingUp}
            tone="success"
            hint="Money in"
            loading={loading}
          />
          <StatCard
            label="Spending"
            value={formatCurrency(windowTotals.spend, currency, numberFormat)}
            icon={TrendingDown}
            tone="destructive"
            hint={`${formatCurrency(windowTotals.avgMonthlySpend, currency, numberFormat)} a month on average`}
            loading={loading}
          />
          <StatCard
            label="Net saved"
            value={formatCurrency(windowTotals.saved, currency, numberFormat)}
            icon={Scale}
            tone={windowTotals.saved >= 0 ? 'primary' : 'destructive'}
            hint={`${windowTotals.rate.toFixed(0)}% of what you earned`}
            loading={loading}
          />
          <StatCard
            label="Budget used"
            value={`${budgetUtilisation.pct}%`}
            icon={Gauge}
            tone={budgetUtilisation.pct >= 100 ? 'destructive' : budgetUtilisation.pct >= 80 ? 'warning' : 'info'}
            progress={Math.min(budgetUtilisation.pct, 100)}
            hint={`${formatCurrency(budgetUtilisation.spent, currency, numberFormat)} of ${formatCurrency(
              budgetUtilisation.limit,
              currency,
              numberFormat,
            )}`}
            loading={loading}
          />
        </div>
      </section>

      {/* Income vs expense */}
      <Card className="p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Income vs spending</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={56} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                {tooltip}
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#aIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="Spending"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  fill="url(#aSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Categories + monthly spend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader className="p-0">
            <CardTitle>Where it goes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            {topCategories.length === 0 ? (
              <EmptyState icon={BarChart2} title="No spending yet" description="Log an expense to see the split." />
            ) : (
              <>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={topCategories}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="62%"
                        outerRadius="92%"
                        paddingAngle={2}
                        stroke="none"
                      >
                        {topCategories.map((entry, i) => (
                          <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip content={<ChartTooltip currency={currency} numberFormat={numberFormat} />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {topCategories.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-3 text-xs">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{c.share.toFixed(0)}%</span>
                      <span className="money w-24 text-right text-foreground">
                        {formatCurrency(c.value, currency, numberFormat)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-3">
          <CardHeader className="p-0">
            <CardTitle>Monthly spending trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={56} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                  {tooltip}
                  <Bar dataKey="Spending" radius={[6, 6, 0, 0]} fill="var(--chart-3)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget utilisation + savings progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <CardHeader className="p-0">
            <CardTitle>Budget utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0 pt-5">
            {budgetRows.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No budgets to measure"
                description="Set one limit and this fills in automatically."
                action={
                  <Button asChild variant="secondary">
                    <Link to="/budgets">Go to budgets</Link>
                  </Button>
                }
              />
            ) : (
              budgetRows.slice(0, 6).map((row) => (
                <div key={row.id}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-foreground">{row.name}</span>
                    <span className="money shrink-0 text-muted-foreground">
                      {formatCurrency(row.spent, currency, numberFormat)} /{' '}
                      {formatCurrency(row.limit, currency, numberFormat)}
                    </span>
                  </div>
                  <Progress
                    value={row.spent}
                    max={row.limit || 1}
                    tone={row.pct >= 100 ? 'destructive' : row.pct >= 80 ? 'warning' : 'primary'}
                    label={`${row.name} utilisation`}
                    className="mt-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader className="p-0">
            <CardTitle>Savings progress</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            {goals.length === 0 ? (
              <EmptyState
                icon={PiggyBank}
                title="No goals yet"
                description="Create a savings goal to track it here."
                action={
                  <Button asChild variant="secondary">
                    <Link to="/savings">Go to savings</Link>
                  </Button>
                }
              />
            ) : (
              <>
                <div className="relative h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={savingsRing.data}
                      innerRadius="72%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'var(--color-muted)' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-medium tabular tracking-tight text-foreground">{savingsRing.pct}%</p>
                    <p className="text-[0.6875rem] text-muted-foreground">of all targets</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  {goals.slice(0, 4).map((g) => (
                    <div key={g.id} className="flex items-center gap-3 text-xs">
                      <span className="min-w-0 flex-1 truncate text-foreground">{g.goal_name}</span>
                      <span className="money text-muted-foreground">
                        {Math.min(100, Math.round(g.status.pct))}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Recent financial activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {recent.length === 0 ? (
            <EmptyState icon={BarChart2} title="Nothing logged yet" description="Add income or an expense to begin." />
          ) : (
            <ActivityList>
              {recent.map((item) => (
                <ActivityRow
                  key={item.id}
                  icon={item.kind === 'income' ? ArrowUpRight : ArrowDownLeft}
                  title={item.title}
                  meta={formatDate(item.date, dateFormat)}
                  positive={item.kind === 'income'}
                  amount={`${item.kind === 'income' ? '+' : '-'}${formatCurrency(
                    item.amount,
                    currency,
                    numberFormat,
                  )}`}
                />
              ))}
            </ActivityList>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Analytics;