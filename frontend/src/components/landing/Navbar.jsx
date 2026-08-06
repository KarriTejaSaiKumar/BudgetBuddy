import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { Rocket, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`px-6 md:px-16 py-4 border-b sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300 ${
      isDark ? 'border-[#262626] bg-[#0B0B0B]/90' : 'border-slate-200 bg-white/90'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Budget<span className="text-orange-500">Buddy</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`transition-colors hover:text-orange-500 ${
                isDark ? 'text-slate-300 hover:text-orange-400' : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Instant Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isDark 
                ? 'bg-[#181818] border-[#262626] text-amber-400 hover:border-amber-400/50 hover:bg-[#202020]' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link to="/login">
            <SecondaryButton>Log In</SecondaryButton>
          </Link>
          <Link to="/register">
            <PrimaryButton icon={ArrowRight}>Get Started</PrimaryButton>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border ${
              isDark ? 'bg-[#181818] border-[#262626] text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border ${
              isDark ? 'bg-[#181818] border-[#262626] text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden mt-4 pt-4 border-t space-y-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDark ? 'border-[#262626]' : 'border-slate-200'
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isDark ? 'text-slate-200 hover:bg-[#181818]' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <SecondaryButton className="w-full justify-center">Log In</SecondaryButton>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <PrimaryButton className="w-full justify-center" icon={ArrowRight}>
                Get Started
              </PrimaryButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
