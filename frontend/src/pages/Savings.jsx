import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PiggyBank, Plus, Target, TrendingUp } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency } from '../utils/formatters';
import {
  contribute,
  createGoal,
  deleteGoal,
  importLegacyGoals,
  listGoals,
  readLegacyGoals,
  updateGoal,
} from '../utils/savings';
import SavingsGoalCard from '../components/savings/SavingsGoalCard';
import SavingsGoalFormDialog from '../components/savings/SavingsGoalFormDialog';
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
  Field,
  Input,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
} from '@/components/ui';

const STATUSES = [
  { value: 'all', label: 'All goals' },
  { value: 'active', label: 'On track' },
  { value: 'behind', label: 'Needs a push' },
  { value: 'overdue', label: 'Past deadline' },
  { value: 'done', label: 'Completed' },
];

const SORTS = [
  { value: 'deadline', label: 'Soonest deadline' },
  { value: 'progress', label: 'Closest to done' },
  { value: 'largest', label: 'Largest target' },
  { value: 'name', label: 'Name A–Z' },
];

const inThisMonth = (value) => {
  const d = new Date(value);
  const now = new Date();
  return !Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const Savings = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [goals, setGoals] = useState([]);
  const [monthlySaved, setMonthlySaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [legacyCount, setLegacyCount] = useState(0);
  const [importing, setImporting] = useState(false);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('deadline');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [moving, setMoving] = useState(null); // { goal, sign }
  const [moveAmount, setMoveAmount] = useState('');

  const refresh = async () => {
    try {
      setGoals(await listGoals());
      setPageError('');
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setPageError('Could not load your savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    setLegacyCount(readLegacyGoals().length);
  }, []);

  // Monthly savings is real money movement, so it comes from the API.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/incomes/').catch(() => ({ data: [] })),
      api.get('/expenses/').catch(() => ({ data: [] })),
    ]).then(([incomeRes, expenseRes]) => {
      if (cancelled) return;
      const incomes = Array.isArray(incomeRes.data) ? incomeRes.data : [];
      const expenses = Array.isArray(expenseRes.data) ? expenseRes.data : [];
      const earned = incomes
        .filter((i) => inThisMonth(i.date))
        .reduce((s, i) => s + (Number.parseFloat(i.amount) || 0), 0);
      const spent = expenses
        .filter((e) => inThisMonth(e.expense_date))
        .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);
      setMonthlySaved(earned - spent);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = goals.filter((g) => {
      if (status !== 'all' && g.status.key !== status) return false;
      if (!q) return true;
      return g.goal_name.toLowerCase().includes(q) || (g.notes || '').toLowerCase().includes(q);
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'progress':
          return b.status.pct - a.status.pct;
        case 'largest':
          return b.target - a.target;
        case 'name':
          return a.goal_name.localeCompare(b.goal_name);
        default:
          return String(a.deadline).localeCompare(String(b.deadline));
      }
    });
    return sorted;
  }, [goals, query, status, sort]);

  const stats = useMemo(() => {
    const total = goals.reduce((s, g) => s + g.saved, 0);
    const active = goals.filter((g) => g.status.key !== 'done').length;
    const done = goals.filter((g) => g.status.key === 'done').length;
    const target = goals.reduce((s, g) => s + g.target, 0);
    return { total, active, done, target, pct: target > 0 ? Math.round((total / target) * 100) : 0 };
  }, [goals]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setDialogOpen(true);
  };

  const errorText = (err, fallback) => {
    const detail = err.response?.data;
    if (typeof detail === 'string') return detail;
    return detail?.detail || Object.values(detail || {}).flat()[0] || fallback;
  };

  const handleSubmit = async (values) => {
    setFormError('');
    try {
      if (editing) await updateGoal(editing.id, values);
      else await createGoal(values);
      setDialogOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      setFormError(errorText(err, 'Could not save this goal.'));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteGoal(deleting.id);
    } catch (err) {
      console.error('Error deleting savings goal:', err);
    } finally {
      setDeleting(null);
      await refresh();
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await importLegacyGoals();
      setLegacyCount(0);
      await refresh();
    } finally {
      setImporting(false);
    }
  };

  const openMove = (goal, sign) => {
    setMoving({ goal, sign });
    setMoveAmount('');
  };

  const applyMove = async (e) => {
    e.preventDefault();
    const amount = Number.parseFloat(moveAmount);
    if (!moving || Number.isNaN(amount) || amount <= 0) return;
    try {
      await contribute(moving.goal, amount * moving.sign);
    } catch (err) {
      console.error('Error updating savings goal:', err);
    } finally {
      setMoving(null);
      await refresh();
    }
  };

  const filtersActive = query || status !== 'all';

  return (
    <AppLayout title="Savings">
      <PageHeader
        eyebrow="Ahead of you"
        title="Savings"
        description="Name what you are saving for. Watching it fill is the whole trick."
        actions={
          <Button onClick={openAdd}>
            <Plus /> New goal
          </Button>
        }
      />

      {pageError && (
        <Card className="border-destructive/40 p-4 text-sm text-destructive">{pageError}</Card>
      )}

      {legacyCount > 0 && (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {legacyCount} {legacyCount === 1 ? 'goal is' : 'goals are'} still saved on this device
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Savings now live in your account. Move them over so they follow you everywhere.
            </p>
          </div>
          <Button onClick={handleImport} loading={importing} className="shrink-0">
            Import to my account
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total savings"
          value={formatCurrency(stats.total, currency, numberFormat)}
          icon={PiggyBank}
          tone="primary"
          hint={stats.target > 0 ? `${stats.pct}% of everything you aim for` : 'Across all your goals'}
          progress={stats.target > 0 ? Math.min(stats.pct, 100) : undefined}
          loading={loading}
        />
        <StatCard
          label="Active goals"
          value={String(stats.active)}
          icon={Target}
          tone="info"
          hint={stats.active ? 'Still being funded' : 'Nothing in flight'}
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={String(stats.done)}
          icon={CheckCircle2}
          tone="success"
          hint={stats.done ? 'Fully funded' : 'None finished yet'}
          loading={loading}
        />
        <StatCard
          label="Saved this month"
          value={monthlySaved == null ? '—' : formatCurrency(monthlySaved, currency, numberFormat)}
          icon={TrendingUp}
          tone={monthlySaved != null && monthlySaved < 0 ? 'destructive' : 'success'}
          hint="Income minus spending, this month"
        />
      </div>

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search goals…"
          className="lg:max-w-sm lg:flex-1"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:ml-auto lg:w-auto">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="sm:w-44"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort goals" className="sm:w-48">
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
            <Card key={i} className="h-44 animate-pulse p-5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={PiggyBank}
            title={filtersActive ? 'No goals match those filters' : 'No savings goals yet'}
            description={
              filtersActive
                ? 'Try another status or clear the search.'
                : 'Start with one — an emergency fund, a trip, a laptop. Small targets get finished.'
            }
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setStatus('all');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openAdd}>
                  <Plus /> New goal
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              currency={currency}
              dateFormat={dateFormat}
              numberFormat={numberFormat}
              onEdit={openEdit}
              onDelete={setDeleting}
              onContribute={openMove}
            />
          ))}
        </div>
      )}

      {/* Mobile add */}
      <Button
        onClick={openAdd}
        size="icon"
        aria-label="New savings goal"
        className="fixed bottom-6 right-5 z-30 size-12 rounded-full shadow-lg sm:hidden"
      >
        <Plus />
      </Button>

      <SavingsGoalFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            setFormError('');
          }
        }}
        onSubmit={handleSubmit}
        record={editing}
        error={formError}
      />

      {/* Contribute / withdraw */}
      <Dialog open={Boolean(moving)} onOpenChange={(v) => !v && setMoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moving?.sign === -1 ? 'Take money out' : 'Add to'} {moving?.goal.goal_name}
            </DialogTitle>
            <DialogDescription>
              {moving?.sign === -1
                ? 'Reduce what you have set aside for this goal.'
                : 'Record money you have set aside for this goal.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={applyMove} className="space-y-4">
            <Field label="Amount" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={moveAmount}
                onChange={(e) => setMoveAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono text-base"
                autoFocus
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMoving(null)}>
                Cancel
              </Button>
              <Button type="submit">{moving?.sign === -1 ? 'Withdraw' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this goal?</DialogTitle>
            <DialogDescription>
              “{deleting?.goal_name}” and its progress will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Savings;