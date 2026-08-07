import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  PieChart,
  FileText,
  Settings2,
  LogOut,
  ChevronDown,
  PiggyBank,
  BarChart2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationsPanel from './NotificationsPanel';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui';
import { cn } from '@/lib/utils';

const destinations = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, hint: 'Balance, budgets, trends' },
  { name: 'Income', path: '/income', icon: TrendingUp, hint: 'Log and review earnings' },
  { name: 'Expenses', path: '/expenses', icon: CreditCard, hint: 'Everything you spent' },
  { name: 'Budgets', path: '/budgets', icon: PieChart, hint: 'Monthly category limits' },
  { name: 'Savings', path: '/savings', icon: PiggyBank, hint: 'Goals and progress' },
  { name: 'Analytics', path: '/analytics', icon: BarChart2, hint: 'Trends and insights' },
  { name: 'Reports', path: '/reports', icon: FileText, hint: 'Exportable summaries' },
  { name: 'Notifications', path: '/notifications', icon: Bell, hint: 'Alerts and reminders' },
  { name: 'Profile', path: '/profile', icon: User, hint: 'Your account details' },
  { name: 'Settings', path: '/settings', icon: Settings2, hint: 'Currency, format, theme' },
];

/**
 * Top chrome: quick-jump search, notifications, theme, account.
 * Frosted and hairline-edged so it dissolves into the canvas when scrolling.
 */
const Header = ({ title = 'Dashboard', setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { currency } = useFinancialPreferences();
  const {
    items: notifications,
    unread,
    loading: notificationsLoading,
    read,
    readAll,
    remove,
  } = useNotifications();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [openResults, setOpenResults] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef(null);
  const wrapRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) => d.name.toLowerCase().includes(q) || d.hint.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setOpenResults(true);
      }
      if (e.key === 'Escape') setOpenResults(false);
    };
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenResults(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const go = (path) => {
    setOpenResults(false);
    setQuery('');
    searchRef.current?.blur();
    navigate(path);
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-3 rounded-none px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setMobileOpen?.(true)}
            aria-label="Open navigation"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="size-4.5" />
          </button>
          <h1 className="truncate text-sm font-medium tracking-tight text-foreground">{title}</h1>
          <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:inline-flex">
            {currency}
          </span>
        </div>

        {/* Quick jump */}
        <div ref={wrapRef} className="relative hidden max-w-sm flex-1 md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onFocus={() => setOpenResults(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenResults(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) go(results[0].path);
            }}
            placeholder="Search BudgetBuddy…"
            aria-label="Search BudgetBuddy"
            className={cn(
              'h-9 w-full rounded-full bg-secondary/70 pl-9 pr-14 text-sm text-foreground',
              'placeholder:text-muted-foreground transition-colors',
              'focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              '[&::-webkit-search-cancel-button]:hidden',
            )}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground lg:block">
            ⌘K
          </kbd>

          {openResults && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl bg-popover p-1.5 shadow-lg shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-lg)]">
              {results.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground">No matches.</p>
              ) : (
                results.map((d) => (
                  <button
                    key={d.path}
                    onClick={() => go(d.path)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <d.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                        {d.name}
                      </span>
                      <span className="block truncate text-[0.6875rem] text-muted-foreground">
                        {d.hint}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setNotifOpen(true)}
            aria-label={unread ? `Notifications, ${unread} needing attention` : 'Notifications'}
            title="Notifications"
            className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive shadow-[0_0_0_2px_var(--color-background)]" />
            )}
          </button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-accent">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[0.6875rem] font-semibold text-primary-foreground">
                  {initial}
                </span>
                <span className="hidden max-w-[9rem] truncate text-xs font-medium capitalize text-foreground sm:block">
                  {user?.username || 'User'}
                </span>
                <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <div className="px-2.5 pb-2">
                <p className="truncate text-sm font-medium capitalize text-foreground">
                  {user?.username || 'User'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/profile')}>
                <User /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Settings2 /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/reports')}>
                <FileText /> Reports
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => logout()}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile search sits under the bar so the chrome stays uncluttered */}
      <div className="glass sticky top-16 z-20 rounded-none px-4 py-2.5 md:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) go(results[0].path);
            }}
            placeholder="Jump to…"
            aria-label="Search BudgetBuddy"
            className="h-9 w-full rounded-full bg-secondary/70 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:bg-surface focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </div>

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        unread={unread}
        loading={notificationsLoading}
        onRead={read}
        onReadAll={readAll}
        onRemove={remove}
      />
    </>
  );
};

export default Header;
