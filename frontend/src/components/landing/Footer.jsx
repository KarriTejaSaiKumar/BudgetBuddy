import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Mail, Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Wallet className="size-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">BudgetBuddy</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A personal finance platform for students, graduates and young professionals.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <a className="text-muted-foreground transition-colors duration-200 hover:text-foreground" href="#about">
              Product
            </a>
            <a className="text-muted-foreground transition-colors duration-200 hover:text-foreground" href="#features">
              Features
            </a>
            <a className="text-muted-foreground transition-colors duration-200 hover:text-foreground" href="#analytics">
              Analytics
            </a>
            <Link className="text-muted-foreground transition-colors duration-200 hover:text-foreground" to="/login">
              Privacy
            </Link>
            <Link className="text-muted-foreground transition-colors duration-200 hover:text-foreground" to="/login">
              Terms
            </Link>
            <a
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Code2 className="size-3.5" />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              href="mailto:hello@budgetbuddy.app"
            >
              <Mail className="size-3.5" />
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BudgetBuddy. All rights reserved.</p>
          <p className="tabular-nums">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}