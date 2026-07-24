import React from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { Rocket, ArrowRight, ShieldCheck, TrendingUp, PieChart, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Header Navigation */}
      <header className="px-6 md:px-16 py-6 flex items-center justify-between border-b border-[#262626] backdrop-blur-md sticky top-0 z-50 bg-[#0B0B0B]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            BudgetBuddy
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <SecondaryButton>Sign In</SecondaryButton>
          </Link>
          <Link to="/register">
            <PrimaryButton icon={ArrowRight}>Get Started</PrimaryButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto relative overflow-hidden">
        {/* Glow Effects Background */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181818] border border-[#262626] text-xs font-medium text-orange-400 mb-8 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" />
          <span>Enterprise Personal Financial Telemetry</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight mb-6">
          Take Complete Control of Your <span className="text-orange-500">Money & Budget</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
          Effortlessly track income, analyze expenses, set category budgets, and prevent overspending with real-time financial analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <PrimaryButton className="w-full sm:w-auto px-8 py-3.5 text-sm" icon={ArrowRight}>
              Create Free Account
            </PrimaryButton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <SecondaryButton className="w-full sm:w-auto px-8 py-3.5 text-sm">
              Sign In to Dashboard
            </SecondaryButton>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626] backdrop-blur-md hover:border-orange-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Income & Expenses</h3>
            <p className="text-sm text-slate-400">Log transactions quickly with custom categorization, filtering, and flexible sorting options.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626] backdrop-blur-md hover:border-orange-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Budgeting</h3>
            <p className="text-sm text-slate-400">Set monthly category spending limits and monitor remaining budgets with automated overspent alerts.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626] backdrop-blur-md hover:border-orange-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">JWT Protection</h3>
            <p className="text-sm text-slate-400">Secured with JSON Web Token authentication and multi-tenant user data isolation.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-[#262626] text-xs text-slate-500">
        BudgetBuddy &copy; {new Date().getFullYear()} — Enterprise Personal Finance Dashboard
      </footer>
    </div>
  );
};

export default Home;
