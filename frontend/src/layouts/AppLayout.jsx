import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AppLayout = ({ children, title = "Dashboard" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navigation Bar */}
        <Header title={title} setMobileOpen={setMobileOpen} />

        {/* Dashboard Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
