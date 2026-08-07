import React from 'react';
import AppMockup from './AppMockup';
import Reveal from './Reveal';

const labels = [
  { text: 'Analytics', className: 'hidden lg:block -left-12 top-16' },
  { text: 'Reports', className: 'hidden lg:block -right-10 top-24' },
  { text: 'Notifications', className: 'hidden lg:block -right-14 bottom-40' },
  { text: 'Savings', className: 'hidden lg:block -left-14 bottom-28' },
  { text: 'Budgets', className: 'left-1/2 -bottom-4 -translate-x-1/2' },
];

export default function ShowcaseSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">The product</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          One calm surface for your whole financial life.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Every module shares the same layout, the same language and the same rhythm — so nothing ever
          feels like a different app.
        </p>
      </Reveal>

      <Reveal delay={80} from="none" className="relative mx-auto mt-14 max-w-4xl lg:px-0">
        <div className="relative">
          <AppMockup />
          {labels.map((l, i) => (
            <span
              key={l.text}
              className={`glass hover-float absolute rounded-full px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-sm)] ${l.className}`}
              style={{ '--hover-duration': `${9 + i}s`, '--hover-y': '-6px' }}
            >
              {l.text}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}