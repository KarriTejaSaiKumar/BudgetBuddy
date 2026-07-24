import React from 'react';

const TableContainer = ({ children, className = "" }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors duration-200 ${className}`}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export default TableContainer;
