import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Button, AnimatedNumber } from '@/components/ui';
import AppMockup from './AppMockup';
import Reveal from './Reveal';
import { cn } from '@/lib/utils';

const inr = (v) =>
  `₹${Math.round(v).toLocaleString('en-IN')}`;

function FloatCard({ label, value, icon: Icon, tone, className, style, suffix }) {
  return (
    <div
      className={cn('glass hover-float rounded-2xl px-4 py-3 shadow-[var(--shadow-md)]', className)}
      style={style}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="money truncate text-sm font-semibold text-foreground">
            <AnimatedNumber value={value} format={suffix ? (v) => `${Math.round(v)}%` : inr} />
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        {/* Left */}
        <div className="min-w-0">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              One platform for every rupee you earn and spend
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
              Manage Your Money
              <br className="hidden sm:block" /> With Confidence.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Track income, monitor expenses, plan budgets, achieve savings goals, and understand your
              finances through one beautifully designed platform.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Right */}
        <Reveal delay={120} from="none" className="relative min-w-0">
          <div className="relative mx-auto max-w-xl px-3 sm:px-8 lg:mx-0 lg:px-0">
            <AppMockup />

            {/* Floating glass cards */}
            <FloatCard
              label="Current balance"
              value={142860}
              icon={Wallet}
              tone="bg-primary-soft text-primary"
              className="absolute -left-2 -top-6 w-48 sm:-left-8 lg:-left-16"
              style={{ '--hover-duration': '9s', '--hover-y': '-8px' }}
            />
            <FloatCard
              label="Monthly income"
              value={64200}
              icon={TrendingUp}
              tone="bg-success/10 text-success"
              className="absolute -right-2 top-16 hidden w-48 sm:block sm:-right-8 lg:-right-14"
              style={{ '--hover-duration': '11s', '--hover-y': '-10px' }}
            />
            <FloatCard
              label="Monthly expenses"
              value={21340}
              icon={TrendingDown}
              tone="bg-destructive/10 text-destructive"
              className="absolute -left-2 bottom-24 hidden w-48 sm:block sm:-left-8 lg:-left-16"
              style={{ '--hover-duration': '10s', '--hover-y': '-7px' }}
            />
            <FloatCard
              label="Savings progress"
              value={68}
              suffix
              icon={PiggyBank}
              tone="bg-info/10 text-info"
              className="absolute -right-2 bottom-6 w-48 sm:-right-8 lg:-right-14"
              style={{ '--hover-duration': '12s', '--hover-y': '-9px' }}
            />
            <FloatCard
              label="Budget remaining"
              value={8450}
              icon={Wallet}
              tone="bg-warning/10 text-warning"
              className="absolute left-1/2 -bottom-8 hidden w-48 -translate-x-1/2 lg:block"
              style={{ '--hover-duration': '13s', '--hover-y': '-6px' }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}