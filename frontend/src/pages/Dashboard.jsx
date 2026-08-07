import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { formatCurrency } from '../utils/formatters';
import { categoryMeta, decorateExpense } from '../utils/expenses';
import { decorateIncome, sourceLabel, writeMeta } from '../utils/income';
import { createGoal, listGoals } from '../utils/savings';
import { listNotifications } from '../services/notifications';
import { QUICK_CREATE_EVENT } from '../components/QuickActionsFab';
import ExpenseFormDialog from '../components/expenses/ExpenseFormDialog';
import IncomeFormDialog from '../components/income/IncomeFormDialog';
import BudgetFormDialog from '../components/budgets/BudgetFormDialog';
import SavingsGoalFormDialog from '../components/savings/SavingsGoalFormDialog';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { BalancePanel } from '../components/dashboard/BalancePanel';
import { QuickSummary } from '../components/dashboard/QuickSummary';
import {
  CategoryDonut,
  IncomeVsExpenseChart,
  SpendingTrendChart,
  ChartSkeleton,
} from '../components/dashboard/DashboardCharts';
import { BudgetHealth } from '../components/dashboard/BudgetHealth';
import { SavingsGoals } from '../components/dashboard/SavingsGoals';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { LatestNotifications } from '../components/dashboard/LatestNotifications';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const amountOf = (v) => Number.parseFloat(v ?? 0) || 0;

const sameMonth = (value, ref) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
};

