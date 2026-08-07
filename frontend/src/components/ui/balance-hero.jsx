import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

/**
 * The one number that matters, given the room it deserves.
 * Oversized tabular figure, a single delta pill, one calm sentence of context.
 */
export function BalanceHero({
  label = "Current balance",
  value,
  delta,
  message,
  actions,
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <Card className={cn("p-8", className)}>
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="mt-4 h-14 w-72" />
        <Skeleton className="mt-6 h-3 w-96 max-w-full" />
      </Card>
    );
  }

  const down = delta?.direction === "down";
  const DeltaIcon = down ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className={cn("rise overflow-hidden p-7 sm:p-8", className)}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <span className="eyebrow">{label}</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <h2 className="text-4xl font-medium leading-none tabular tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {value}
            </h2>
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium",
                  down ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                )}
              >
                <DeltaIcon className="size-3.5" aria-hidden="true" />
                {delta.value}
              </span>
            )}
          </div>
          {message && (
            <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-pretty text-muted-foreground">{message}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </Card>
  );
}
