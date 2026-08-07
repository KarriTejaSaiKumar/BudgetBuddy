import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, TriangleAlert } from 'lucide-react';
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
  CURRENCIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  categoryMeta,
  nowLocalParts,
} from '../../utils/expenses';
import { budgetCategoryMeta } from '../../utils/budgets';

const emptyForm = () => {
  const { date, time } = nowLocalParts();
  return {
    title: '',
    category: 'other',
    amount: '',
    currency: 'INR',
    date,
    time,
    paymentMethod: 'upi',
    budgetId: '',
    notes: '',
  };
};

/**
 * Add / edit expense. Amount and category carry the most weight; date and
 * time pre-fill to now so logging a coffee is three taps.
 */
export default function ExpenseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  record = null,
  budgets = [],
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
      const { date, time } = nowLocalParts();
      setForm({
        title: record.title || '',
        category: record.category || 'other',
        amount: String(record.amount ?? ''),
        currency: record.currency || defaultCurrency,
        date: record.expense_date || date,
        time: record.time || time,
        paymentMethod: record.paymentMethod || 'upi',
        budgetId: record.budgetId || '',
        notes: record.notes || '',
      });
    } else {
      setForm({ ...emptyForm(), currency: defaultCurrency });
    }
  }, [open, record, defaultCurrency]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const amountValue = Number.parseFloat(form.amount);
  const amountInvalid = !form.amount || Number.isNaN(amountValue) || amountValue <= 0;
  const amountError = touched && amountInvalid ? 'Enter an amount greater than zero.' : '';
  const titleError = touched && !form.title.trim() ? 'Give this expense a short name.' : '';

  const CategoryIcon = categoryMeta(form.category).icon;

  /**
   * Budget and Expense use different category vocabularies on the server and
   * we deliberately do not reconcile them client-side. When the two differ we
   * say so and still allow the save — the server decides what counts.
   */
  const linkedBudget = form.budgetId
    ? budgets.find((b) => String(b.id) === String(form.budgetId))
    : null;
  const categoryMismatch =
    linkedBudget && linkedBudget.category !== form.category
      ? {
          budgetLabel: budgetCategoryMeta(linkedBudget.category).label,
          expenseLabel: categoryMeta(form.category).label,
        }
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.title.trim() || amountInvalid) return;

    onSubmit({
      title: form.title.trim(),
      amount: amountValue.toFixed(2),
      category: form.category,
      currency: form.currency,
      payment_method: form.paymentMethod,
      transaction_time: form.time ? `${form.time}:00` : undefined,
      budget: form.budgetId || null,
      description: form.notes.trim(),
      expense_date: form.date,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>
            {record
              ? 'Update this entry — changes save straight away.'
              : 'Money out. Amount and category are the only ones that really matter.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required error={titleError}>
            <Input value={form.title} onChange={set('title')} placeholder="Groceries at Ratnadeep" autoFocus />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Amount" required error={amountError} className="sm:col-span-2">
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
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.symbol}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <div className="relative">
                <CategoryIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Select value={form.category} onChange={set('category')} className="pl-9">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>

            <Field label="Payment method">
              <Select value={form.paymentMethod} onChange={set('paymentMethod')}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Transaction date" required>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="date" value={form.date} onChange={set('date')} className="pl-9" />
              </div>
            </Field>

            <Field label="Time">
              <div className="relative">
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="time" value={form.time} onChange={set('time')} className="pl-9" />
              </div>
            </Field>
          </div>

          <Field label="Budget" hint="Optional — tag this spend to one of your budgets.">
            <Select value={form.budgetId} onChange={set('budgetId')}>
              <option value="">No budget</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            {categoryMismatch && (
              <p className="mt-2 flex items-start gap-2 text-xs text-warning">
                <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  This budget tracks {categoryMismatch.budgetLabel}; this expense is{' '}
                  {categoryMismatch.expenseLabel} — spending may not count toward it.
                </span>
              </p>
            )}
          </Field>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Anything you want to remember about this spend."
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {record ? 'Save changes' : 'Add expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
