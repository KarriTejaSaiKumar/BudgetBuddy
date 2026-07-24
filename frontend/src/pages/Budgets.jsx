import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import {
  PageHeader,
  DashboardCard,
  TableContainer,
  StatusBadge,
  PrimaryButton,
  SecondaryButton,
  Modal,
  ConfirmationDialog,
  EmptyState,
  LoadingSkeleton
} from '../components';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../utils/formatters';
import {
  PieChart,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Grid,
  List,
  Eye,
  TrendingUp
} from 'lucide-react';

const Budgets = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();
  const [budgets, setBudgets] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal & Form States
  const [formData, setFormData] = useState({
    category: 'food',
    budget_amount: '',
    currency: currency,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [error, setError] = useState('');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budgets/');
      setBudgets(response.data);
      response.data.forEach((b) => fetchSingleSummary(b.id));
    } catch (err) {
      console.error('Error fetching budget records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleSummary = async (id) => {
    try {
      const response = await api.get(`/budgets/${id}/summary/`);
      setSummaries((prev) => ({ ...prev, [id]: response.data }));
    } catch (err) {
      console.error(`Error fetching summary for budget ${id}:`, err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      category: 'food',
      budget_amount: '',
      currency: currency,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bud) => {
    setEditingId(bud.id);
    setFormData({
      category: bud.category,
      budget_amount: bud.budget_amount,
      currency: bud.currency || currency,
      month: bud.month,
      year: bud.year
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}/update/`, formData);
      } else {
        await api.post('/budgets/create/', formData);
      }
      handleCloseModal();
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save category budget.');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/budgets/${deleteId}/delete/`);
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting category budget:', err);
    }
  };

  // Metrics
  const totalAllocated = budgets.reduce((sum, b) => sum + parseFloat(b.budget_amount || 0), 0);
  const totalSpent = Object.values(summaries).reduce((sum, s) => sum + (s.total_expense || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overspentCount = Object.values(summaries).filter((s) => s.overspent_amount > 0).length;

  return (
    <AppLayout title="Budgets">
      {/* 1. Page Header */}
      <PageHeader
        title="Category Budget Limits"
        subtitle="Set category spending thresholds and monitor real-time utilization."
        icon={PieChart}
        actions={
          <>
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
              Set Budget
            </PrimaryButton>
          </>
        }
      />

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Budget Allocated"
          amount={totalAllocated}
          currency={currency}
          icon={PieChart}
          iconBg="bg-orange-500/10 text-orange-500 border-orange-500/20"
          subtitle="Cumulative monthly limit"
          subtitleColor="text-orange-500"
        />

        <DashboardCard
          title="Total Spent So Far"
          amount={totalSpent}
          currency={currency}
          icon={TrendingUp}
          iconBg="bg-rose-500/10 text-rose-500 border-rose-500/20"
          subtitle="Total recorded expenses"
          subtitleColor="text-rose-500"
        />

        <DashboardCard
          title="Net Remaining Capacity"
          amount={totalRemaining}
          currency={currency}
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          subtitle="Capacity left before limit"
          subtitleColor="text-emerald-500"
        />

        <DashboardCard
          title="Overspent Categories"
          amount={overspentCount}
          currency={currency}
          icon={AlertTriangle}
          iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
          subtitle={`${overspentCount} categories exceeded`}
          subtitleColor={overspentCount > 0 ? "text-rose-500" : "text-emerald-500"}
        />
      </div>

      {/* 3. Main View Grid or Table */}
      {loading ? (
        <LoadingSkeleton count={4} type="card" />
      ) : budgets.length === 0 ? (
        <TableContainer>
          <EmptyState
            title="No active category budgets"
            description="Establish monthly spending thresholds for housing, food, utilities, and transport to prevent overspending."
            action={
              <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
                Set First Category Budget
              </PrimaryButton>
            }
          />
        </TableContainer>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((bud) => {
            const bSummary = summaries[bud.id];
            const spent = bSummary ? bSummary.total_expense : 0;
            const limit = parseFloat(bud.budget_amount || 0);
            const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isOverspent = bSummary && bSummary.overspent_amount > 0;
            const itemCurrency = bud.currency || currency;

            return (
              <div
                key={bud.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-orange-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                        {bud.category_display || bud.category}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>{monthNames[bud.month - 1]} {bud.year}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedSummary(bSummary || { budget: bud })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                        title="View Detailed Summary"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(bud)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                        title="Edit Budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(bud.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Spending Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{percentage}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isOverspent
                            ? 'bg-rose-500'
                            : percentage >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Spent</span>
                      <span className="font-bold text-rose-500">
                        {formatCurrency(spent, itemCurrency, numberFormat)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Limit</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(limit, itemCurrency, numberFormat)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {isOverspent ? (
                    <StatusBadge type="expense" icon={AlertTriangle}>
                      Overspent by {formatCurrency(bSummary.overspent_amount, itemCurrency, numberFormat)}
                    </StatusBadge>
                  ) : (
                    <StatusBadge type="income" icon={CheckCircle2}>
                      {formatCurrency(bSummary ? bSummary.remaining_budget : 0, itemCurrency, numberFormat)} Remaining
                    </StatusBadge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <TableContainer>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Limit</th>
                <th className="py-3 px-4">Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {budgets.map((bud) => {
                const bSummary = summaries[bud.id];
                const spent = bSummary ? bSummary.total_expense : 0;
                const limit = parseFloat(bud.budget_amount || 0);
                const isOverspent = bSummary && bSummary.overspent_amount > 0;
                const itemCurrency = bud.currency || currency;

                return (
                  <tr key={bud.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 capitalize">
                      {bud.category_display || bud.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {monthNames[bud.month - 1]} {bud.year}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(limit, itemCurrency, numberFormat)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-500">
                      {formatCurrency(spent, itemCurrency, numberFormat)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isOverspent ? (
                        <StatusBadge type="expense" icon={AlertTriangle}>
                          Overspent
                        </StatusBadge>
                      ) : (
                        <StatusBadge type="income" icon={CheckCircle2}>
                          On Track
                        </StatusBadge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSummary(bSummary || { budget: bud })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                          title="View Summary"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(bud)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                          title="Edit Budget"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(bud.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableContainer>
      )}

      {/* 4. Edit / Add Budget Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Category Budget' : 'Set Category Budget'}
        maxWidth="max-w-md"
      >
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
            >
              <option value="housing">Housing/Rent</option>
              <option value="food">Food</option>
              <option value="groceries">Groceries</option>
              <option value="utilities">Utilities</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="insurance">Insurance/Healthcare</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Limit Amount *</label>
              <input
                type="number"
                step="0.01"
                name="budget_amount"
                placeholder="500.00"
                value={formData.budget_amount}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Month *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SecondaryButton onClick={handleCloseModal}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">
              {editingId ? 'Update Budget' : 'Save Budget'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* 5. Detailed Summary Modal Dialog */}
      <Modal
        isOpen={Boolean(selectedSummary)}
        onClose={() => setSelectedSummary(null)}
        title="Category Budget Telemetry"
        maxWidth="max-w-md"
      >
        {selectedSummary && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Budget Limit:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedSummary.budget_amount || selectedSummary.budget?.budget_amount || 0, selectedSummary.budget?.currency || currency, numberFormat)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Expenses Logged:</span>
                <span className="font-bold text-rose-500">
                  {formatCurrency(selectedSummary.total_expense || 0, selectedSummary.budget?.currency || currency, numberFormat)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-bold">
                <span className="text-slate-400">Remaining Budget:</span>
                <span className="text-emerald-500">
                  {formatCurrency(selectedSummary.remaining_budget || 0, selectedSummary.budget?.currency || currency, numberFormat)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <SecondaryButton onClick={() => setSelectedSummary(null)}>Close</SecondaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category Budget"
        message="Are you sure you want to delete this category budget limit? This action cannot be reversed."
        confirmText="Delete Budget"
        isDanger={true}
      />
    </AppLayout>
  );
};

export default Budgets;
