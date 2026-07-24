import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  PieChart,
  BarChart2,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Analytics', path: '/reports', icon: BarChart2 },
    { name: 'Profile Settings', path: '/settings', icon: Sliders },
  ];

  return (
    <aside
      className={`bg-slate-900 dark:bg-[#0A0A0A] border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col justify-between relative z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
                Budget<span className="text-orange-500">Buddy</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer / Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
