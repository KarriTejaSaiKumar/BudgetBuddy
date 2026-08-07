import React from 'react';

const PrimaryButton = ({ children, onClick, type = "button", disabled = false, className = "", icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-primary/90 hover:shadow-sm active:translate-y-px disabled:pointer-events-none disabled:opacity-45 ${className}`}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
