import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Reveal from './Reveal';

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <Reveal from="none">
        <div className="glass relative overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-[var(--shadow-lg)] sm:px-12 sm:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-40%] size-[32rem] -translate-x-1/2 rounded-full bg-[var(--aurora-1)] blur-[120px]"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              Take Control of Your Financial Future.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              BudgetBuddy helps you stay organized, understand your spending, and build better financial
              habits.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}