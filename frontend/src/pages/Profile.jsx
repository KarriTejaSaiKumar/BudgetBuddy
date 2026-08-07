import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  AtSign,
  Bell,
  Globe,
  LogOut,
  Palette,
  PiggyBank,
  Settings2,
  ShieldCheck,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { getAccount } from '../services/profile';
import { formatCurrency } from '../utils/formatters';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  PageHeader,
  Skeleton,
  StatCard,
} from '@/components/ui';

const num = (v) => Number.parseFloat(v ?? 0) || 0;

const Profile = () => {
  const { user, logout } = useAuth();
  const { themeMode } = useTheme();
  const { currency, language, timezone, notifications, numberFormat } = useFinancialPreferences();

  const [account, setAccount] = useState(user || {});
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, dash] = await Promise.all([
          getAccount().catch(() => ({})),
          api.get('/dashboard/').then((r) => r.data).catch(() => ({})),
        ]);
        if (cancelled) return;
        setAccount((prev) => ({ ...prev, ...me }));
        setTotals(dash || {});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const username = account?.username || 'User';
  const initial = username.charAt(0).toUpperCase();
  const money = (v) => formatCurrency(num(v), currency, numberFormat);

  const facts = [
    { icon: Wallet, label: 'Currency', value: currency },
    { icon: Globe, label: 'Language and zone', value: `${language} · ${timezone}` },
    { icon: Palette, label: 'Theme', value: themeMode },
    {
      icon: Bell,
      label: 'Alerts',
      value: `${Object.values(notifications).filter(Boolean).length} of 4 enabled`,
    },
  ];

  return (
    <AppLayout title="Profile">
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Who you are on BudgetBuddy, and how your money is tracked."
        actions={
          <Button asChild variant="secondary">
            <Link to="/settings">
              <Settings2 className="size-4" /> Edit preferences
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </>
              ) : (
                <>
                  <p className="truncate text-base font-medium capitalize tracking-tight text-foreground">
                    {username}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <AtSign className="size-3.5" aria-hidden="true" />
                    {account?.email || 'No email on file'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="secondary" icon={ShieldCheck}>
              Signed in
            </Badge>
            <Badge variant="outline" icon={UserIcon}>
              {currency} account
            </Badge>
          </div>

          <ul className="mt-6 space-y-4 border-t border-hairline pt-5">
            {facts.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <f.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                    {f.label}
                  </span>
                  <span className="block truncate text-sm capitalize text-foreground">{f.value}</span>
                </span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="mt-6" block onClick={() => setConfirmLogout(true)}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Lifetime income" value={money(totals.total_income)} icon={ArrowUpRight} tone="success" loading={loading} />
            <StatCard label="Lifetime spending" value={money(totals.total_expense)} icon={Wallet} tone="destructive" loading={loading} />
            <StatCard label="Balance" value={money(totals.current_balance)} icon={PiggyBank} loading={loading} />
          </div>

          <Card className="p-5 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle>Account security</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your session is protected with short-lived access tokens that refresh silently while
                you work. Signing out revokes the refresh token on the server straight away.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Changing your username, email or password is not available in the app yet — the API
                exposes no endpoint for it.
              </p>
            </CardContent>
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

export default Profile;
