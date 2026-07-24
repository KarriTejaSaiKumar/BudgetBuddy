import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import {
  PageHeader,
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
  CreditCard,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';

const Expenses = () => {
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Form & Modal States
  const [formData, setFormData] = useState({ title: '', amount: '', currency: currency, category: 'other', expense_date: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, sortOption]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = '/expenses/';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (sortOption) params.append('sort', sortOption);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setExpenses(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
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
      category: 'other',
      expense_date: new Date().toISOString().slice(0, 10),
      description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingId(exp.id);
    setFormData({
      title: exp.title,
      amount: exp.amount,
      currency: exp.currency || currency,
      category: exp.category,
      expense_date: exp.expense_date,
      description: exp.description || ''
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
        await api.put(`/expenses/${editingId}/update/`, formData);
      } else {
        await api.post('/expenses/create/', formData);
      }
      handleCloseModal();
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save expense entry.');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/expenses/${deleteId}/delete/`);
      setDeleteId(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  // Filter local expenses by Search query
  const filteredExpenses = expenses.filter((exp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      exp.title.toLowerCase().includes(q) ||
      (exp.description && exp.description.toLowerCase().includes(q)) ||
      (exp.category_display && exp.category_display.toLowerCase().includes(q))
    );
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <AppLayout title="Expenses">
      {/* 1. Page Header */}
      <PageHeader
        title="Expenses Management"
        subtitle={`Total Outgoing: ${formatCurrency(totalExpenseAmount, currency, numberFormat)} (${filteredExpenses.length} entries)`}
        icon={CreditCard}
        actions={
          <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
            Add Expense
          </PrimaryButton>
        }
      />

      {/* 2. Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by title..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none text-xs"
            >
              <option value="">All Categories</option>
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

      {/* 3. Expense Data Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : filteredExpenses.length === 0 ? (
        <TableContainer>
          <EmptyState
            title="No expense records found"
            description={searchQuery || categoryFilter ? "No expenses match your search or filter criteria." : "Click 'Add Expense' above to log your first outgoing transaction."}
            action={
              <PrimaryButton onClick={handleOpenAddModal} icon={Plus}>
                Add First Expense
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
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {exp.title}
                    {exp.description && <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">{exp.description}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge type="orange">
                      {exp.category_display || exp.category}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(exp.expense_date, dateFormat)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-500">
                    -{formatCurrency(exp.amount, exp.currency || currency, numberFormat)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Expense"
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

      {/* 4. Edit / Add Expense Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Expense Record' : 'Log New Expense'}
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
              placeholder="e.g. Supermarket Groceries, Apartment Rent"
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
                placeholder="150.00"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Expense Date *</label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
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
              placeholder="Additional expense details or notes..."
              rows="2"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SecondaryButton onClick={handleCloseModal}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">
              {editingId ? 'Update Expense' : 'Save Expense'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* 5. Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This operation cannot be reversed."
        confirmText="Delete Record"
        isDanger={true}
      />
    </AppLayout>
  );
};

export default Expenses;
