import React from 'react';

const LoadingSkeleton = ({ count = 3, type = "card" }) => {
  if (type === "table") {
    return (
      <div className="animate-pulse space-y-3 p-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex h-32 flex-col justify-between rounded-2xl bg-card p-5 shadow-[0_0_0_1px_var(--color-hairline)]"
        >
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-24 rounded-full bg-muted" />
            <div className="size-8 rounded-lg bg-muted" />
          </div>
          <div className="h-6 w-32 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
