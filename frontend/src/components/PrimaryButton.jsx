import React from 'react';

const PrimaryButton = ({ children, onClick, type = "button", disabled = false, className = "", icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
