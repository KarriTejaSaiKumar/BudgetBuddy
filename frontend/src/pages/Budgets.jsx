import React, { useEffect, useMemo, useState } from 'react';
import { Gauge, PiggyBank, Plus, Target, Wallet } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency } from '../utils/formatters';
import {
  BUDGET_CATEGORIES,
  decorateBudget,
} from '../utils/budgets';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetFormDialog from '../components/budgets/BudgetFormDialog';
import {
  Button,
  Card,
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
  Skeleton,
  StatCard,
} from '@/components/ui';

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'ok', label: 'On track' },
  { value: 'near', label: 'Near limit' },
  { value: 'over', label: 'Over budget' },
];

const SORTS = [
  { value: 'usage', label: 'Most used first' },
  { value: 'largest', label: 'Largest budget' },
  { value: 'remaining', label: 'Least remaining' },
  { value: 'name', label: 'Name A–Z' },
];

const Budgets = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('usage');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // One request: the list serializer already returns spend, remaining and status.
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets/');
      const list = Array.isArray(data) ? data : [];
      setBudgets(list.map((b) => decorateBudget(b)));
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = budgets.filter((b) => {
      if (category !== 'all' && b.category !== category) return false;
      if (status !== 'all' && b.status.key !== status) return false;
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'largest':
          return b.limit - a.limit;
        case 'remaining':
          return a.remaining - b.remaining;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.status.pct - a.status.pct;
      }
    });
    return sorted;
  }, [budgets, query, category, status, sort]);

  const stats = useMemo(() => {
    const total = visible.reduce((sum, b) => sum + b.limit, 0);
    const spent = visible.reduce((sum, b) => sum + b.spent, 0);
    return {
      total,
      spent,
      remaining: Math.max(total - spent, 0),
      utilization: total > 0 ? Math.round((spent / total) * 100) : 0,
    };
  }, [visible]);

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await api.put(`/budgets/${editing.id}/update/`, payload);
      } else {
        await api.post('/budgets/create/', payload);
      }
      setDialogOpen(false);
      setEditing(null);
      await fetchBudgets();
    } catch (err) {
      const detail = err.response?.data;
      setFormError(
        typeof detail === 'string'
          ? detail
          : detail?.error ||
              detail?.detail ||
              Object.values(detail || {}).flat()[0] ||
              'Could not save this budget.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/budgets/${deleting.id}/delete/`);
      setBudgets((prev) => prev.filter((b) => b.id !== deleting.id));
    } catch (err) {
      console.error('Error deleting budget:', err);
    } finally {
      setDeleting(null);
    }
  };

  const filtersActive = query || category !== 'all' || status !== 'all';
  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  return (
    <AppLayout title="Budgets">
      <PageHeader
        eyebrow="Guardrails"
        title="Budgets"
        description="Set a ceiling per category, then watch it fill up calmly."
        actions={
          <Button onClick={openAdd}>
            <Plus /> Create budget
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total budget"
          value={formatCurrency(stats.total, currency, numberFormat)}
          icon={Target}
          tone="primary"
          hint={`${visible.length} ${visible.length === 1 ? 'budget' : 'budgets'}`}
          loading={loading}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(stats.spent, currency, numberFormat)}
          icon={Wallet}
          tone="destructive"
          hint="Matched from your expenses"
          loading={loading}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(stats.remaining, currency, numberFormat)}
          icon={PiggyBank}
          tone="success"
          hint="Still safe to spend"
          loading={loading}
        />
        <StatCard
          label="Utilisation"
          value={`${stats.utilization}%`}
          icon={Gauge}
          tone={stats.utilization >= 100 ? 'destructive' : stats.utilization >= 80 ? 'warning' : 'info'}
          progress={Math.min(stats.utilization, 100)}
          hint={stats.utilization >= 100 ? 'Over your combined limit' : 'Of your combined limit'}
          loading={loading}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Spend attribution follows the server&rsquo;s own category matching. Budget and expense
        categories use separate vocabularies, so an expense in a similarly named category may not
        count toward a budget here.
      </p>

      {/* Controls */}
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search budgets by name or category…"
          className="lg:max-w-sm lg:flex-1"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:ml-auto lg:w-auto">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="sm:w-44"
          >
            <option value="all">All categories</option>
            {BUDGET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="sm:w-40"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort budgets" className="sm:w-44">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="space-y-4 p-5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title={filtersActive ? 'No budgets match those filters' : 'No budgets yet'}
            description={
              filtersActive
                ? 'Try another category or status.'
                : 'Set a limit for the category you overspend on most — start with one.'
            }
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openAdd}>
                  <Plus /> Create budget
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              currency={currency}
              dateFormat={dateFormat}
              numberFormat={numberFormat}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Mobile quick action */}
      <button
        onClick={openAdd}
        aria-label="Create budget"
        className="fixed bottom-6 right-5 z-30 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px sm:hidden"
      >
        <Plus className="size-5" />
      </button>

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSubmit}
        record={editing}
        defaultCurrency={currency}
        submitting={submitting}
        error={formError}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this budget?</DialogTitle>
            <DialogDescription>
              “{deleting?.name}” will be removed permanently. Your expenses stay untouched.
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

export default Budgets;
