import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import DashboardPreviewSection from '../components/landing/DashboardPreviewSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FaqSection from '../components/landing/FaqSection';
import Footer from '../components/landing/Footer';

const Home = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 selection:bg-orange-500 selection:text-white ${
      isDark ? 'bg-[#0B0B0B] text-slate-100' : 'bg-white text-slate-900'
    }`}>
      {/* 1. Header Navigation */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Features Section */}
        <FeaturesSection />

        {/* 4. Benefits Section */}
        <BenefitsSection />

        {/* 5. How It Works Timeline */}
        <HowItWorksSection />

        {/* 6. Dashboard Preview Cockpit */}
        <DashboardPreviewSection />

        {/* 7. Testimonials */}
        <TestimonialsSection />

        {/* 8. Pricing Section */}
        <PricingSection />

        {/* 9. FAQ Section */}
        <FaqSection />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};

export default Home;
