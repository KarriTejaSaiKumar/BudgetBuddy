import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import heroImg from '../../assets/hero.png';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

const HeroSection = () => {
  const { isDark } = useTheme();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-6 md:px-16">
      {/* Background Ambient Glow Effects */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/15 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold text-orange-500 mb-8 backdrop-blur-md transition-all duration-300 ${
          isDark ? 'bg-[#181818] border-[#262626]' : 'bg-orange-50 border-orange-200 shadow-xs'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Personal Finance Telemetry & Multi-Currency Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.12] mb-6">
          Take Control of Your <span className="text-orange-500 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">Financial Future.</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-lg md:text-xl max-w-3xl mb-10 leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Track income, manage expenses, create budgets, monitor savings, and make smarter financial decisions with one intelligent platform.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link to="/register" className="w-full sm:w-auto">
            <PrimaryButton className="w-full sm:w-auto px-9 py-4 text-base font-semibold shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40" icon={ArrowRight}>
              Get Started
            </PrimaryButton>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <SecondaryButton className="w-full sm:w-auto px-9 py-4 text-base font-semibold">
              Learn More
            </SecondaryButton>
          </a>
        </div>

        {/* UI Mockup Illustration */}
        <div className={`w-full max-w-5xl rounded-2xl p-3 border shadow-2xl transition-all duration-300 relative group ${
          isDark ? 'bg-[#181818] border-[#262626] shadow-orange-500/10' : 'bg-white border-slate-200 shadow-slate-300'
        }`}>
          <div className="overflow-hidden rounded-xl">
            <img
              src={heroImg}
              alt="BudgetBuddy Financial Dashboard Preview"
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Trust Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl">
          {[
            { label: 'Real-time Telemetry', val: 'Instant Updates' },
            { label: 'Multi-Currency', val: '8 ISO Codes' },
            { label: 'Security Standard', val: 'JWT Protected' },
            { label: 'Dual Mode Support', val: 'Dark & Light' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border text-center transition-all duration-300 ${
              isDark ? 'bg-[#181818]/70 border-[#262626]' : 'bg-white/80 border-slate-200 shadow-2xs'
            }`}>
              <div className="text-xl font-extrabold text-orange-500">{item.val}</div>
              <div className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
