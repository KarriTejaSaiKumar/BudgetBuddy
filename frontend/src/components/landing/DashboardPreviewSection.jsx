import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useFinancialPreferences } from '../../context/FinancialPreferencesContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardPreviewSection = () => {
  const { isDark } = useTheme();
  const { currency, numberFormat } = useFinancialPreferences();

  const previewMetrics = [
    { title: 'Total Income', val: 8450, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Total Expenses', val: 3120, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
    { title: 'Current Net Balance', val: 5330, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
    { title: 'Budget Utilized', val: '62.4%', icon: PieChart, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  const recentTx = [
    { title: 'Client Consulting Retainer', category: 'Income', amount: 3500, isIncome: true, date: 'Today' },
    { title: 'Whole Foods Market', category: 'Groceries', amount: 142.50, isIncome: false, date: 'Yesterday' },
    { title: 'AWS Cloud Infrastructure', category: 'Software/Utilities', amount: 89.00, isIncome: false, date: 'Jul 22' },
    { title: 'Freelance Web Design', category: 'Income', amount: 1200, isIncome: true, date: 'Jul 20' },
  ];

  return (
    <section className="py-20 px-6 md:px-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Live Interactive Experience</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Enterprise Finance Cockpit
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Here is a glimpse of how your financial data looks inside BudgetBuddy.
          </p>
        </div>

        {/* Mockup Container */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 ${
          isDark ? 'bg-[#181818] border-[#262626] shadow-orange-500/5' : 'bg-white border-slate-200 shadow-slate-200'
        }`}>
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {previewMetrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0B0B] border-[#262626]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{m.title}</span>
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${m.bg} ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`text-xl font-extrabold ${m.color}`}>
                    {typeof m.val === 'number' ? formatCurrency(m.val, currency, numberFormat) : m.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics & Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Budget Progress & Monthly Chart */}
            <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0B0B0B] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Category Budget Allocation & Utilization</h4>
                <span className="text-xs font-semibold text-orange-500">Jul 2026</span>
              </div>

              {/* Progress Bar 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Housing & Rent</span>
                  <span className="text-slate-400">$1,500.00 / $1,800.00 (83.3%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[83.3%]" />
                </div>
              </div>

              {/* Progress Bar 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Dining & Food</span>
                  <span className="text-slate-400">$620.00 / $600.00 (103.3% - Overspent)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-full" />
                </div>
              </div>

              {/* Progress Bar 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Entertainment</span>
                  <span className="text-slate-400">$180.00 / $400.00 (45.0%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[45%]" />
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0B0B0B] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-sm font-bold mb-1">Recent Transactions</h4>
              <div className="space-y-2.5">
                {recentTx.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900/60 transition">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${tx.isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {tx.isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold">{tx.title}</div>
                        <div className="text-[11px] text-slate-400">{tx.category} • {tx.date}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.isIncome ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {tx.isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency, numberFormat)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;
