import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Brain, Compass, Target, ShieldCheck, Zap } from 'lucide-react';

const BenefitsSection = () => {
  const { isDark } = useTheme();

  const benefits = [
    {
      icon: Eye,
      title: 'Better Financial Visibility',
      description: 'Gain 360-degree real-time clarity into your net worth, total income streams, and month-to-date spending.',
    },
    {
      icon: Brain,
      title: 'Smarter Spending Habits',
      description: 'Identify impulse purchases and recurring waste so you can redirect funds toward wealth building.',
    },
    {
      icon: Compass,
      title: 'Easy Budgeting',
      description: 'Create zero-based or category budgets in under 2 minutes with automated threshold alerts.',
    },
    {
      icon: Target,
      title: 'Financial Goal Tracking',
      description: 'Set custom targets for emergency funds, vacations, or debt payoff and monitor percentage progress.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Cloud-Ready Architecture',
      description: 'Protected with industry-standard JWT authentication and strict multi-tenant data isolation.',
    },
    {
      icon: Zap,
      title: 'Fast & Intuitive Experience',
      description: 'Sub-second page loads, zero clutter, instant search, and zero learning curve.',
    },
  ];

  return (
    <section id="benefits" className="py-20 px-6 md:px-16 scroll-mt-20 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Why Choose BudgetBuddy</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Designed to Transform Your Financial Health
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Experience the peace of mind that comes with complete visibility and effortless organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:border-orange-500/40 ${
                  isDark 
                    ? 'bg-[#181818] border-[#262626] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold mb-2">{benefit.title}</h4>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
