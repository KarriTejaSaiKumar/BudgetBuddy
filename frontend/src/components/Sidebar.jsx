import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  PieChart,
  PiggyBank,
  BarChart2,
  FileText,
  Bell,
  UserRound,
  Settings2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';

/**
 * Navigation is grouped so the rail reads as a product, not a link dump:
 * "Money" is the daily loop, "Insight" is the weekly review, "You" is setup.
 */
const navGroups = [
  {
    label: 'Money',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Income', path: '/income', icon: TrendingUp },
      { name: 'Expenses', path: '/expenses', icon: CreditCard },
      { name: 'Budgets', path: '/budgets', icon: PieChart },
      { name: 'Savings', path: '/savings', icon: PiggyBank },
    ],
  },
  {
    label: 'Insight',
    items: [
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'You',
    items: [
      { name: 'Profile', path: '/profile', icon: UserRound },
      { name: 'Settings', path: '/settings', icon: Settings2 },
    ],
  },
];

const itemBase = [
  'group relative flex items-center gap-3 rounded-xl py-2.5 text-[0.8125rem] font-medium',
  'transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
].join(' ');

const Sidebar = ({ collapsed = false, setCollapsed, mobileOpen = false, setMobileOpen }) => {
  const { logout } = useAuth();

  const Nav = ({ showLabels }) => (
    <nav className="flex flex-col gap-5 px-3" aria-label="Primary">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p
            className={cn(
              'mb-1.5 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70',
              'transition-opacity duration-200',
              showLabels ? 'opacity-100' : 'sr-only',
            )}
          >
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen?.(false)}
                title={showLabels ? undefined : item.name}
                className={({ isActive }) =>
                  cn(
                    itemBase,
                    showLabels ? 'px-3' : 'justify-center px-0',
                    isActive
                      ? 'bg-primary-soft text-foreground shadow-[inset_0_0_0_1px_var(--color-hairline)]'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full bg-primary',
                        'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isActive ? 'h-5 opacity-100' : 'h-0 opacity-0',
                      )}
                    />
                    <item.icon
                      className={cn('size-[1.125rem] shrink-0', isActive && 'text-primary')}
                      strokeWidth={isActive ? 2.3 : 1.9}
                      aria-hidden="true"
                    />
                    {showLabels && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = ({ showLabels }) => (
    <div className={cn('flex h-16 items-center gap-3 px-5', !showLabels && 'justify-center px-0')}>
      <span
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary shadow-[var(--shadow-glow)]"
        aria-hidden="true"
      >
        <span className="size-3.5 rounded-[4px] bg-primary-foreground" />
      </span>
      {showLabels && (
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">BudgetBuddy</span>
      )}
    </div>
  );

  const Footer = ({ showLabels }) => (
    <div className="px-3 pb-4">
      <button
        onClick={logout}
        title="Sign out"
        className={cn(
          itemBase,
          'w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
          showLabels ? 'px-3' : 'justify-center px-0',
        )}
      >
        <LogOut className="size-[1.125rem] shrink-0" strokeWidth={1.9} aria-hidden="true" />
        {showLabels && <span>Sign out</span>}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop rail — frosted glass, hairline edge, animated collapse */}
      <aside
        className={cn(
          'sticky top-0 z-40 hidden h-screen shrink-0 flex-col justify-between md:flex',
          'glass rounded-none',
          'transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-[4.75rem]' : 'w-64',
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          <Brand showLabels={!collapsed} />
          <Nav showLabels={!collapsed} />
        </div>
        <div className="shrink-0">
          <Footer showLabels={!collapsed} />
          <div className={cn('border-t border-hairline p-3', collapsed && 'flex justify-center')}>
            <button
              onClick={() => setCollapsed?.(!collapsed)}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn('fixed inset-0 z-50 md:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen?.(false)}
          className={cn(
            'absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          className={cn(
            'glass absolute inset-y-0 left-0 flex w-[17rem] flex-col justify-between rounded-none',
            'transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <div className="flex items-center justify-between pr-3">
              <Brand showLabels />
              <button
                onClick={() => setMobileOpen?.(false)}
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <Nav showLabels />
          </div>
          <Footer showLabels />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
