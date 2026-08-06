import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Rocket, Mail, Shield, Phone, MapPin, Globe, Share2, Code } from 'lucide-react';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t transition-colors duration-300 ${
      isDark ? 'border-[#262626] bg-[#0A0A0A] text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
    }`}>
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white dark:text-white">
                Budget<span className="text-orange-500">Buddy</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed">
              Personal Budget Planning & Expense Management Platform. Track your income, expenses, budgets, and financial health in one place.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[#262626] hover:text-orange-500 transition" aria-label="GitHub Repository">
                <Code className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[#262626] hover:text-orange-500 transition" aria-label="Twitter Social">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://budgetbuddy.finance" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[#262626] hover:text-orange-500 transition" aria-label="Official Website">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-orange-500 transition">Features Overview</a></li>
              <li><a href="#benefits" className="hover:text-orange-500 transition">Platform Benefits</a></li>
              <li><a href="#how-it-works" className="hover:text-orange-500 transition">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-orange-500 transition">Pricing Plans</a></li>
              <li><Link to="/login" className="hover:text-orange-500 transition">Account Sign In</Link></li>
            </ul>
          </div>

          {/* Legal & Docs */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Documentation & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#docs" onClick={(e) => e.preventDefault()} className="hover:text-orange-500 transition">Documentation</a></li>
              <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-orange-500 transition">Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-orange-500 transition">Terms of Service</a></li>
              <li><a href="#security" onClick={(e) => e.preventDefault()} className="hover:text-orange-500 transition">Security Protocol</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Contact Information
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@budgetbuddy.finance</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+1 (800) 555-BUDGET</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Financial District, Suite 400</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
          isDark ? 'border-[#262626] text-slate-500' : 'border-slate-200 text-slate-500'
        }`}>
          <div>BudgetBuddy &copy; {new Date().getFullYear()} — Personal Budget Planning & Expense Management Platform</div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>JWT Secured • Multi-Currency Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
