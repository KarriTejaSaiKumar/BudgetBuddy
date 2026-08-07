import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Info, TriangleAlert } from 'lucide-react';
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
  INCOME_CURRENCIES,
  INCOME_SOURCES,
  buildIncomePayload,
  localExtras,
  nowLocalParts,
} from '../../utils/income';

const emptyForm = () => {
  const { date, time } = nowLocalParts();
  return { title: '', source: 'salary', amount: '', currency: 'INR', date, time, notes: '' };
};

/**
 * Add / edit income. One quiet column, amount given the most weight,
 * date and time pre-filled to now so the common case is two fields and Enter.
 */
export default function IncomeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  record = null,
  defaultCurrency = 'INR',
  shimActive = false,
  submitting = false,
  error = '',
}) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (record) {
      const { time } = nowLocalParts();
      setForm({
        title: record.title || '',
        source: record.source || 'other',
        amount: String(record.amount ?? ''),
        currency: record.currency || defaultCurrency,
        date: record.date || nowLocalParts().date,
        time: record.time || time,
        notes: record.notes || '',
      });
    } else {
      setForm({ ...emptyForm(), currency: defaultCurrency });
    }
  }, [open, record, defaultCurrency]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const amountValue = Number.parseFloat(form.amount);
  const amountError = touched && (!form.amount || Number.isNaN(amountValue) || amountValue <= 0)
    ? 'Enter an amount greater than zero.'
    : '';
  const titleError = touched && !form.title.trim() ? 'Give this income a short name.' : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.title.trim() || !form.amount || Number.isNaN(amountValue) || amountValue <= 0) return;

    onSubmit({
      payload: buildIncomePayload({
        title: form.title,
        source: form.source,
        amount: amountValue.toFixed(2),
        currency: form.currency,
        date: form.date,
        time: form.time,
        notes: form.notes,
      }),
      meta: localExtras({ currency: form.currency, time: form.time }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit income' : 'Add income'}</DialogTitle>
          <DialogDescription>
            {record ? 'Update this entry — changes save straight away.' : 'Money in. Two fields is usually enough.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {shimActive && (
          <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Currency and time are stored on this device until the API supports them. This note
              disappears on its own once the fields exist.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required error={titleError}>
            <Input
              value={form.title}
              onChange={set('title')}
              placeholder="September salary"
              autoFocus
            />
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
                {INCOME_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.symbol}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Source" required>
            <Select value={form.source} onChange={set('source')}>
              {INCOME_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date" required>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="date" value={form.date} onChange={set('date')} className="pl-9" />
              </div>
            </Field>

            <Field
              label="Time"
              hint={shimActive ? 'Kept on this device for now.' : undefined}
            >
              <div className="relative">
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="time" value={form.time} onChange={set('time')} className="pl-9" />
              </div>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Anything you want to remember about this payment."
            />
          </Field>

          <DialogFooter className="pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {record ? 'Save changes' : 'Add income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
