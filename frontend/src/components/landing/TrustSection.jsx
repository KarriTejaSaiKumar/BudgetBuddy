import React from 'react';
import { Boxes, LayoutTemplate, LineChart, MonitorSmartphone, SunMoon } from 'lucide-react';
import Reveal from './Reveal';
import { AnimatedNumber } from '@/components/ui';

const stats = [
  { icon: LayoutTemplate, value: 9, suffix: '', label: 'Core features', note: 'Income to reports' },
  { icon: Boxes, value: 8, suffix: '', label: 'Backend modules', note: 'Django REST services' },
  { icon: LineChart, value: null, label: 'Real-time analytics', note: 'Server-computed insight' },
  { icon: MonitorSmartphone, value: null, label: 'Responsive design', note: 'Desktop, tablet, mobile' },
  { icon: SunMoon, value: null, label: 'Dark & light theme', note: 'Equally considered' },
];

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <Reveal>
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Built end to end
        </p>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 50}>
            <div className="glass h-full rounded-2xl p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
              <s.icon className="size-5 text-primary" />
              {s.value !== null ? (
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  <AnimatedNumber value={s.value} format={(v) => `${Math.round(v)}+`} />
                </p>
              ) : (
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Included</p>
              )}
              <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}