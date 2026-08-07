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
import { todayISO } from '../../utils/savings';

const emptyForm = () => ({
  goal_name: '',
  target_amount: '',
  current_amount: '',
  deadline: todayISO(),
  notes: '',
});

/** Create / edit a savings goal. Deadline defaults to today and stays editable. */
export default function SavingsGoalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  record = null,
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
        goal_name: record.goal_name || '',
        target_amount: String(record.target_amount ?? ''),
        current_amount: String(record.current_amount ?? ''),
        deadline: record.deadline || todayISO(),
        notes: record.notes || '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, record]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const target = Number.parseFloat(form.target_amount);
  const saved = form.current_amount === '' ? 0 : Number.parseFloat(form.current_amount);

  const nameError = touched && !form.goal_name.trim() ? 'Give this goal a name.' : '';
  const targetError =
    touched && (!form.target_amount || Number.isNaN(target) || target <= 0)
      ? 'Set a target greater than zero.'
      : '';
  const savedError = touched && (Number.isNaN(saved) || saved < 0) ? 'Saved amount cannot be negative.' : '';
  const deadlineError = touched && !form.deadline ? 'Pick a deadline.' : '';

  const pct = target > 0 && !Number.isNaN(saved) ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (
      !form.goal_name.trim() ||
      !form.target_amount ||
      Number.isNaN(target) ||
      target <= 0 ||
      Number.isNaN(saved) ||
      saved < 0 ||
      !form.deadline
    ) {
      return;
    }

    onSubmit({
      goal_name: form.goal_name.trim(),
      target_amount: target.toFixed(2),
      current_amount: saved.toFixed(2),
      deadline: form.deadline,
      notes: form.notes.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit goal' : 'New savings goal'}</DialogTitle>
          <DialogDescription>
            Name it, price it, date it. Progress updates as you put money aside.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Goal name" required error={nameError}>
            <Input value={form.goal_name} onChange={set('goal_name')} placeholder="Emergency fund" autoFocus />
          </Field>

          <div className="grid grid-cols-1 gap-4">
            <Field label="Target amount" required error={targetError}>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={form.target_amount}
                onChange={set('target_amount')}
                placeholder="0.00"
                className="font-mono text-base"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Already saved"
              error={savedError}
              hint={target > 0 ? `${pct}% of the target.` : 'Leave blank to start from zero.'}
            >
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={form.current_amount}
                onChange={set('current_amount')}
                placeholder="0.00"
                className="font-mono text-base"
              />
            </Field>

            <Field label="Deadline" required error={deadlineError}>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input type="date" value={form.deadline} onChange={set('deadline')} className="pl-9" />
              </div>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="What are you saving for, and why does it matter?"
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {record ? 'Save changes' : 'Create goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}