import React from 'react';

const LoadingSkeleton = ({ count = 3, type = "card" }) => {
  if (type === "table") {
    return (
      <div className="space-y-3 animate-pulse p-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-800/50 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 h-32 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-24" />
            <div className="w-8 h-8 rounded-lg bg-slate-800" />
          </div>
          <div className="h-6 bg-slate-800 rounded w-32" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
