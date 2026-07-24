import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs backdrop-blur-md relative overflow-hidden transition-colors duration-200">
      <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-orange-500" />}
          <span>{title}</span>
        </h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 w-full sm:w-auto">{actions}</div>}
    </div>
  );
};

export default PageHeader;
