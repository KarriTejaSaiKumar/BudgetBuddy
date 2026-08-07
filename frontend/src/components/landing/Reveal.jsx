import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll reveal: fade + slight slide + blur, 200ms, once.
 * Respects prefers-reduced-motion by rendering the final state immediately.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, from = 'up', className, children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: '',
  }[from];

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        shown ? 'opacity-100 blur-0 translate-x-0 translate-y-0' : cn('opacity-0 blur-[6px]', hidden),
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}