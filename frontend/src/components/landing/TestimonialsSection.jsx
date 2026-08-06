import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const { isDark } = useTheme();

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Senior Product Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      comment: 'BudgetBuddy completely eliminated my financial anxiety. Setting up category budgets took 2 minutes, and the NASA orange dashboard is a joy to use every morning.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Software Architect & Freelancer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      comment: 'The multi-currency formatting and instant monthly analytics give me complete visibility into my consulting income across USD and EUR streams.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Financial Analyst',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      comment: 'I appreciate the clean, enterprise-grade architecture. No bloated ads or popups—just pure data telemetry and intelligent budget tracking.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">User Feedback</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Loved by Financial Professionals Worldwide
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Discover how thousands of users take control of their budgets with BudgetBuddy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:border-orange-500/40 ${
                isDark ? 'bg-[#181818] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-orange-500/20" />
                </div>
                <p className={`text-sm leading-relaxed mb-6 italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-orange-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
