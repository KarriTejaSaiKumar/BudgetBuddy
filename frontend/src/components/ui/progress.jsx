import { cn } from "@/lib/utils";

/**
 * Hairline progress rail. Ink fills deepen as a budget is consumed, so
 * "nearly spent" reads as weight rather than alarm-red.
 */
function Progress({ value = 0, max = 100, tone = "primary", className, label, ...props }) {
  const pct = Math.min(100, Math.max(0, (Number(value) / (Number(max) || 1)) * 100));
  const tones = {
    primary: pct >= 90 ? "bg-primary" : pct >= 60 ? "bg-primary/70" : "bg-primary/35",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
    muted: "bg-primary/25",
  };
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          tones[tone] ?? tones.primary,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
