import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown } from 'lucide-react';

const FaqSection = () => {
  const { isDark } = useTheme();
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Is BudgetBuddy safe and secure for tracking my personal financial records?',
      a: 'Yes, BudgetBuddy uses industry-standard JSON Web Token (JWT) authentication, encrypted passwords, and multi-tenant user data isolation. Your financial records are private and accessible only by you.',
    },
    {
      q: 'How does the Multi-Currency and Financial Preferences system work?',
      a: 'Inside your Profile & Preferences Settings, you can choose your preferred currency ISO code (INR ₹, USD $, EUR €, GBP £, JPY ¥, CAD, AUD, SGD), date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD), and number format (Indian 1,00,000 or International 100,000). All figures update automatically across your dashboard.',
    },
    {
      q: 'Can I set monthly budgets for specific expense categories?',
      a: 'Absolutely! You can create custom budgets for categories like Groceries, Rent, Entertainment, and Utilities. BudgetBuddy highlights your progress and alerts you if a category exceeds its threshold.',
    },
    {
      q: 'Can I export my income and expense reports to CSV files?',
      a: 'Yes! The Analytics & Reports page allows you to view detailed transaction statements and download one-click CSV financial reports for accounting or tax preparation.',
    },
    {
      q: 'Does BudgetBuddy support both Light Mode and Dark Mode?',
      a: 'Yes, BudgetBuddy features an instant theme switching engine. Click the Sun/Moon icon in the top navigation header anytime to toggle between NASA-inspired Dark Mode and clean enterprise Light Mode.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-6 md:px-16 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Got Questions?</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h3>
          <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Everything you need to know about BudgetBuddy platform, security, and features.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isDark
                    ? 'bg-[#181818] border-[#262626]'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-bold text-base md:text-lg">{faq.q}</span>
                  <div className={`p-1.5 rounded-lg border transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-orange-500 border-orange-500/30' : 'text-slate-400 border-transparent'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className={`px-6 pb-6 pt-1 text-sm leading-relaxed border-t animate-in fade-in duration-200 ${
                    isDark ? 'border-[#262626] text-slate-300' : 'border-slate-100 text-slate-600'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
