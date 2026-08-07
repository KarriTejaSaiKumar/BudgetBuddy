import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';

const DashboardCard = ({
  title,
  amount,
  currency: itemCurrency,
  icon: Icon,
  iconBg = "bg-primary-soft text-foreground",
  subtitle,
  subtitleColor = "text-muted-foreground",
  className = ""
}) => {
  const { currency: globalCurrency, numberFormat } = useFinancialPreferences();
  const displayCurrency = itemCurrency || globalCurrency;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl bg-card p-5 shadow-[0_0_0_1px_var(--color-hairline)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-border),var(--shadow-md)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="eyebrow">{title}</span>
        {Icon && (
          <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${iconBg}`}>
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div>
        <div className="truncate text-2xl font-medium tabular tracking-tight text-foreground">
          {formatCurrency(amount, displayCurrency, numberFormat)}
        </div>
        {subtitle && <p className={`mt-1.5 text-xs ${subtitleColor}`}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
