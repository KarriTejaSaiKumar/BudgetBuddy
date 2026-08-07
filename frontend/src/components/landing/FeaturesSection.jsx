import React from 'react';
import { BarChart3, PiggyBank, Receipt, Wallet } from 'lucide-react';
import Reveal from './Reveal';

const features = [
  {
    icon: Receipt,
    title: 'Expense Management',
    description:
      'Log every spend with category, payment method and notes, then search, filter and sort your history in seconds.',
  },
  {
    icon: Wallet,
    title: 'Budget Planning',
    description:
      'Set monthly limits per category and watch utilisation update live, with clear on-track and over-budget states.',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    description:
      'Define a target and a deadline, contribute as you go, and see exactly how far along each goal really is.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Category breakdowns, monthly trends and exportable reports that turn raw transactions into decisions.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Features</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Everything your money needs, nothing it doesn&apos;t.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Four focused modules that work together, so the whole picture stays one click away.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <article className="group glass h-full rounded-2xl p-6 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] sm:p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-105">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}