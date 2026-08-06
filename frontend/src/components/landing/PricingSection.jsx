import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

const PricingSection = () => {
  const { isDark } = useTheme();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for individuals getting started with personal budget tracking.',
      features: [
        'Up to 50 Income & Expense Logs/mo',
        'Basic Category Budgeting',
        'Monthly Summary Statistics',
        'Single Currency Support (USD)',
        'Standard Community Support',
      ],
      highlight: false,
      cta: 'Get Started Free',
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      desc: 'Ideal for professionals seeking total financial telemetry & multi-currency.',
      features: [
        'Unlimited Transactions & Categories',
        'Smart Overspent Threshold Alerts',
        '8 Multi-Currency ISO Codes',
        'Indian & International Number Formats',
        'Export CSV Monthly Statements',
        'Priority Technical Support',
      ],
      highlight: true,
      cta: 'Start Pro Trial',
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      period: 'per month',
      desc: 'Designed for high-net-worth individuals, business owners, and teams.',
      features: [
        'Everything in Pro',
        'Multi-Tenant Family/Team Access',
        'Dedicated Financial Advisor Integrations',
        'Custom Data Retention & API Access',
        '24/7 Dedicated Account Support',
      ],
      highlight: false,
      cta: 'Contact Sales',
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 md:px-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Transparent Pricing</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Simple Plans for Every Financial Journey
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Choose the plan that best aligns with your personal or business financial goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight
                  ? isDark
                    ? 'bg-[#181818] border-orange-500 shadow-2xl shadow-orange-500/10 scale-105 z-10'
                    : 'bg-white border-orange-500 shadow-2xl shadow-orange-500/15 scale-105 z-10'
                  : isDark
                  ? 'bg-[#181818]/60 border-[#262626]'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold tracking-wide uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/{plan.period}</span>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlight ? 'bg-orange-500 text-white' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/register">
                {plan.highlight ? (
                  <PrimaryButton className="w-full justify-center py-3 text-sm font-semibold shadow-lg shadow-orange-500/20" icon={ArrowRight}>
                    {plan.cta}
                  </PrimaryButton>
                ) : (
                  <SecondaryButton className="w-full justify-center py-3 text-sm font-semibold">
                    {plan.cta}
                  </SecondaryButton>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
