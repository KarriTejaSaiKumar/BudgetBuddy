import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserPlus, PlusCircle, PieChart, Activity } from 'lucide-react';

const HowItWorksSection = () => {
  const { isDark } = useTheme();

  const steps = [
    {
      num: '01',
      icon: UserPlus,
      title: 'Create an Account',
      description: 'Sign up in seconds with your email or username. Your secure personal space is instantly initialized.',
    },
    {
      num: '02',
      icon: PlusCircle,
      title: 'Record Income & Expenses',
      description: 'Log your paychecks, consulting fees, groceries, bills, and daily transactions with custom tags.',
    },
    {
      num: '03',
      icon: PieChart,
      title: 'Create Monthly Budgets',
      description: 'Set realistic spending limits per category and track your remaining balance in real time.',
    },
    {
      num: '04',
      icon: Activity,
      title: 'Monitor Reports & Health',
      description: 'Analyze visual monthly statements, export CSV records, and build lasting financial freedom.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Simple 4-Step Process</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            How BudgetBuddy Works
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Start managing your money with confidence in less than 5 minutes.
          </p>
        </div>

        {/* 4-Step Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border relative flex flex-col justify-between transition-all duration-300 hover:border-orange-500/40 ${
                  isDark ? 'bg-[#181818] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-orange-500/30">{step.num}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
