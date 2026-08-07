import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search transactions...", className = "" }) => {
  return (
    <div
      className={`flex h-9 items-center gap-2 rounded-lg bg-surface px-3 shadow-[0_0_0_1px_var(--color-hairline)] transition-shadow focus-within:shadow-[0_0_0_1px_var(--color-input),0_0_0_3px_var(--color-primary-soft)] ${className}`}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;
