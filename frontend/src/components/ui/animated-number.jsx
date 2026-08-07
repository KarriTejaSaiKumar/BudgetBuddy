import * as React from "react";

/**
 * Count-up figure. Eases to the target over ~700ms, respects
 * prefers-reduced-motion, and hands the raw number back to `format`
 * so currency / percentage rendering stays with the caller.
 */
export function AnimatedNumber({ value = 0, format = (v) => v, duration = 700, className }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = React.useState(target);
  const fromRef = React.useRef(target);
  const frameRef = React.useRef(0);

  React.useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || fromRef.current === target) {
      fromRef.current = target;
      setDisplay(target);
      return undefined;
    }

    const from = fromRef.current;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (target - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <span className={className}>{format(display)}</span>;
}
