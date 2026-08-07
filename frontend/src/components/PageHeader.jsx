import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-2xl font-medium tracking-tight text-balance text-foreground">
          {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
          <span>{title}</span>
        </h2>
        {subtitle && <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
};

export default PageHeader;
