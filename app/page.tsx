'use client';
import { AppProvider, useApp } from '@/context/AppContext';
import LoginScreen from '@/components/LoginScreen';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import TrackerView from '@/components/TrackerView';
import DashboardView from '@/components/DashboardView';
import MonthlyView from '@/components/MonthlyView';
import EditorsView from '@/components/EditorsView';

function AppShell() {
  const { currentUser, view } = useApp();
  if (!currentUser) return <LoginScreen />;
  const showSidebar = view === 'tracker';
  return (
    <div className="app-wrap">
      <Topbar />
      <div className="main-area">
        {showSidebar && <Sidebar />}
        <div className="content-area">
          {view === 'tracker' && <TrackerView />}
          {view === 'dashboard' && <DashboardView />}
          {view === 'monthly' && <MonthlyView />}
          {view === 'editors' && <EditorsView />}
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
