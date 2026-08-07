import React, { useEffect, useState } from 'react';
import { CalendarDays, TriangleAlert } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import {
  BUDGET_CATEGORIES,
  BUDGET_CURRENCIES,
  budgetCategoryMeta,
  periodEnd,
  periodLabel,
  todayISO,
} from '../../utils/budgets';

const emptyForm = () => {
  const start = todayISO();
  const [y, m] = start.split('-');
  return {
    name: '',
    category: 'food',
    amount: '',
    currency: 'INR',
    startDate: start,
    endDate: periodEnd(Number(m), Number(y)),
    notes: '',
  };
};

/** Create / edit a budget. The period the API stores comes from the start date. */
export default function BudgetFormDialog({
  open,
  onOpenChange,
  onSubmit,
  record = null,
  defaultCurrency = 'INR',
  submitting = false,
  error = '',
}) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (record) {
      setForm({
        name: record.name || '',
        category: record.category || 'food',
        amount: String(record.budget_amount ?? ''),
        currency: record.currency || defaultCurrency,
        startDate: record.startDate,
        endDate: record.endDate,
        notes: record.notes || '',
      });
    } else {
      setForm({ ...emptyForm(), currency: defaultCurrency });
    }
  }, [open, record, defaultCurrency]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onStartChange = (e) => {
    const value = e.target.value;
    const [y, m] = value.split('-');
    setForm((f) => ({
      ...f,
      startDate: value,
      endDate: y && m ? periodEnd(Number(m), Number(y)) : f.endDate,
    }));
  };

  const amountValue = Number.parseFloat(form.amount);
  const amountInvalid = !form.amount || Number.isNaN(amountValue) || amountValue <= 0;
  const amountError = touched && amountInvalid ? 'Set a limit greater than zero.' : '';
  const nameError = touched && !form.name.trim() ? 'Give this budget a name.' : '';
  const dateError =
    touched && form.endDate && form.endDate < form.startDate ? 'End date is before the start date.' : '';

  const [year, month] = (form.startDate || todayISO()).split('-');
  const CategoryIcon = budgetCategoryMeta(form.category).icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim() || amountInvalid || (form.endDate && form.endDate < form.startDate)) return;

    onSubmit({
      budget_name: form.name.trim(),
      category: form.category,
      budget_amount: amountValue.toFixed(2),
      currency: form.currency,
      notes: form.notes.trim(),
      start_date: form.startDate,
      end_date: form.endDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit budget' : 'Create budget'}</DialogTitle>
          <DialogDescription>
            One limit per category, per month. Spending is matched automatically.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Budget name" required error={nameError}>
            <Input value={form.name} onChange={set('name')} placeholder="Eating out" autoFocus />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <div className="relative">
                <CategoryIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Select value={form.category} onChange={set('category')} className="pl-9">
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Amount" required error={amountError} className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                  className="font-mono text-base"
                />
              </Field>
              <Field label="Currency">
                <Select value={form.currency} onChange={set('currency')}>
                  {BUDGET_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date" required hint={`Tracks ${periodLabel(Number(month), Number(year))}.`}>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="date" value={form.startDate} onChange={onStartChange} className="pl-9" />
              </div>
            </Field>

            <Field label="End date" error={dateError}>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="date" value={form.endDate} onChange={set('endDate')} className="pl-9" />
              </div>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="What is this budget protecting you from?"
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {record ? 'Save changes' : 'Create budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
