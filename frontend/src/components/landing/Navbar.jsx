import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Wallet, X } from 'lucide-react';
import { Button, ThemeToggle } from '@/components/ui';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Features', href: '#features' },
  { name: 'Analytics', href: '#analytics' },
  { name: 'About', href: '#about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled ? 'glass shadow-[var(--shadow-sm)]' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <Wallet className="size-4.5" />
          </span>
          <span className="truncate text-base font-semibold tracking-tight text-foreground">BudgetBuddy</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
            >
              {l.name}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/register">Get Started</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-xl text-foreground transition-colors duration-200 hover:bg-accent md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass border-t border-hairline px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors duration-200 hover:bg-accent"
              >
                {l.name}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" onClick={() => setOpen(false)}>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}