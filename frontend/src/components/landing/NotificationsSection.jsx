import React from 'react';
import { AlertTriangle, BellRing, CheckCircle2, FileText, PiggyBank } from 'lucide-react';
import Reveal from './Reveal';

const items = [
  {
    icon: AlertTriangle,
    tone: 'bg-warning/10 text-warning',
    title: 'Budget limit reached',
    body: 'Dining has used 96% of its ₹6,000 monthly budget.',
    time: '2m ago',
  },
  {
    icon: FileText,
    tone: 'bg-primary-soft text-primary',
    title: 'Monthly report ready',
    body: 'Your September summary is available to download.',
    time: '1h ago',
  },
  {
    icon: PiggyBank,
    tone: 'bg-info/10 text-info',
    title: 'Savings goal progress',
    body: 'Emergency fund crossed 68% of its ₹1,00,000 target.',
    time: 'Yesterday',
  },
  {
    icon: CheckCircle2,
    tone: 'bg-success/10 text-success',
    title: 'Income recorded',
    body: 'Freelance project of ₹6,000 was added to September.',
    time: '2 days ago',
  },
];

export default function NotificationsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <Reveal className="min-w-0">
          <p className="eyebrow">Notifications</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Told early, not told often.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            BudgetBuddy speaks up when a budget is close to its edge, when a report is ready, or when a goal
            moves forward. Everything else stays quiet.
          </p>
          <span className="glass mt-8 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-muted-foreground">
            <BellRing className="size-3.5 text-primary" />
            Delivered in-app, grouped by day
          </span>
        </Reveal>

        <div className="min-w-0 space-y-3">
          {items.map((n, i) => (
            <Reveal key={n.title} delay={i * 60}>
              <div className="glass flex items-start gap-3.5 rounded-2xl p-4 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${n.tone}`}>
                  <n.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}