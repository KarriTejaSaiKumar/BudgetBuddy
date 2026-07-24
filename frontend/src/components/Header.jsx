import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { Sun, Moon, Monitor, User, LogOut, Bell } from 'lucide-react';

const Header = ({ title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, activeTheme, toggleTheme } = useTheme();
  const { currency } = useFinancialPreferences();

  return (
    <header className="h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider">
          {currency} Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Instant Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer flex items-center gap-1.5"
          title={`Switch to ${activeTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle theme"
        >
          {activeTheme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-700" />
          )}
        </button>

        {/* Notifications Icon (Future Ready) */}
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Account Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight capitalize">{user?.username || 'User'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Logout Quick Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
