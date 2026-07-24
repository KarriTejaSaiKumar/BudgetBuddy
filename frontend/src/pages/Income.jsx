import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import {
  PageHeader,
  DashboardCard,
  TableContainer,
  SearchBar,
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
import { formatCurrency, formatDate, SUPPORTED_CURRENCIES } from '../utils/formatters';
import {
  TrendingUp,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';

const Income = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Form & Modal States
  const [formData, setFormData] = useState({ title: '', amount: '', currency: currency, source: 'salary', income_date: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncomes();
  }, [sourceFilter, sortOption]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      let url = '/incomes/';
      const params = new URLSearchParams();
      if (sourceFilter) params.append('source', sourceFilter);
      if (sortOption) params.append('sort', sortOption);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setIncomes(response.data);
    } catch (err) {
      console.error('Error fetching income records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      currency: currency,
      source: 'salary',
      income_date: new Date().toISOString().slice(0, 10),
      description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inc) => {
    setEditingId(inc.id);
    setFormData({
      title: inc.title,
      amount: inc.amount,
      currency: inc.currency || currency,
      source: inc.source,
      income_date: inc.income_date,
      description: inc.description || ''
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
        await api.put(`/incomes/${editingId}/update/`, formData);
      } else {
        await api.post('/incomes/create/', formData);
      }
      handleCloseModal();
      fetchIncomes();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save income record.');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/incomes/${deleteId}/delete/`);
      setDeleteId(null);
      fetchIncomes();
    } catch (err) {
      console.error('Error deleting income record:', err);
    }
  };

  // Filter local incomes by search query
  const filteredIncomes = incomes.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      (inc.description && inc.description.toLowerCase().includes(q)) ||
      (inc.source_display && inc.source_display.toLowerCase().includes(q))
    );
  });

  // Calculate summary metric statistics
  const totalIncome = filteredIncomes.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const avgIncome = filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0;
  const thisMonthIncome = filteredIncomes
    .filter((inc) => new Date(inc.income_date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <AppLayout title="Income">
      {/* 1. Page Header */}
      <PageHeader
        title="Income Telemetry"
        subtitle="Manage and monitor your incoming income streams and revenue sources."
        icon={TrendingUp}
        actions={
          <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
            Add Income
          </PrimaryButton>
        }
      />

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Income Recorded"
          amount={totalIncome}
          currency={currency}
          icon={TrendingUp}
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          subtitle="Cumulative earnings"
          subtitleColor="text-emerald-500"
        />

        <DashboardCard
          title="This Month Income"
          amount={thisMonthIncome}
          currency={currency}
          icon={Calendar}
          iconBg="bg-blue-500/10 text-blue-500 border-blue-500/20"
          subtitle="Current calendar month"
          subtitleColor="text-blue-500"
        />

        <DashboardCard
          title="Average per Transaction"
          amount={avgIncome}
          currency={currency}
          icon={DollarSign}
          iconBg="bg-orange-500/10 text-orange-500 border-orange-500/20"
          subtitle="Mean income stream value"
          subtitleColor="text-orange-500"
        />

        <DashboardCard
          title="Number of Streams"
          amount={filteredIncomes.length}
          currency={currency}
          icon={Layers}
          iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
          subtitle="Total logged entries"
          subtitleColor="text-amber-500"
        />
      </div>

      {/* 3. Controls Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search income streams..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none text-xs"
            >
              <option value="">All Sources</option>
              <option value="salary">Salary/Wage</option>
              <option value="freelance">Freelance/Consulting</option>
              <option value="business">Business Revenue</option>
              <option value="investments">Investments/Dividends</option>
              <option value="other">Other Income</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="w-4 h-4 text-orange-500" />
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none text-xs"
            >
              <option value="">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Income Records Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : filteredIncomes.length === 0 ? (
        <TableContainer>
          <EmptyState
            title="No income streams found"
            description={searchQuery || sourceFilter ? "No income streams match your current search or filter criteria." : "Click 'Add Income' above to log your first income stream."}
            action={
              <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
                Add First Income Stream
              </PrimaryButton>
            }
          />
        </TableContainer>
      ) : (
        <TableContainer>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {inc.title}
                    {inc.description && <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">{inc.description}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge type="income">
                      {inc.source_display || inc.source}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(inc.income_date, dateFormat)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-500">
                    +{formatCurrency(inc.amount, inc.currency || currency, numberFormat)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(inc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                        title="Edit Income Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(inc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Income Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      )}

      {/* 5. Edit / Add Income Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Income Entry' : 'Log New Income Stream'}
        maxWidth="max-w-lg"
      >
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Monthly Salary, Client Web Development Retainer"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Amount *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                placeholder="4500.00"
                value={formData.amount}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Income Source *</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="salary">Salary/Wage</option>
                <option value="freelance">Freelance/Consulting</option>
                <option value="business">Business Revenue</option>
                <option value="investments">Investments/Dividends</option>
                <option value="other">Other Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Income Date *</label>
              <input
                type="date"
                name="income_date"
                value={formData.income_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="Additional income notes or reference details..."
              rows="2"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SecondaryButton onClick={handleCloseModal}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">
              {editingId ? 'Update Income' : 'Save Income'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Income Record"
        message="Are you sure you want to delete this income stream record? This operation cannot be reversed."
        confirmText="Delete Record"
        isDanger={true}
      />
    </AppLayout>
  );
};

export default Income;
