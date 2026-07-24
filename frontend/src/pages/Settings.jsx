import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import {
  PageHeader,
  FormContainer,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  ConfirmationDialog
} from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { SUPPORTED_CURRENCIES } from '../utils/formatters';
import {
  User,
  Shield,
  Sliders,
  LogOut,
  Moon,
  Sun,
  Globe,
  CheckCircle2,
  Lock,
  DollarSign,
  Calendar,
  Hash
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, activeTheme } = useTheme();
  const {
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    numberFormat,
    setNumberFormat,
    language,
    setLanguage
  } = useFinancialPreferences();

  // Local Preferences Form state
  const [prefCurrency, setPrefCurrency] = useState(currency);
  const [prefDateFormat, setPrefDateFormat] = useState(dateFormat);
  const [prefNumberFormat, setPrefNumberFormat] = useState(numberFormat);
  const [prefThemeMode, setPrefThemeMode] = useState(themeMode);
  const [prefLanguage, setPrefLanguage] = useState(language);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setCurrency(prefCurrency);
    setDateFormat(prefDateFormat);
    setNumberFormat(prefNumberFormat);
    setThemeMode(prefThemeMode);
    setLanguage(prefLanguage);

    setSuccessMessage('Financial preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <AppLayout title="Profile & Preferences">
      {/* 1. Page Header */}
      <PageHeader
        title="Account & Financial Settings"
        subtitle="Manage your profile information, global financial preferences, and theme choices."
        icon={Sliders}
        actions={
          <SecondaryButton onClick={() => setIsLogoutDialogOpen(true)} icon={LogOut}>
            Sign Out
          </SecondaryButton>
        }
      />

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid Layout: Profile Card & Financial Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-orange-500/20 mb-4">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{user?.username || 'User'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || 'user@example.com'}</p>

            <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">#{user?.id || '101'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Theme:</span>
                <span className="font-semibold text-orange-500 capitalize">{activeTheme} Mode</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Currency:</span>
                <span className="font-semibold text-emerald-500 font-mono">{currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Global Financial Preferences Form */}
        <div className="lg:col-span-2 space-y-6">
          <FormContainer
            title="Global Financial Preferences"
            subtitle="Central financial settings used across dashboard, transactions, and statements."
          >
            <form onSubmit={handleSavePreferences} className="space-y-5">
              {/* Default Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <span>Default Currency (ISO standard)</span>
                </label>
                <select
                  value={prefCurrency}
                  onChange={(e) => setPrefCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Stored as 3-letter ISO code. Displays localized symbol ({SUPPORTED_CURRENCIES.find(c => c.code === prefCurrency)?.symbol}) across all pages.
                </p>
              </div>

              {/* Default Date Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Default Date Format</span>
                </label>
                <select
                  value={prefDateFormat}
                  onChange={(e) => setPrefDateFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/07/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/24/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-24)</option>
                </select>
              </div>

              {/* Default Number Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" />
                  <span>Number Formatting Style</span>
                </label>
                <select
                  value={prefNumberFormat}
                  onChange={(e) => setPrefNumberFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="international">International System (100,000.00)</option>
                  <option value="indian">Indian Lakhs/Crores System (1,00,000.00)</option>
                </select>
              </div>

              {/* Theme Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>Theme Preference</span>
                </label>
                <select
                  value={prefThemeMode}
                  onChange={(e) => setPrefThemeMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="dark">Dark Theme (NASA Dark Palette)</option>
                  <option value="light">Light Theme (Enterprise Soft Gray)</option>
                  <option value="system">System Preference (Auto)</option>
                </select>
              </div>

              {/* Language (Future Ready UI) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <span>Display Language</span>
                </label>
                <select
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="English">English (United States)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Localization architecture ready for multi-language translation bindings.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <PrimaryButton type="submit" icon={CheckCircle2}>
                  Save Preferences
                </PrimaryButton>
              </div>
            </form>
          </FormContainer>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={logout}
        title="Sign Out Confirmation"
        message="Are you sure you want to end your active session and sign out of BudgetBuddy?"
        confirmText="Sign Out"
        isDanger={false}
      />
    </AppLayout>
  );
};

export default Settings;
