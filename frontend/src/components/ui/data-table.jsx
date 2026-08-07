import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { SkeletonTable } from "./skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { cn } from "@/lib/utils";

/**
 * Declarative table used by Expenses / Income / Budgets.
 * columns: [{ key, header, numeric?, className?, cell?: (row) => node }]
 * Handles loading + empty states so pages stay lean.
 */
export function DataTable({
  columns,
  rows = [],
  getRowId = (row, i) => row?.id ?? i,
  loading = false,
  empty,
  caption,
  className,
}) {
  if (loading) {
    return (
      <Card className={cn("p-3", className)}>
        <SkeletonTable rows={5} />
      </Card>
    );
  }

  if (!rows.length) {
    return <Card className={className}>{empty ?? <EmptyState />}</Card>;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} numeric={col.numeric} className={col.headClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={getRowId(row, i)}>
              {columns.map((col) => (
                <TableCell key={col.key} numeric={col.numeric} className={col.className}>
                  {col.cell ? col.cell(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
