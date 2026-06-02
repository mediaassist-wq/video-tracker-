'use client';
import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import LoginScreen from '@/components/LoginScreen';
import NavSidebar from '@/components/NavSidebar';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import TrackerView from '@/components/TrackerView';
import DashboardView from '@/components/DashboardView';
import MonthlyView from '@/components/MonthlyView';
import EditorsView from '@/components/EditorsView';
import ActivityView from '@/components/ActivityView';

function AppShell() {
  const { currentUser, view } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return <LoginScreen />;

  const showClientSidebar = view === 'tracker';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Narrow black nav sidebar */}
      <NavSidebar />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} showMenu={sidebarOpen} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Client sidebar (tracker only) */}
          {showClientSidebar && (
            <>
              <div
                className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
                onClick={() => setSidebarOpen(false)}
              />
              <Sidebar isOpen={sidebarOpen} onClientSelect={() => setSidebarOpen(false)} />
            </>
          )}

          {/* Content */}
          <div className="content-area">
            {view === 'tracker' && <TrackerView />}
            {view === 'dashboard' && <DashboardView />}
            {view === 'monthly' && <MonthlyView />}
            {view === 'editors' && <EditorsView />}
            {view === 'activity' && <ActivityView />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
