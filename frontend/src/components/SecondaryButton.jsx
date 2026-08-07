import React from 'react';

const SecondaryButton = ({ children, onClick, type = "button", disabled = false, className = "", icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface px-4 text-sm font-medium text-foreground shadow-[0_0_0_1px_var(--color-hairline)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-accent hover:shadow-[0_0_0_1px_var(--color-border)] active:translate-y-px disabled:pointer-events-none disabled:opacity-45 ${className}`}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default SecondaryButton;
