import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';

const DashboardCard = ({
  title,
  amount,
  currency: itemCurrency,
  icon: Icon,
  iconBg = "bg-orange-500/10 text-orange-500 border-orange-500/20",
  subtitle,
  subtitleColor = "text-slate-500 dark:text-slate-400",
  className = ""
}) => {
  const { currency: globalCurrency, numberFormat } = useFinancialPreferences();
  const displayCurrency = itemCurrency || globalCurrency;

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-orange-500/30 transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconBg}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(amount, displayCurrency, numberFormat)}
        </div>
        {subtitle && (
          <p className={`text-xs font-medium mt-1 ${subtitleColor}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
