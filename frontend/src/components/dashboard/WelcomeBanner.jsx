import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** Section 1 — greeting, name, today's date and one encouraging line. */
export function WelcomeBanner({ name, message, className }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className={cn('rise min-w-0', className)}>
      <p className="eyebrow mb-1.5">{dateLabel}</p>
      <h1 className="text-2xl font-medium tracking-tight text-balance text-foreground sm:text-[1.75rem]">
        {greetingFor(now.getHours())}, {name} <span aria-hidden="true">👋</span>
      </h1>
      {message && (
        <p className="mt-2 flex max-w-[62ch] items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{message}</span>
        </p>
      )}
    </header>
  );
}
