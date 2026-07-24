import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import {
  DashboardCard,
  PageHeader,
  TableContainer,
  SectionTitle,
  StatusBadge,
  EmptyState,
  LoadingSkeleton,
  PrimaryButton,
  SecondaryButton
} from '../components';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_budget: 0,
    remaining_budget: 0,
    recent_transactions: []
  });
  const [budgets, setBudgets] = useState([]);
  const [budgetSummaries, setBudgetSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchBudgetsData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetsData = async () => {
    try {
      const response = await api.get('/budgets/');
      setBudgets(response.data);
      response.data.forEach((b) => fetchSingleBudgetSummary(b.id));
    } catch (err) {
      console.error('Error fetching budgets overview:', err);
    }
  };

  const fetchSingleBudgetSummary = async (id) => {
    try {
      const response = await api.get(`/budgets/${id}/summary/`);
      setBudgetSummaries((prev) => ({ ...prev, [id]: response.data }));
    } catch (err) {
      console.error(`Error fetching budget summary ${id}:`, err);
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <LoadingSkeleton count={5} type="card" />
        <LoadingSkeleton count={3} type="table" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      {/* 1. Page Header */}
      <PageHeader
        title="Your Financial Dashboard"
        subtitle="Track your income, expenses, budgets, and financial health in one place."
        icon={LayoutDashboard}
        actions={
          <>
            <Link to="/income">
              <SecondaryButton icon={PlusCircle}>Add Income</SecondaryButton>
            </Link>
            <Link to="/expenses">
              <SecondaryButton icon={PlusCircle}>Add Expense</SecondaryButton>
            </Link>
            <Link to="/budgets">
              <PrimaryButton icon={PieChart}>Set Budget</PrimaryButton>
            </Link>
          </>
        }
      />

      {/* 2. 5 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Current Balance"
          amount={summary.current_balance}
          currency={currency}
          icon={Wallet}
          iconBg="bg-blue-500/10 text-blue-500 border-blue-500/20"
          subtitle="Net available balance"
          subtitleColor="text-slate-500 dark:text-slate-400"
        />

        <DashboardCard
          title="Total Income"
          amount={summary.total_income}
          currency={currency}
          icon={TrendingUp}
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          subtitle="Cumulative earnings"
          subtitleColor="text-emerald-500"
        />

        <DashboardCard
          title="Total Expense"
          amount={summary.total_expense}
          currency={currency}
          icon={TrendingDown}
          iconBg="bg-rose-500/10 text-rose-500 border-rose-500/20"
          subtitle="Total outgoing"
          subtitleColor="text-rose-500"
        />

        <DashboardCard
          title="Total Budget"
          amount={summary.total_budget}
          currency={currency}
          icon={PieChart}
          iconBg="bg-orange-500/10 text-orange-500 border-orange-500/20"
          subtitle="Allocated limits"
          subtitleColor="text-orange-500"
        />

        <DashboardCard
          title="Remaining Budget"
          amount={summary.remaining_budget}
          currency={currency}
          icon={PiggyBank}
          iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
          subtitle="Capacity remaining"
          subtitleColor="text-amber-500"
        />
      </div>

      {/* 3. Main Grid: Recent Transactions Table & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container for Recent Transactions */}
        <TableContainer className="lg:col-span-2">
          <SectionTitle
            title="Recent Transactions"
            subtitle="Latest activity across income and expense entries"
            icon={Clock}
            action={
              <Link to="/expenses" className="text-xs font-semibold text-orange-500 hover:underline">
                View All &rarr;
              </Link>
            }
          />

          {summary.recent_transactions.length === 0 ? (
            <EmptyState
              title="No transactions recorded"
              description="Get started by logging your first income or expense transaction."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {summary.recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{tx.title}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="neutral">{tx.category}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        type={tx.type === 'Income' ? 'income' : 'expense'}
                        icon={tx.type === 'Income' ? ArrowUpRight : ArrowDownLeft}
                      >
                        {tx.type}
                      </StatusBadge>
                    </td>
                    <td className={`py-3.5 px-4 font-bold ${tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount, currency, numberFormat)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(tx.date, dateFormat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableContainer>

        {/* Budget Overview Progress Section */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <SectionTitle
              title="Budget Limits"
              subtitle="Spending thresholds by category"
              icon={PieChart}
              action={
                <Link to="/budgets" className="text-xs font-semibold text-orange-500 hover:underline">
                  Manage
                </Link>
              }
            />

            {budgets.length === 0 ? (
              <EmptyState
                title="No active budgets"
                description="Set monthly category budgets to monitor spending thresholds."
              />
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((bud) => {
                  const bSummary = budgetSummaries[bud.id];
                  const spent = bSummary ? bSummary.total_expense : 0;
                  const limit = parseFloat(bud.budget_amount || 0);
                  const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                  const isOverspent = bSummary && bSummary.overspent_amount > 0;

                  return (
                    <div key={bud.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                          {bud.category_display || bud.category} ({monthNames[bud.month - 1]})
                        </span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatCurrency(spent, currency, numberFormat)} / {formatCurrency(limit, currency, numberFormat)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden mb-1.5 border border-slate-300 dark:border-slate-800">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isOverspent ? 'bg-rose-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">{percentage}% used</span>
                        {isOverspent ? (
                          <StatusBadge type="expense" icon={AlertTriangle}>
                            Overspent by {formatCurrency(bSummary.overspent_amount, currency, numberFormat)}
                          </StatusBadge>
                        ) : (
                          <StatusBadge type="income" icon={CheckCircle2}>
                            {formatCurrency(bSummary ? bSummary.remaining_budget : 0, currency, numberFormat)} left
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Analytics Section Layout Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <SectionTitle
            title="Expense Distribution"
            subtitle="Category-wise expense breakdown layout placeholder"
            icon={PieChartIcon}
          />
          <div className="h-44 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
            <PieChartIcon className="w-7 h-7 text-slate-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expense Distribution Placeholder</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <SectionTitle
            title="Monthly Spending Trend"
            subtitle="Historical trend analysis layout placeholder"
            icon={BarChart2}
          />
          <div className="h-44 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
            <BarChart2 className="w-7 h-7 text-slate-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Spending Trend Placeholder</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
