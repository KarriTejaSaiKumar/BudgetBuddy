import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, PieChart, PiggyBank, Plus, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating quick-create. Navigation only — it routes to the module that owns
 * the action and asks it to open its create dialog via router state, so no
 * business logic lives here.
 */
const actions = [
  { key: 'expense', label: 'Add Expense', path: '/expenses', icon: CreditCard, tone: 'text-destructive' },
  { key: 'income', label: 'Add Income', path: '/income', icon: TrendingUp, tone: 'text-success' },
  { key: 'budget', label: 'Create Budget', path: '/budgets', icon: PieChart, tone: 'text-primary' },
  { key: 'savings', label: 'Create Savings Goal', path: '/savings', icon: PiggyBank, tone: 'text-info' },
];

/** Pages that own the modals can intercept an action instead of navigating. */
export const QUICK_CREATE_EVENT = 'budgetbuddy:quick-create';

export default function QuickActionsFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const go = (action) => {
    setOpen(false);
    const handled = !window.dispatchEvent(
      new CustomEvent(QUICK_CREATE_EVENT, { detail: { key: action.key }, cancelable: true }),
    );
    if (!handled) navigate(action.path, { state: { quickCreate: true } });
  };

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 sm:bottom-7 sm:right-7"
    >
      <div
        className={cn(
          'flex flex-col items-end gap-2',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        {actions.map((action, i) => (
          <button
            key={action.path}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => go(action)}
            style={{ transitionDelay: `${open ? i * 35 : (actions.length - i) * 20}ms` }}
            className={cn(
              'glass flex items-center gap-2.5 rounded-2xl py-2.5 pl-3.5 pr-4 text-[0.8125rem] font-medium text-foreground',
              'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0',
            )}
          >
            <action.icon className={cn('size-4 shrink-0', action.tone)} aria-hidden="true" />
            {action.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        className={cn(
          'grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground',
          'shadow-[var(--shadow-glow)] backdrop-blur-xl',
          'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-110 active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <Plus
          className={cn(
            'size-6 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open && 'rotate-45',
          )}
          strokeWidth={2.2}
        />
      </button>
    </div>
  );
}
