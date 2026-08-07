import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Skeleton } from "./skeleton";
import { Progress } from "./progress";

/**
 * Metric tile. Eyebrow label, mono figure, hairline rail underneath.
 * Deliberately monochrome: color is reserved for direction of change.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  trend,
  progress,
  loading = false,
  className,
}) {
  const tones = {
    primary: "bg-primary-soft text-foreground",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
    warning: "bg-warning/12 text-warning",
    muted: "bg-muted text-muted-foreground",
  };

  if (loading) {
    return (
      <Card className={cn("p-5", className)}>
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="mt-5 h-7 w-32" />
        <Skeleton className="mt-4 h-1.5 w-full" />
      </Card>
    );
  }

  const TrendIcon = trend?.direction === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Card interactive className={cn("flex flex-col gap-3 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="truncate text-2xl font-medium tabular tracking-tight text-foreground">{value}</p>

      {progress != null && <Progress value={progress} tone="primary" label={`${label} usage`} />}

      {(trend || hint) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trend.direction === "down" ? "text-destructive" : "text-success",
              )}
            >
              <TrendIcon className="size-3.5" aria-hidden="true" />
              {trend.value}
            </span>
          )}
          {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
