import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity" />

      <div
        className={`relative z-10 w-full ${maxWidth} animate-in fade-in zoom-in-95 space-y-5 rounded-2xl bg-popover p-6 text-popover-foreground shadow-lg shadow-[0_0_0_1px_var(--color-hairline)] duration-200`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
          <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
