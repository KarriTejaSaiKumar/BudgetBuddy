import React from 'react';

const SectionTitle = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="w-4.5 h-4.5 text-orange-500" />}
          <span>{title}</span>
        </h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionTitle;
