import { cn } from "@/lib/utils";

/**
 * One line of the ledger: glyph, merchant, category + date, signed amount.
 * Amounts are mono so columns align down the list without a table.
 */
export function ActivityRow({ icon: Icon, title, meta, amount, positive = false, onClick, className }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200",
        onClick && "hover:bg-accent/60 focus-visible:bg-accent/60",
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-4">
        {Icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{title}</span>
          {meta && <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground">{meta}</span>}
        </span>
      </span>
      <span className={cn("money shrink-0 text-sm", positive ? "text-success" : "text-foreground")}>{amount}</span>
    </Comp>
  );
}

/** Hairline-divided container that holds ActivityRows. */
export function ActivityList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_var(--color-hairline)] [&>*+*]:border-t [&>*+*]:border-hairline",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
