import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import {
  PageHeader,
  DashboardCard,
  TableContainer,
  SectionTitle,
  StatusBadge,
  PrimaryButton,
  EmptyState,
  LoadingSkeleton
} from '../components';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileSpreadsheet,
  Download,
  Wallet,
  PieChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

const Reports = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!dashboardData || !dashboardData.recent_transactions) return;
    const headers = ["ID", "Type", "Title", "Category", "Amount", "Date"];
    const rows = dashboardData.recent_transactions.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.title}"`,
      `"${tx.category}"`,
      tx.amount,
      tx.date
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BudgetBuddy_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AppLayout title="Analytics & Reports">
        <LoadingSkeleton count={3} type="card" />
        <LoadingSkeleton count={4} type="table" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Analytics & Reports">
      {/* 1. Page Header */}
      <PageHeader
        title="Financial Statements & Export"
        subtitle="Export telemetry data and review consolidated financial summaries."
        icon={FileSpreadsheet}
        actions={
          <PrimaryButton onClick={handleExportCSV} icon={Download}>
            Export CSV Report
          </PrimaryButton>
        }
      />

      {/* 2. Summary Metrics Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Net Savings"
            amount={dashboardData.current_balance}
            currency={currency}
            icon={Wallet}
            iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            subtitle="Total Income minus Total Expenses"
            subtitleColor="text-emerald-500"
          />

          <DashboardCard
            title="Total Budget Allocated"
            amount={dashboardData.total_budget}
            currency={currency}
            icon={PieChart}
            iconBg="bg-orange-500/10 text-orange-500 border-orange-500/20"
            subtitle="Total category spending limits"
            subtitleColor="text-orange-500"
          />

          <DashboardCard
            title="Unallocated Capacity"
            amount={dashboardData.remaining_budget}
            currency={currency}
            icon={DollarSign}
            iconBg="bg-blue-500/10 text-blue-500 border-blue-500/20"
            subtitle="Remaining capacity under limits"
            subtitleColor="text-blue-500"
          />
        </div>
      )}

      {/* 3. Export Preview Table */}
      <TableContainer>
        <SectionTitle
          title="Recent Transactions Statement"
          subtitle="Preview of transaction entries included in export files"
          icon={FileSpreadsheet}
        />

        {!dashboardData || dashboardData.recent_transactions.length === 0 ? (
          <EmptyState
            title="No statement records available"
            description="Add income or expense transactions to populate financial reports."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {dashboardData.recent_transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      type={tx.type === 'Income' ? 'income' : 'expense'}
                      icon={tx.type === 'Income' ? ArrowUpRight : ArrowDownLeft}
                    >
                      {tx.type}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{tx.title}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">{tx.category}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(tx.date, dateFormat)}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold ${tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount, currency, numberFormat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableContainer>
    </AppLayout>
  );
};

export default Reports;
