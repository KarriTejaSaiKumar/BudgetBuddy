import React from 'react';

const StatusBadge = ({ children, type = "neutral", className = "", icon: Icon }) => {
  const styles = {
    income: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expense: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    neutral: "bg-slate-800 text-slate-300 border-slate-700/60",
  };

  const selectedStyle = styles[type] || styles.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedStyle} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default StatusBadge;
