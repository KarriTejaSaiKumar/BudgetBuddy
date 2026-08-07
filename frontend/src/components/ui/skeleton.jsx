import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("shimmer rounded-xl bg-muted", className)}
      {...props}
    />
  );
}

/** Common composed loading shapes so pages never hand-roll skeletons. */
function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-32" />
          <Skeleton className="mt-3 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonStats, SkeletonTable };
