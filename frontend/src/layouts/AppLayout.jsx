import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QuickActionsFab from '../components/QuickActionsFab';
import AssistantDrawer from '../components/AssistantDrawer';

const COLLAPSE_KEY = 'budgetbuddy_sidebar_collapsed';

/**
 * App shell: frosted rail on the left, frosted top chrome, content floating
 * on an aurora-washed canvas. Sidebar state survives navigation and reloads.
 */
const AppLayout = ({ children, title = 'Dashboard' }) => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="aurora flex min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <Header title={title} setMobileOpen={setMobileOpen} setAssistantOpen={setAssistantOpen} />

        <main
          id="main"
          className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8"
        >
          {children}
        </main>
      </div>

      <QuickActionsFab />
      <AssistantDrawer isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};

export default AppLayout;
