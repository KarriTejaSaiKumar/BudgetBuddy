import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search transactions...", className = "" }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all ${className}`}>
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;
