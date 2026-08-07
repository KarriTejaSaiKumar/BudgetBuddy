import React from 'react';
import { ArrowUpRight, PiggyBank, Receipt, Sprout, TrendingUp, Wallet } from 'lucide-react';
import Reveal from './Reveal';

const stages = [
  { icon: TrendingUp, title: 'Income', copy: 'Record every source as it lands.' },
  { icon: Wallet, title: 'Budget', copy: 'Give each rupee a job for the month.' },
  { icon: Receipt, title: 'Expenses', copy: 'Spend against the plan, not against guesswork.' },
  { icon: PiggyBank, title: 'Savings', copy: 'Move the surplus toward a named goal.' },
  { icon: Sprout, title: 'Financial Growth', copy: 'Compound the habit, month after month.' },
];

export default function FlowSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">The flow</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          A loop that keeps improving itself.
        </h2>
      </Reveal>

      <div className="relative mt-12">
        <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-hairline sm:block lg:left-0 lg:top-9 lg:h-px lg:w-full" />
        <ol className="grid gap-6 lg:grid-cols-5 lg:gap-4">
          {stages.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className="relative flex gap-4 lg:block">
              <span className="glass relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl text-primary shadow-[var(--shadow-sm)]">
                <s.icon className="size-5" />
              </span>
              <div className="min-w-0 lg:mt-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
                  {i < stages.length - 1 && (
                    <ArrowUpRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}