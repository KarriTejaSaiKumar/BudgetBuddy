import React from 'react';
import { X } from 'lucide-react';

const FormContainer = ({ title, subtitle, onClose, children, className = "" }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-xs relative transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default FormContainer;
