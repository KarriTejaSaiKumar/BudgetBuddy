import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@/components/ui';
import { categoryMeta, paymentLabel } from '../../utils/expenses';
import { formatCurrency, formatDate } from '../../utils/formatters';

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-foreground">{children}</span>
    </div>
  );
}

/** Read-only look at one expense — the "View" action on the table. */
export default function ExpenseDetailDialog({
  record,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  currency,
  dateFormat,
  numberFormat,
  budgetName,
}) {
  if (!record) return null;
  const meta = categoryMeta(record.category);
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="sr-only">Expense details</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-foreground">{record.title}</p>
            <p className="money mt-1 text-2xl tracking-tight text-foreground">
              {formatCurrency(record.amountValue, record.currency || currency, numberFormat)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="divide-y divide-border">
          <Row label="Category">
            <Badge variant="default">{meta.label}</Badge>
          </Row>
          <Row label="Date">
            {formatDate(record.expense_date, dateFormat)}
            {record.time && <span className="ml-1.5 font-mono text-xs">{record.time}</span>}
          </Row>
          {record.paymentMethod && <Row label="Payment method">{paymentLabel(record.paymentMethod)}</Row>}
          {budgetName && <Row label="Budget">{budgetName}</Row>}
          {record.currency && <Row label="Currency">{record.currency}</Row>}
        </div>

        {record.notes && (
          <>
            <Separator />
            <div>
              <p className="eyebrow">Notes</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{record.notes}</p>
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(record)}
          >
            <Trash2 /> Delete
          </Button>
          <Button variant="secondary" onClick={() => onEdit(record)}>
            <Pencil /> Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
