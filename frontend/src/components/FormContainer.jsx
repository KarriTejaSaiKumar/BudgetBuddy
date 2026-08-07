import React from 'react';
import { X } from 'lucide-react';

const FormContainer = ({ title, subtitle, onClose, children, className = "" }) => {
  return (
    <div className={`rounded-2xl bg-card p-6 shadow-[0_0_0_1px_var(--color-hairline)] sm:p-7 ${className}`}>
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-hairline pb-4">
        <div className="min-w-0">
          <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default FormContainer;
