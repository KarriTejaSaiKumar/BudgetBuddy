import React from 'react';

/**
 * Ambient landing backdrop: soft blurred gradient washes, a faint grid,
 * a few specks of light, and abstract financial objects (coins, currency
 * marks, notes, card shapes) floating far behind the glass. Everything
 * sits at 8–12% opacity with 10–20px blur and drifts very slowly.
 */

const coins = [
  { top: '12%', left: '6%', size: 150, blur: 16, opacity: 0.1, duration: 30, x: 16, y: -22, rot: -8 },
  { top: '58%', left: '78%', size: 190, blur: 18, opacity: 0.09, duration: 38, x: -20, y: 18, rot: 6 },
  { top: '150%', left: '14%', size: 120, blur: 14, opacity: 0.1, duration: 33, x: 14, y: 20, rot: 10 },
  { top: '236%', left: '82%', size: 160, blur: 18, opacity: 0.08, duration: 41, x: -14, y: -20, rot: -6 },
];

const marks = [
  { symbol: '₹', top: '30%', left: '46%', size: 190, blur: 12, opacity: 0.1, duration: 34, x: -18, y: -14 },
  { symbol: '$', top: '96%', left: '9%', size: 150, blur: 12, opacity: 0.09, duration: 29, x: 16, y: -18 },
  { symbol: '€', top: '128%', left: '70%', size: 170, blur: 14, opacity: 0.08, duration: 36, x: -12, y: 22 },
  { symbol: '£', top: '196%', left: '24%', size: 140, blur: 12, opacity: 0.09, duration: 31, x: 18, y: 16 },
  { symbol: '¥', top: '272%', left: '58%', size: 180, blur: 14, opacity: 0.08, duration: 39, x: -16, y: -18 },
];

const notes = [
  { top: '74%', left: '62%', w: 260, h: 132, blur: 16, opacity: 0.09, duration: 35, rot: -12, x: -18, y: 16 },
  { top: '176%', left: '8%', w: 220, h: 112, blur: 14, opacity: 0.08, duration: 40, rot: 9, x: 20, y: -14 },
  { top: '256%', left: '30%', w: 240, h: 120, blur: 16, opacity: 0.08, duration: 33, rot: -6, x: 12, y: 20 },
];

const cards = [
  { top: '44%', left: '20%', w: 250, h: 158, blur: 14, opacity: 0.1, duration: 37, rot: -10, x: 16, y: -18 },
  { top: '210%', left: '66%', w: 230, h: 146, blur: 16, opacity: 0.09, duration: 32, rot: 8, x: -18, y: 18 },
];

const sparks = [
  { top: '18%', left: '38%', size: 3, duration: 22 },
  { top: '64%', left: '88%', size: 2, duration: 27 },
  { top: '112%', left: '18%', size: 3, duration: 25 },
  { top: '168%', left: '52%', size: 2, duration: 30 },
  { top: '224%', left: '12%', size: 3, duration: 26 },
  { top: '288%', left: '84%', size: 2, duration: 29 },
];

const drift = ({ duration, x = 14, y = -16, rot = 0, spin = 3 }) => ({
  '--drift-duration': `${duration}s`,
  '--drift-x': `${x}px`,
  '--drift-y': `${y}px`,
  '--drift-rot': `${rot}deg`,
  '--drift-spin': `${spin}deg`,
});

export default function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft blurred gradients */}
      <div className="absolute -top-40 left-[-10%] size-[42rem] rounded-full bg-[var(--aurora-1)] blur-[140px]" />
      <div className="absolute right-[-12%] top-[8%] size-[34rem] rounded-full bg-[var(--aurora-2)] blur-[150px]" />
      <div className="absolute bottom-[-18%] left-[24%] size-[40rem] rounded-full bg-[var(--aurora-1)] blur-[160px]" />

      {/* Very subtle light reflection across the top */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--color-hairline)] to-transparent" />

      {/* Faint grid for structure */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--color-hairline) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />

      {/* Floating financial objects, absolutely placed against the page height */}
      <div className="absolute inset-x-0 top-0 h-[300vh]">
        {coins.map((c, i) => (
          <span
            key={`coin-${i}`}
            className="drift absolute rounded-full"
            style={{
              ...drift(c),
              top: c.top,
              left: c.left,
              width: c.size,
              height: c.size,
              opacity: c.opacity,
              filter: `blur(${c.blur}px)`,
              background:
                'radial-gradient(circle at 32% 28%, var(--color-foreground) 0%, transparent 58%), radial-gradient(circle at 70% 76%, var(--color-primary) 0%, transparent 62%)',
              boxShadow: 'inset 0 0 0 6px var(--color-foreground)',
            }}
          />
        ))}

        {marks.map((m, i) => (
          <span
            key={`mark-${i}`}
            className="drift absolute font-semibold leading-none text-foreground"
            style={{
              ...drift({ ...m, spin: 2 }),
              top: m.top,
              left: m.left,
              fontSize: m.size,
              opacity: m.opacity,
              filter: `blur(${m.blur}px)`,
            }}
          >
            {m.symbol}
          </span>
        ))}

        {notes.map((n, i) => (
          <span
            key={`note-${i}`}
            className="drift absolute rounded-xl"
            style={{
              ...drift(n),
              top: n.top,
              left: n.left,
              width: n.w,
              height: n.h,
              opacity: n.opacity,
              filter: `blur(${n.blur}px)`,
              background: 'linear-gradient(135deg, var(--color-foreground) 0%, transparent 70%)',
              boxShadow: 'inset 0 0 0 4px var(--color-foreground)',
            }}
          />
        ))}

        {cards.map((c, i) => (
          <span
            key={`card-${i}`}
            className="drift absolute rounded-2xl"
            style={{
              ...drift(c),
              top: c.top,
              left: c.left,
              width: c.w,
              height: c.h,
              opacity: c.opacity,
              filter: `blur(${c.blur}px)`,
              background:
                'linear-gradient(120deg, var(--color-primary) 0%, transparent 55%), linear-gradient(300deg, var(--color-foreground) 0%, transparent 60%)',
              boxShadow: 'inset 0 0 0 3px var(--color-foreground)',
            }}
          />
        ))}

        {sparks.map((s, i) => (
          <span
            key={`spark-${i}`}
            className="drift absolute rounded-full bg-foreground"
            style={{
              ...drift({ duration: s.duration, x: 8, y: -24, spin: 0 }),
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: 0.12,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>
    </div>
  );
}