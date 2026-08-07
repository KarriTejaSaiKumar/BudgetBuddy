import React from 'react';
import LandingBackground from '../components/landing/LandingBackground';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import FlowSection from '../components/landing/FlowSection';
import AnalyticsSection from '../components/landing/AnalyticsSection';
import NotificationsSection from '../components/landing/NotificationsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

const Home = () => (
  <div className="relative min-h-screen overflow-x-clip text-foreground">
    <LandingBackground />
    <Navbar />

    <main>
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <ShowcaseSection />
      <FlowSection />
      <AnalyticsSection />
      <NotificationsSection />
      <CtaSection />
    </main>

    <Footer />
  </div>
);

export default Home;
