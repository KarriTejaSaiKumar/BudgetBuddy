import React from 'react';

const SectionTitle = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <span className="truncate">{title}</span>
        </h3>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default SectionTitle;
