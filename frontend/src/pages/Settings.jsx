import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Globe,
  Hash,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
  Wallet,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { LANGUAGES, PROFILE_CURRENCIES, THEME_CHOICES, TIMEZONES } from '../services/profile';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Field,
  PageHeader,
  SectionHeader,
  Select,
  Switch,
} from '@/components/ui';
import { cn } from '@/lib/utils';

const NOTIFICATION_SWITCHES = [
  { key: 'email_notifications', label: 'Email notifications', hint: 'Send important alerts to your inbox.' },
  { key: 'budget_notifications', label: 'Budget alerts', hint: 'Tell me when a category is close to its limit.' },
  { key: 'savings_notifications', label: 'Savings nudges', hint: 'Progress and deadline reminders for goals.' },
  { key: 'report_notifications', label: 'Report ready', hint: 'Let me know when a statement is available.' },
];

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

const Settings = () => {
  const { logout } = useAuth();
  const { themeMode } = useTheme();
  const {
    currency,
    language,
    timezone,
    notifications,
    dateFormat,
    setDateFormat,
    numberFormat,
    setNumberFormat,
    savePreferences,
    saving,
    loaded,
  } = useFinancialPreferences();

  const [form, setForm] = useState({ currency, language, timezone, theme: themeMode });
  const [status, setStatus] = useState({ tone: '', message: '' });
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    setForm({ currency, language, timezone, theme: themeMode });
  }, [currency, language, timezone, themeMode, loaded]);

  const flash = (tone, message) => {
    setStatus({ tone, message });
    window.setTimeout(() => setStatus({ tone: '', message: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await savePreferences({
      preferred_currency: form.currency,
      language: form.language,
      timezone: form.timezone,
      theme_preference: form.theme,
    });
    if (result.ok) flash('success', 'Your preferences are saved to your account.');
    else flash('destructive', result.error);
  };

  const toggleNotification = async (key, value) => {
    const result = await savePreferences({ [key]: value });
    if (!result.ok) flash('destructive', result.error);
  };

  return (
    <AppLayout title="Settings">
      <PageHeader
        eyebrow="Your setup"
        title="Settings"
        description="How BudgetBuddy speaks to you — money, language, appearance and alerts."
      />

      {status.message && (
        <Alert
          variant={status.tone === 'success' ? 'success' : 'destructive'}
          title={status.tone === 'success' ? 'Saved' : 'Something went wrong'}
          className="mb-6"
        >
          {status.message}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle>Money and locale</CardTitle>
              <p className="text-xs text-muted-foreground">Saved to your account, applied on every device.</p>
            </CardHeader>
            <CardContent className="p-0 pt-5">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="pref-currency" label="Preferred currency" hint="Used across every figure.">
                    <Select
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    >
                      {PROFILE_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field id="pref-language" label="Language">
                    <Select
                      value={form.language}
                      onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field id="pref-timezone" label="Time zone">
                    <Select
                      value={form.timezone}
                      onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                    >
                      {TIMEZONES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace('_', ' ')}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field id="pref-theme" label="Theme">
                    <div className="grid grid-cols-3 gap-2">
                      {THEME_CHOICES.map((t) => {
                        const Icon = THEME_ICONS[t.value];
                        const active = form.theme === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, theme: t.value }))}
                            aria-pressed={active}
                            className={cn(
                              'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[0.6875rem] font-medium transition-colors',
                              active
                                ? 'border-transparent bg-primary-soft text-foreground ring-1 ring-primary/40'
                                : 'border-hairline text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                          >
                            <Icon className="size-4" aria-hidden="true" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                <Button type="submit" loading={saving}>
                  <Check className="size-4" /> Save preferences
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle>Notifications</CardTitle>
              <p className="text-xs text-muted-foreground">Each switch saves the moment you flip it.</p>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <ul className="divide-y divide-hairline">
                {NOTIFICATION_SWITCHES.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
                    </div>
                    <Switch
                      checked={Boolean(notifications[item.key])}
                      onCheckedChange={(value) => toggleNotification(item.key, value)}
                      aria-label={item.label}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle>Display</CardTitle>
              <p className="text-xs text-muted-foreground">
                Formatting choices stay on this device — the account does not store them.
              </p>
            </CardHeader>
            <CardContent className="p-0 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="pref-date" label="Date format">
                  <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                    <option value="DD/MM/YYYY">31/12/2026</option>
                    <option value="MM/DD/YYYY">12/31/2026</option>
                    <option value="YYYY-MM-DD">2026-12-31</option>
                  </Select>
                </Field>
                <Field id="pref-number" label="Number format">
                  <Select value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)}>
                    <option value="international">1,234,567.89</option>
                    <option value="indian">12,34,567.89</option>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionHeader title="At a glance" />
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Wallet className="size-4" aria-hidden="true" /> {currency}
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Globe className="size-4" aria-hidden="true" /> {language} · {timezone}
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Palette className="size-4" aria-hidden="true" /> {themeMode} theme
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Hash className="size-4" aria-hidden="true" /> {dateFormat} · {numberFormat}
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Bell className="size-4" aria-hidden="true" />
                {Object.values(notifications).filter(Boolean).length} of 4 alerts on
              </li>
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeader title="Session" description="Sign out on this device." />
            <Button variant="outline" className="mt-4" block onClick={() => setConfirmLogout(true)}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out of BudgetBuddy?"
        description="You will need your username and password to get back in."
        confirmLabel="Sign out"
        onConfirm={() => logout()}
      />
    </AppLayout>
  );
};

export default Settings;
