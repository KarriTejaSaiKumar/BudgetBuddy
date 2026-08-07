import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarRange,
  Layers,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  INCOME_SOURCES,
  decorateIncome,
  incomeShimActive,
  removeMeta,
  sourceLabel,
  writeMeta,
} from '../utils/income';
import IncomeFormDialog from '../components/income/IncomeFormDialog';
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
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
  { value: 'title', label: 'Title A–Z' },
];

const withinRange = (dateStr, range) => {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (range === 'year') return d.getFullYear() === now.getFullYear();
  const days = Number(range);
  return (now - d) / 86400000 <= days;
};

const Income = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [range, setRange] = useState('all');
  const [sort, setSort] = useState('newest');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/incomes/');
      setRecords((Array.isArray(data) ? data : []).map(decorateIncome));
    } catch (err) {
      console.error('Error fetching income records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = records.filter((r) => {
      if (source !== 'all' && r.source !== source) return false;
      if (!withinRange(r.date, range)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        sourceLabel(r.source).toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highest':
          return b.amountValue - a.amountValue;
        case 'lowest':
          return a.amountValue - b.amountValue;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
    return sorted;
  }, [records, query, source, range, sort]);

  const stats = useMemo(() => {
    const total = visible.reduce((sum, r) => sum + r.amountValue, 0);
    const now = new Date();
    const thisMonth = visible
      .filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.amountValue, 0);
    const sources = new Set(visible.map((r) => r.source)).size;
    return {
      total,
      thisMonth,
      average: visible.length ? total / visible.length : 0,
      sources,
    };
  }, [visible]);

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async ({ payload, meta }) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        const { data } = await api.put(`/incomes/${editing.id}/update/`, payload);
        if (meta) writeMeta(editing.id, meta);
        setRecords((prev) => prev.map((r) => (r.id === editing.id ? decorateIncome(data) : r)));
      } else {
        const { data } = await api.post('/incomes/create/', payload);
        if (meta) writeMeta(data.id, meta);
        setRecords((prev) => [decorateIncome(data), ...prev]);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      const detail = err.response?.data;
      setFormError(
        typeof detail === 'string'
          ? detail
          : detail?.detail || Object.values(detail || {})[0]?.[0] || 'Could not save this income.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/incomes/${deleting.id}/delete/`);
      removeMeta(deleting.id);
      setRecords((prev) => prev.filter((r) => r.id !== deleting.id));
    } catch (err) {
      console.error('Error deleting income record:', err);
    } finally {
      setDeleting(null);
    }
  };

  const filtersActive = query || source !== 'all' || range !== 'all';

  const columns = [
    {
      key: 'title',
      header: 'Income',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
          {row.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.notes}</p>}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      cell: (row) => <Badge variant="success" icon={ArrowUpRight}>{sourceLabel(row.source)}</Badge>,
    },
    {
      key: 'date',
      header: 'Received',
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.date, dateFormat)}
          {row.time && <span className="ml-1.5 font-mono">{row.time}</span>}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      cell: (row) => (
        <span className="money whitespace-nowrap text-sm text-success">
          +{formatCurrency(row.amountValue, row.currency || currency, numberFormat)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      numeric: true,
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.title}`}
            onClick={() => openEdit(row)}
          >
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
    <AppLayout title="Income">
      <PageHeader
        eyebrow="Money in"
        title="Income"
        description="Every rupee that arrived, where it came from, and when."
        actions={
          <Button onClick={openAdd}>
            <Plus /> Add income
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total income"
          value={formatCurrency(stats.total, currency, numberFormat)}
          icon={TrendingUp}
          tone="success"
          hint={filtersActive ? 'Matching your filters' : 'All time'}
          loading={loading}
        />
        <StatCard
          label="This month"
          value={formatCurrency(stats.thisMonth, currency, numberFormat)}
          icon={CalendarRange}
          tone="info"
          hint="Received since the 1st"
          loading={loading}
        />
        <StatCard
          label="Average entry"
          value={formatCurrency(stats.average, currency, numberFormat)}
          icon={Wallet}
          tone="primary"
          hint={`${visible.length} ${visible.length === 1 ? 'entry' : 'entries'}`}
          loading={loading}
        />
        <StatCard
          label="Active sources"
          value={String(stats.sources)}
          icon={Layers}
          tone="muted"
          hint="Distinct income streams"
          loading={loading}
        />
      </div>

      {/* Controls */}
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search income by title, note or source…"
          className="lg:max-w-sm lg:flex-1"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:ml-auto lg:w-auto">
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
            value={source}
            onChange={(e) => setSource(e.target.value)}
            aria-label="Filter by source"
            className="sm:w-44"
          >
            <option value="all">All sources</option>
            {INCOME_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort income"
            className="sm:w-44"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={visible}
        loading={loading}
        caption="Income records"
        empty={
          <EmptyState
            icon={TrendingUp}
            title={filtersActive ? 'Nothing matches those filters' : 'No income logged yet'}
            description={
              filtersActive
                ? 'Try a wider date range or clear the search.'
                : 'Add your first payment and the summary above fills in.'
            }
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setSource('all');
                    setRange('all');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openAdd}>
                  <Plus /> Add income
                </Button>
              )
            }
          />
        }
      />

      {/* Mobile quick action */}
      <button
        onClick={openAdd}
        aria-label="Add income"
        className="fixed bottom-6 right-5 z-30 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px sm:hidden"
      >
        <Plus className="size-5" />
      </button>

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSubmit}
        record={editing}
        defaultCurrency={currency}
        shimActive={incomeShimActive()}
        submitting={submitting}
        error={formError}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this income?</DialogTitle>
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

export default Income;
