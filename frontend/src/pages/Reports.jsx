import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
  PiggyBank,
  Scale,
  Wallet,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  REPORT_PERIODS,
  downloadReport,
  getExpenseReport,
  getIncomeReport,
  getMonthlyReport,
  getSavingsReport,
} from '../services/reports';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Progress,
  Select,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

const num = (v) => Number.parseFloat(v ?? 0) || 0;

const EXPORTS = [
  { kind: 'monthly', label: 'Monthly summary' },
  { kind: 'expenses', label: 'Expense report' },
  { kind: 'incomes', label: 'Income report' },
  { kind: 'savings', label: 'Savings report' },
  { kind: 'financial-summary', label: 'Full financial summary' },
];

const Reports = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [timeframe, setTimeframe] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const [monthly, setMonthly] = useState({ report: {}, period: {} });
  const [expenseReport, setExpenseReport] = useState({ summary: {}, categories: [], expenses: [] });
  const [incomeReport, setIncomeReport] = useState({ summary: {}, incomes: [] });
  const [savingsReport, setSavingsReport] = useState({ summary: {}, savings_goals: [] });

  const params = useMemo(() => {
    if (timeframe === 'custom') {
      if (!startDate || !endDate) return null;
      return { timeframe: 'custom', start_date: startDate, end_date: endDate };
    }
    return { timeframe };
  }, [timeframe, startDate, endDate]);

  const load = useCallback(async () => {
    if (!params) return;
    setLoading(true);
    setError('');
    try {
      const [m, e, i, s] = await Promise.all([
        getMonthlyReport(params),
        getExpenseReport(params),
        getIncomeReport(params),
        getSavingsReport(params),
      ]);
      setMonthly(m);
      setExpenseReport({ summary: {}, categories: [], expenses: [], ...e });
      setIncomeReport({ summary: {}, incomes: [], ...i });
      setSavingsReport({ summary: {}, savings_goals: [], ...s });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          'We could not build your reports for that period. Try a different range.',
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async (kind, format) => {
    if (!params) return;
    setDownloading(`${kind}-${format}`);
    try {
      await downloadReport(kind, format, params);
    } catch {
      setError('That export could not be generated. Please try again.');
    } finally {
      setDownloading('');
    }
  };

  const summary = monthly.report || {};
  const money = (v) => formatCurrency(num(v), currency, numberFormat);

  const periodLabel = REPORT_PERIODS.find((p) => p.value === timeframe)?.label || 'This month';

  const expenseColumns = [
    { key: 'title', header: 'Title', cell: (r) => r.title || '—' },
    {
      key: 'category',
      header: 'Category',
      cell: (r) => <Badge variant="secondary">{r.category_display || r.category}</Badge>,
    },
    { key: 'payment_method', header: 'Paid with', cell: (r) => (r.payment_method || '').replace('_', ' ') },
    { key: 'date', header: 'Date', cell: (r) => formatDate(r.date, dateFormat) },
    { key: 'amount', header: 'Amount', numeric: true, cell: (r) => money(r.amount) },
  ];

  const incomeColumns = [
    { key: 'source', header: 'Source', cell: (r) => r.source_display || r.source },
    { key: 'notes', header: 'Notes', cell: (r) => r.notes || '—' },
    { key: 'date', header: 'Date', cell: (r) => formatDate(r.date, dateFormat) },
    { key: 'amount', header: 'Amount', numeric: true, cell: (r) => money(r.amount) },
  ];

  return (
    <AppLayout title="Reports">
      <PageHeader
        eyebrow="On the record"
        title="Reports"
        description="Period statements you can read on screen or take away as a PDF or spreadsheet."
      />

      {/* Period controls */}
      <Card className="mb-6 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="report-period" label="Period">
            <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              {REPORT_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          {timeframe === 'custom' && (
            <>
              <Field id="report-start" label="From">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
              <Field id="report-end" label="To">
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Field>
            </>
          )}
          <div className="flex items-end">
            <Button variant="secondary" onClick={load} loading={loading} block>
              Refresh
            </Button>
          </div>
        </div>
        {timeframe === 'custom' && !params && (
          <p className="mt-3 text-xs text-muted-foreground">
            Choose both a start and an end date to build the report.
          </p>
        )}
      </Card>

      {error && (
        <Alert variant="destructive" title="Report unavailable" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Headline numbers */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income" value={money(summary.total_income)} icon={ArrowUpRight} tone="success" loading={loading} />
        <StatCard label="Spending" value={money(summary.total_expense)} icon={ArrowDownLeft} tone="destructive" loading={loading} />
        <StatCard label="Balance" value={money(summary.current_balance)} icon={Scale} loading={loading} />
        <StatCard label="Saved" value={money(summary.total_savings)} icon={PiggyBank} tone="info" loading={loading} />
      </div>

      {/* Exports */}
      <Card className="mb-6 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Take it with you</CardTitle>
          <p className="text-xs text-muted-foreground">{periodLabel} · PDF or CSV</p>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <ul className="divide-y divide-hairline">
            {EXPORTS.map((item) => (
              <li key={item.kind} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2.5 text-sm text-foreground">
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  {item.label}
                </span>
                <span className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloading === `${item.kind}-pdf`}
                    onClick={() => handleDownload(item.kind, 'pdf')}
                  >
                    <Download className="size-3.5" /> PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloading === `${item.kind}-csv`}
                    onClick={() => handleDownload(item.kind, 'csv')}
                  >
                    <FileSpreadsheet className="size-3.5" /> CSV
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Detail */}
      <Tabs defaultValue="expenses">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Total spent" value={money(expenseReport.summary?.total_expenses)} icon={Wallet} loading={loading} />
            <StatCard label="Average expense" value={money(expenseReport.summary?.average_expense)} loading={loading} />
            <StatCard
              label="Transactions"
              value={String(expenseReport.summary?.transaction_count ?? 0)}
              loading={loading}
            />
          </div>

          {expenseReport.categories?.length > 0 && (
            <Card className="mb-4 p-5 sm:p-6">
              <CardHeader className="p-0">
                <CardTitle>Where it went</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-5">
                {expenseReport.categories.slice(0, 8).map((c) => (
                  <div key={c.category}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="truncate font-medium capitalize text-foreground">{c.category}</span>
                      <span className="money shrink-0 text-muted-foreground">
                        {money(c.total_amount)} · {Math.round(num(c.percentage))}%
                      </span>
                    </div>
                    <Progress
                      value={num(c.percentage)}
                      max={100}
                      label={`${c.category} share`}
                      className="mt-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <DataTable
            columns={expenseColumns}
            rows={expenseReport.expenses || []}
            loading={loading}
            getRowId={(row, i) => row.id ?? i}
            caption="Expenses in the selected period"
            empty={<EmptyState icon={Wallet} title="No expenses in this period" />}
          />
        </TabsContent>

        <TabsContent value="income">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Total income" value={money(incomeReport.summary?.total_income)} icon={ArrowUpRight} tone="success" loading={loading} />
            <StatCard label="Average income" value={money(incomeReport.summary?.average_income)} loading={loading} />
            <StatCard label="Entries" value={String(incomeReport.summary?.transaction_count ?? 0)} loading={loading} />
          </div>
          <DataTable
            columns={incomeColumns}
            rows={incomeReport.incomes || []}
            loading={loading}
            getRowId={(row, i) => row.id ?? i}
            caption="Income in the selected period"
            empty={<EmptyState icon={ArrowUpRight} title="No income in this period" />}
          />
        </TabsContent>

        <TabsContent value="savings">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Target" value={money(savingsReport.summary?.total_target_amount)} icon={PiggyBank} loading={loading} />
            <StatCard label="Saved" value={money(savingsReport.summary?.total_saved_amount)} tone="success" loading={loading} />
            <StatCard
              label="Overall progress"
              value={`${Math.round(num(savingsReport.summary?.overall_progress_percentage))}%`}
              progress={num(savingsReport.summary?.overall_progress_percentage)}
              loading={loading}
            />
          </div>
          {(savingsReport.savings_goals || []).length === 0 ? (
            <Card>
              <EmptyState icon={PiggyBank} title="No savings goals yet" />
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {savingsReport.savings_goals.map((g) => (
                <Card key={g.goal_name} className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">{g.goal_name}</p>
                    <Badge variant="secondary">{g.status}</Badge>
                  </div>
                  <p className="money mt-2 text-xs text-muted-foreground">
                    {money(g.saved_amount)} of {money(g.target_amount)}
                  </p>
                  <Progress
                    value={num(g.progress_percentage)}
                    max={100}
                    label={`${g.goal_name} progress`}
                    className="mt-3"
                  />
                  <p className="mt-2 text-[0.6875rem] text-muted-foreground">
                    Deadline {formatDate(g.deadline, dateFormat)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Reports;
