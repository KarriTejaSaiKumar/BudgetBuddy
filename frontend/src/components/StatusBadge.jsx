import React from 'react';

const StatusBadge = ({ children, type = "neutral", className = "", icon: Icon }) => {
  const styles = {
    income: "bg-success/10 text-success",
    expense: "bg-destructive/10 text-destructive",
    warning: "bg-warning/12 text-warning",
    orange: "bg-primary-soft text-foreground",
    info: "bg-info/10 text-info",
    neutral: "bg-secondary text-secondary-foreground",
  };

  const selectedStyle = styles[type] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium ${selectedStyle} ${className}`}
    >
      {Icon && <Icon className="size-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default StatusBadge;
