import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatDate } from '../../utils/formatters';
import { cn } from '@/lib/utils';

function Amount({ tx, format }) {
  return (
    <span className={cn('money whitespace-nowrap font-medium', tx.isIncome ? 'text-success' : 'text-foreground')}>
      {tx.isIncome ? '+' : '−'}
      {format(tx.amount, tx.currency)}
    </span>
  );
}

/** Section 8 — table on desktop, cards on mobile. */
export function RecentTransactions({ transactions = [], format, dateFormat, loading, className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="min-w-0">
          <CardTitle>Recent transactions</CardTitle>
          <p className="text-xs text-muted-foreground">Your latest movements across income and spending</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/expenses">View all</Link>
        </Button>
      </CardHeader>

      {loading ? (
        <div className="space-y-2 px-6 pb-6 sm:px-7 sm:pb-7">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Add your first income or expense and it lands here instantly."
          action={
            <Button asChild>
              <Link to="/expenses">Add an expense</Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden px-2 pb-4 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const Icon = tx.icon;
                  return (
                    <TableRow key={tx.key}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={cn(
                              'grid size-8 shrink-0 place-items-center rounded-lg',
                              tx.isIncome ? 'bg-success/10 text-success' : 'bg-primary-soft text-foreground',
                            )}
                          >
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <span className="truncate text-sm font-medium text-foreground">{tx.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">{tx.categoryLabel}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Amount tx={tx} format={format} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(tx.date, dateFormat)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className="whitespace-nowrap"
                          variant={tx.isIncome ? 'success' : 'default'}
                          icon={tx.isIncome ? ArrowUpRight : ArrowDownLeft}
                        >
                          {tx.isIncome ? 'Received' : 'Paid'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <ul className="space-y-2 px-4 pb-5 md:hidden">
            {transactions.map((tx) => {
              const Icon = tx.icon;
              return (
                <li
                  key={tx.key}
                  className="rounded-xl bg-accent/30 p-3 transition-colors duration-200 hover:bg-accent/50"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'grid size-9 shrink-0 place-items-center rounded-lg',
                          tx.isIncome ? 'bg-success/10 text-success' : 'bg-primary-soft text-foreground',
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{tx.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tx.categoryLabel} · {formatDate(tx.date, dateFormat)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Amount tx={tx} format={format} />
                      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                        {tx.isIncome ? 'Received' : 'Paid'}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
