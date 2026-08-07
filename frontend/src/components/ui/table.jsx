import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="w-full overflow-x-auto">
      <table ref={ref} className={cn("w-full caption-bottom border-collapse text-sm", className)} {...props} />
    </div>
  );
});

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />;
});

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
});

const TableRow = React.forwardRef(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn("border-b border-border transition-colors hover:bg-accent/60", className)}
      {...props}
    />
  );
});

const TableHead = React.forwardRef(function TableHead({ className, numeric, ...props }, ref) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
});

const TableCell = React.forwardRef(function TableCell({ className, numeric, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn("px-4 py-3 align-middle", numeric && "text-right tabular", className)}
      {...props}
    />
  );
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
