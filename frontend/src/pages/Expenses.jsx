import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  Eye,
  Flame,
  Gauge,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CURRENCIES,
  EXPENSE_CATEGORIES,
  categoryMeta,
  decorateExpense,
  paymentLabel,
} from '../utils/expenses';
import { decorateBudget } from '../utils/budgets';
import ExpenseFormDialog from '../components/expenses/ExpenseFormDialog';
import ExpenseDetailDialog from '../components/expenses/ExpenseDetailDialog';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
} from '@/components/ui';

const DATE_RANGES = [
  { value: 'all', label: 'All time' },
  { value: 'month', label: 'This month' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
];

const SORTS = [
  { value: 'latest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
];

const withinRange = (dateStr, range) => {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (range === 'year') return d.getFullYear() === now.getFullYear();
  return (now - d) / 86400000 <= Number(range);
};

const Expenses = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [records, setRecords] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [range, setRange] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [sort, setSort] = useState('latest');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Category + sort stay server-side (existing API contract); the rest is local.
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      const url = params.toString() ? `/expenses/?${params.toString()}` : '/expenses/';
      const { data } = await api.get(url);
      setRecords((Array.isArray(data) ? data : []).map(decorateExpense));
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  useEffect(() => {
    api
      .get('/budgets/')
      .then(({ data }) => setBudgets((Array.isArray(data) ? data : []).map((b) => decorateBudget(b))))
      .catch(() => setBudgets([]));
  }, []);

  const budgetName = (id) => budgets.find((b) => b.id === id)?.name || '';

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (!withinRange(r.expense_date, range)) return false;
      if (currencyFilter !== 'all' && (r.currency || currency) !== currencyFilter) return false;
      if (!q) return true;
      return (
        (r.title || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q) ||
        categoryMeta(r.category).label.toLowerCase().includes(q) ||
        paymentLabel(r.paymentMethod).toLowerCase().includes(q)
      );
    });
  }, [records, query, range, currencyFilter, currency]);

  const stats = useMemo(() => {
    const total = visible.reduce((sum, r) => sum + r.amountValue, 0);
    const now = new Date();
    const monthRows = visible.filter((r) => {
      const d = new Date(r.expense_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonth = monthRows.reduce((sum, r) => sum + r.amountValue, 0);

    const byCategory = new Map();
    visible.forEach((r) => byCategory.set(r.category, (byCategory.get(r.category) || 0) + r.amountValue));
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

    const days = new Set(visible.map((r) => r.expense_date)).size;

    return {
      total,
      thisMonth,
      topCategory: top ? categoryMeta(top[0]).label : '—',
      topCategoryAmount: top ? top[1] : 0,
      dailyAverage: days ? total / days : 0,
      activeDays: days,
    };
  }, [visible]);

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (record) => {
    setViewing(null);
    setEditing(record);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        const { data } = await api.put(`/expenses/${editing.id}/update/`, payload);
        setRecords((prev) => prev.map((r) => (r.id === editing.id ? decorateExpense(data) : r)));
      } else {
        const { data } = await api.post('/expenses/create/', payload);
        setRecords((prev) => [decorateExpense(data), ...prev]);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      const detail = err.response?.data;
      setFormError(
        typeof detail === 'string'
          ? detail
          : detail?.detail || Object.values(detail || {})[0]?.[0] || 'Could not save this expense.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/expenses/${deleting.id}/delete/`);
      setRecords((prev) => prev.filter((r) => r.id !== deleting.id));
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setDeleting(null);
      setViewing(null);
    }
  };

  const filtersActive = query || category || range !== 'all' || currencyFilter !== 'all';
  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setRange('all');
    setCurrencyFilter('all');
  };

  const columns = [
    {
      key: 'title',
      header: 'Expense',
      cell: (row) => {
        const Icon = categoryMeta(row.category).icon;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
              {row.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.notes}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row) => <Badge>{categoryMeta(row.category).label}</Badge>,
    },
    {
      key: 'payment',
      header: 'Paid with',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{paymentLabel(row.paymentMethod) || '—'}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.expense_date, dateFormat)}
          {row.time && <span className="ml-1.5 font-mono">{row.time}</span>}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      cell: (row) => (
        <span className="money whitespace-nowrap text-sm text-foreground">
          −{formatCurrency(row.amountValue, row.currency || currency, numberFormat)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      numeric: true,
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`View ${row.title}`} onClick={() => setViewing(row)}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.title}`} onClick={() => openEdit(row)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.title}`}
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleting(row)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Expenses">
      <PageHeader
        eyebrow="Money out"
        title="Expenses"
        description="Everything you spent, sorted the way you think about it."
        actions={
          <Button onClick={openAdd}>
            <Plus /> Add expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total expenses"
          value={formatCurrency(stats.total, currency, numberFormat)}
          icon={TrendingDown}
          tone="destructive"
          hint={filtersActive ? 'Matching your filters' : 'All time'}
          loading={loading}
        />
        <StatCard
          label="This month"
          value={formatCurrency(stats.thisMonth, currency, numberFormat)}
          icon={CalendarRange}
          tone="info"
          hint="Spent since the 1st"
          loading={loading}
        />
        <StatCard
          label="Highest category"
          value={stats.topCategory}
          icon={Flame}
          tone="warning"
          hint={
            stats.topCategoryAmount
              ? `${formatCurrency(stats.topCategoryAmount, currency, numberFormat)} spent`
              : 'Nothing logged yet'
          }
          loading={loading}
        />
        <StatCard
          label="Average daily spend"
          value={formatCurrency(stats.dailyAverage, currency, numberFormat)}
          icon={Gauge}
          tone="primary"
          hint={`Across ${stats.activeDays} ${stats.activeDays === 1 ? 'day' : 'days'} with spending`}
          loading={loading}
        />
      </div>

      {/* Controls */}
      <Card className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search by title, note, category or payment method…"
          className="xl:max-w-sm xl:flex-1"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:ml-auto xl:w-auto">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="sm:w-44"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Filter by date range"
            className="sm:w-40"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            aria-label="Filter by currency"
            className="sm:w-36"
          >
            <option value="all">All currencies</option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.symbol}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort expenses" className="sm:w-44">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table on desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          rows={visible}
          loading={loading}
          caption="Expenses"
          empty={
            <EmptyState
              icon={TrendingDown}
              title={filtersActive ? 'Nothing matches those filters' : 'No expenses logged yet'}
              description={
                filtersActive
                  ? 'Try a wider date range or clear the search.'
                  : 'Add your first expense and the summary above fills in.'
              }
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={openAdd}>
                    <Plus /> Add expense
                  </Button>
                )
              }
            />
          }
        />
      </div>

      {/* Cards on mobile */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <Card className="p-5 text-sm text-muted-foreground">Loading expenses…</Card>
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={TrendingDown}
              title={filtersActive ? 'Nothing matches those filters' : 'No expenses yet'}
              description={filtersActive ? 'Try a wider date range.' : 'Tap the + button to log your first spend.'}
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null
              }
            />
          </Card>
        ) : (
          visible.map((row) => {
            const Icon = categoryMeta(row.category).icon;
            return (
              <Card
                key={row.id}
                interactive
                as="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => setViewing(row)}
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {categoryMeta(row.category).label} · {formatDate(row.expense_date, dateFormat)}
                  </p>
                </div>
                <span className="money shrink-0 text-sm text-foreground">
                  −{formatCurrency(row.amountValue, row.currency || currency, numberFormat)}
                </span>
              </Card>
            );
          })
        )}
      </div>

      {/* Mobile quick action */}
      <button
        onClick={openAdd}
        aria-label="Add expense"
        className="fixed bottom-6 right-5 z-30 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px sm:hidden"
      >
        <Plus className="size-5" />
      </button>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSubmit}
        record={editing}
        budgets={budgets}
        defaultCurrency={currency}
        submitting={submitting}
        error={formError}
      />

      <ExpenseDetailDialog
        record={viewing}
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={openEdit}
        onDelete={(row) => setDeleting(row)}
        currency={currency}
        dateFormat={dateFormat}
        numberFormat={numberFormat}
        budgetName={budgetName(viewing?.budgetId)}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              “{deleting?.title}” will be removed permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Expenses;
