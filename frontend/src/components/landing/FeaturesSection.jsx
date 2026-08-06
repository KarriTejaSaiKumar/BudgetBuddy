import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  TrendingUp, 
  Receipt, 
  PieChart, 
  PiggyBank, 
  BarChart3, 
  Lock, 
  Globe2, 
  LayoutDashboard 
} from 'lucide-react';

const FeaturesSection = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: TrendingUp,
      title: 'Income Management',
      description: 'Categorize, monitor, and analyze all incoming revenue streams with real-time statistics.',
      color: 'emerald',
    },
    {
      icon: Receipt,
      title: 'Expense Tracking',
      description: 'Log daily expenditures, filter by category, and eliminate unnecessary spending leaks.',
      color: 'rose',
    },
    {
      icon: PieChart,
      title: 'Smart Budget Planning',
      description: 'Set category spending caps and receive instant alerts before overspending occurs.',
      color: 'orange',
    },
    {
      icon: PiggyBank,
      title: 'Savings Goals',
      description: 'Track progress toward financial milestones and automate targeted savings plans.',
      color: 'amber',
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Interactive visual charts detailing monthly trends, distribution, and net cash flow.',
      color: 'blue',
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'Enterprise-grade JSON Web Token (JWT) authorization with isolated user accounts.',
      color: 'violet',
    },
    {
      icon: Globe2,
      title: 'Multi-Currency Support',
      description: 'Support for INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), CAD, AUD, and SGD with formatters.',
      color: 'cyan',
    },
    {
      icon: LayoutDashboard,
      title: 'Responsive Dashboard',
      description: 'Smooth, high-density financial cockpit optimized for Desktop, Tablet, and Mobile screens.',
      color: 'indigo',
    },
  ];

  return (
    <section id="features" className="py-20 px-6 md:px-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Powerful Capabilities</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Everything You Need for Total Financial Mastery
          </h3>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Built from the ground up to give you clarity, precision, and complete control over your money.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  isDark
                    ? 'bg-[#181818] border-[#262626] hover:border-orange-500/40 shadow-orange-500/5'
                    : 'bg-white border-slate-200 hover:border-orange-500/40 shadow-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
