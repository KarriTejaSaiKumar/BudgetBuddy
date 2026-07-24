import React from 'react';

const SecondaryButton = ({ children, onClick, type = "button", disabled = false, className = "", icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default SecondaryButton;
