import { cn } from "@/lib/utils";
import { Progress } from "./progress";

/** Category budget line: name, spent-of-limit in mono, hairline rail. */
export function BudgetMeter({ name, spent, limit, formatted, className }) {
  const pct = limit ? (Number(spent) / Number(limit)) * 100 : 0;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3 text-xs font-medium">
        <span className="truncate text-foreground">{name}</span>
        <span className={cn("money shrink-0", pct >= 100 ? "text-destructive" : "text-muted-foreground")}>
          {formatted}
        </span>
      </div>
      <Progress value={spent} max={limit} tone={pct >= 100 ? "destructive" : "primary"} label={`${name} budget`} />
    </div>
  );
}