const errorText = (err, fallback) => {
  const detail = err.response?.data;
  if (typeof detail === 'string') return detail;
  return detail?.detail || detail?.error || Object.values(detail || {}).flat()[0] || fallback;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { currency, dateFormat, numberFormat } = useFinancialPreferences();

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_budget: 0,
    remaining_budget: 0,
  });
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick-create dialogs, driven by the single floating action button.
  const [dialog, setDialog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const format = useCallback(
    (value, code) => formatCurrency(value, code || currency, numberFormat),
    [currency, numberFormat],
  );

  const load = useCallback(async () => {
    const [dash, expenseRes, incomeRes, budgetRes, goalList, notes] = await Promise.all([
      api.get('/dashboard/').catch(() => ({ data: {} })),
      api.get('/expenses/').catch(() => ({ data: [] })),
      api.get('/incomes/').catch(() => ({ data: [] })),
      api.get('/budgets/').catch(() => ({ data: [] })),
      listGoals().catch(() => []),
      listNotifications().catch(() => []),
    ]);
    setSummary((s) => ({ ...s, ...(dash.data || {}) }));
    setExpenses((Array.isArray(expenseRes.data) ? expenseRes.data : []).map(decorateExpense));
    setIncomes((Array.isArray(incomeRes.data) ? incomeRes.data : []).map(decorateIncome));
    setBudgets(Array.isArray(budgetRes.data) ? budgetRes.data : []);
    setGoals(Array.isArray(goalList) ? goalList : []);
    setNotifications(Array.isArray(notes) ? notes : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  // The FAB asks first; the dashboard owns the modals, so nothing navigates.
  useEffect(() => {
    const onQuickCreate = (event) => {
      const key = event.detail?.key;
      if (!['expense', 'income', 'budget', 'savings'].includes(key)) return;
      event.preventDefault();
      setFormError('');
      setDialog(key);
    };
    window.addEventListener(QUICK_CREATE_EVENT, onQuickCreate);
    return () => window.removeEventListener(QUICK_CREATE_EVENT, onQuickCreate);
  }, []);

  const now = new Date();
  const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const monthly = useMemo(() => {
    const sum = (list, dateKey, ref) =>
      list.filter((r) => sameMonth(r[dateKey], ref)).reduce((total, r) => total + amountOf(r.amount), 0);

    const income = sum(incomes, 'date', now);
    const expense = sum(expenses, 'expense_date', now);
    const lastIncome = sum(incomes, 'date', prevMonthRef);
    const lastExpense = sum(expenses, 'expense_date', prevMonthRef);
    const delta = (current, previous) =>
      previous > 0 ? ((current - previous) / previous) * 100 : null;

    return {
      income,
      expense,
      saved: income - expense,
      rate: income > 0 ? ((income - expense) / income) * 100 : 0,
      incomeDelta: delta(income, lastIncome),
      expenseDelta: delta(expense, lastExpense),
      lastExpense,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes, expenses]);

  const categoryData = useMemo(() => {
    const map = new Map();
    expenses
      .filter((e) => sameMonth(e.expense_date, now))
      .forEach((e) => {
        const key = e.category_display || categoryMeta(e.category).label;
        map.set(key, (map.get(key) || 0) + amountOf(e.amount));
      });
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const trendData = useMemo(() => {
    const buckets = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], Income: 0, Spending: 0 });
    }
    const index = Object.fromEntries(buckets.map((b) => [b.key, b]));
    const add = (list, dateKey, field) => {
      list.forEach((r) => {
        const d = new Date(r[dateKey]);
        const bucket = index[`${d.getFullYear()}-${d.getMonth()}`];
        if (bucket) bucket[field] += amountOf(r.amount);
      });
    };
    add(incomes, 'date', 'Income');
    add(expenses, 'expense_date', 'Spending');
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes, expenses]);

  const transactions = useMemo(() => {
    const fromExpenses = expenses.map((e) => ({
      key: `e-${e.id}`,
      title: e.title || categoryMeta(e.category).label,
      categoryLabel: e.category_display || categoryMeta(e.category).label,
      icon: categoryMeta(e.category).icon,
      amount: amountOf(e.amount),
      currency: e.currency,
      date: e.expense_date,
      isIncome: false,
    }));
    const fromIncomes = incomes.map((i) => ({
      key: `i-${i.id}`,
      title: i.title || sourceLabel(i.source),
      categoryLabel: i.source_display || sourceLabel(i.source),
      icon: ArrowUpRight,
      amount: amountOf(i.amount),
      currency: i.currency,
      date: i.date,
      isIncome: true,
    }));
    return [...fromExpenses, ...fromIncomes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [expenses, incomes]);

  const totalBudget = amountOf(summary.total_budget);
  const budgetSpent = budgets.reduce((total, b) => total + amountOf(b.amount_spent), 0);
  const budgetRemaining = summary.remaining_budget != null
    ? amountOf(summary.remaining_budget)
    : totalBudget - budgetSpent;
  const budgetUsed = totalBudget > 0 ? Math.min(100, (budgetSpent / totalBudget) * 100) : 0;

  const savedTotal = goals.reduce((total, g) => total + amountOf(g.saved), 0);
  const targetTotal = goals.reduce((total, g) => total + amountOf(g.target), 0);
  const unread = notifications.filter((n) => !n.is_read).length;

  const motivation = useMemo(() => {
    if (!incomes.length && !expenses.length) {
      return 'Log your first income and expense — BudgetBuddy takes it from there.';
    }
    if (monthly.saved < 0) {
      return 'Spending is ahead of income this month. One small cut today changes the curve.';
    }
    if (monthly.rate >= 20) {
      return `You have kept ${monthly.rate.toFixed(0)}% of this month's income. That is a habit worth protecting.`;
    }
    return 'Steady progress beats a perfect month. Keep logging and the picture sharpens.';
  }, [incomes.length, expenses.length, monthly]);

  const tiles = [
    {
      label: 'Income',
      value: monthly.income,
      format,
      icon: TrendingUp,
      tone: 'success',
      trend:
        monthly.incomeDelta != null
          ? { direction: monthly.incomeDelta >= 0 ? 'up' : 'down', value: `${Math.abs(monthly.incomeDelta).toFixed(0)}%` }
          : null,
      hint: 'vs last month',
    },
    {
      label: 'Expenses',
      value: monthly.expense,
      format,
      icon: TrendingDown,
      tone: 'destructive',
      trend:
        monthly.expenseDelta != null
          ? { direction: monthly.expenseDelta >= 0 ? 'up' : 'down', value: `${Math.abs(monthly.expenseDelta).toFixed(0)}%` }
          : null,
      hint: monthly.lastExpense > 0 ? `${format(monthly.lastExpense)} last month` : 'vs last month',
    },
    {
      label: 'Budget remaining',
      value: budgetRemaining,
      format,
      icon: Wallet,
      tone: 'primary',
      progress: budgetUsed,
      hint: totalBudget > 0 ? `${budgetUsed.toFixed(0)}% of ${format(totalBudget)} used` : 'No budgets set yet',
    },
    {
      label: 'Savings',
      value: savedTotal,
      format,
      icon: PiggyBank,
      tone: 'info',
      hint: targetTotal > 0 ? `${((savedTotal / targetTotal) * 100).toFixed(0)}% of ${format(targetTotal)} target` : 'No goals yet',
    },
  ];

  const closeDialog = () => {
    setDialog(null);
    setFormError('');
  };

  const runCreate = async (fn) => {
    setSubmitting(true);
    setFormError('');
    try {
      await fn();
      closeDialog();
      await load();
    } catch (err) {
      setFormError(errorText(err, 'Could not save this. Please check the form and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'there';

  return (
    <AppLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {/* 1 — Welcome */}
        <div className="md:col-span-2 lg:col-span-12">
          <WelcomeBanner name={displayName} message={motivation} />
        </div>

        {/* 2 — Balance hero */}
        <BalancePanel
          className="md:col-span-2 lg:col-span-12"
          balance={amountOf(summary.current_balance)}
          income={monthly.income}
          expenses={monthly.expense}
          netSavings={monthly.saved}
          format={format}
          loading={loading}
          message={
            amountOf(summary.total_income) === 0
              ? 'Log your first income to see your balance come alive.'
              : `${format(summary.total_income)} earned and ${format(summary.total_expense)} spent since you started.`
          }
        />

        {/* 3 — Quick summary */}
        <QuickSummary className="md:col-span-2 lg:col-span-12" tiles={tiles} loading={loading} />

        {/* 5 — Charts */}
        {loading ? (
          <>
            <ChartSkeleton className="md:col-span-2 lg:col-span-8" />
            <ChartSkeleton className="md:col-span-2 lg:col-span-4" />
          </>
        ) : (
          <>
            <IncomeVsExpenseChart className="md:col-span-2 lg:col-span-8" data={trendData} format={format} />
            <CategoryDonut
              className="md:col-span-2 lg:col-span-4"
              data={categoryData}
              total={monthly.expense}
              format={format}
            />
            <SpendingTrendChart className="md:col-span-2 lg:col-span-12" data={trendData} format={format} />
          </>
        )}

        {/* 6 & 7 — Budget health and savings goals */}
        <BudgetHealth className="lg:col-span-6" budgets={budgets} format={format} loading={loading} />
        <SavingsGoals
          className="lg:col-span-6"
          goals={goals}
          format={format}
          dateFormat={dateFormat}
          loading={loading}
        />

        {/* 8 & 9 — Recent transactions and notifications */}
        <RecentTransactions
          className="md:col-span-2 lg:col-span-8"
          transactions={transactions}
          format={format}
          dateFormat={dateFormat}
          loading={loading}
        />
        <LatestNotifications
          className="md:col-span-2 lg:col-span-4"
          items={notifications}
          unread={unread}
          loading={loading}
        />
      </div>

      {/* Section 4 — the single FAB opens the modules' own dialogs */}
      <ExpenseFormDialog
        open={dialog === 'expense'}
        onOpenChange={(open) => (open ? setDialog('expense') : closeDialog())}
        onSubmit={(payload) => runCreate(() => api.post('/expenses/create/', payload))}
        budgets={budgets}
        defaultCurrency={currency}
        submitting={submitting}
        error={dialog === 'expense' ? formError : ''}
      />
      <IncomeFormDialog
        open={dialog === 'income'}
        onOpenChange={(open) => (open ? setDialog('income') : closeDialog())}
        onSubmit={({ payload, meta }) =>
          runCreate(async () => {
            const { data } = await api.post('/incomes/create/', payload);
            if (meta && data?.id) writeMeta(data.id, meta);
          })
        }
        defaultCurrency={currency}
        submitting={submitting}
        error={dialog === 'income' ? formError : ''}
      />
      <BudgetFormDialog
        open={dialog === 'budget'}
        onOpenChange={(open) => (open ? setDialog('budget') : closeDialog())}
        onSubmit={(payload) => runCreate(() => api.post('/budgets/create/', payload))}
        defaultCurrency={currency}
        submitting={submitting}
        error={dialog === 'budget' ? formError : ''}
      />
      <SavingsGoalFormDialog
        open={dialog === 'savings'}
        onOpenChange={(open) => (open ? setDialog('savings') : closeDialog())}
        onSubmit={(values) => runCreate(() => createGoal(values))}
        submitting={submitting}
        error={dialog === 'savings' ? formError : ''}
      />
    </AppLayout>
  );
};

export default Dashboard;
