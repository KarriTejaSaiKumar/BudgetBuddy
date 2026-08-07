import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/ui';
import LandingBackground from './LandingBackground';
import AppMockup from './AppMockup';
import Reveal from './Reveal';

const highlights = [
  'Income, expenses, budgets and savings in one place',
  'Real-time analytics computed from your own data',
  'Exportable monthly reports and smart notifications',
];

/**
 * Split authentication layout: showcase on the left, glass form card on the right.
 * Purely presentational — pages keep their own auth logic.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen text-foreground">
      <LandingBackground />

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Showcase */}
        <Reveal className="hidden min-w-0 lg:block">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Wallet className="size-4.5" />
            </span>
            <span className="text-base font-semibold tracking-tight">BudgetBuddy</span>
          </Link>

          <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.02em] xl:text-4xl">
            Clarity over your money, every single day.
          </h2>

          <ul className="mt-7 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Check className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <AppMockup compact className="mt-10" />
        </Reveal>

        {/* Form */}
        <Reveal delay={60} className="mx-auto w-full max-w-md">
          <div className="glass rounded-[1.75rem] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Wallet className="size-4.5" />
              </span>
              <span className="text-base font-semibold tracking-tight">BudgetBuddy</span>
            </Link>

            <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

            <div className="mt-7">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
        </Reveal>
      </div>
    </div>
  );
}