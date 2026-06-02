'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { logout } from '@/lib/auth';
import SettingsModal from './modals/SettingsModal';
import ThemeModal from './modals/ThemeModal';
import type { View, WorkspaceId } from '@/lib/types';
import { dateStatus } from '@/lib/helpers';

function Icon({ name }: { name: string }) {
  const s = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'obm': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case 'cfm': return <svg viewBox="0 0 24 24" {...s}><path d="M4 6h16M4 12h10M4 18h13"/></svg>;
    case 'dashboard': return <svg viewBox="0 0 24 24" {...s}><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>;
    case 'monthly': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case 'editors': return <svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg>;
    case 'theme': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    case 'settings': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case 'activity': return <svg viewBox="0 0 24 24" {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'logout': return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    default: return null;
  }
}

const NAV_ITEMS: { icon: string; label: string; value: View | WorkspaceId; type: 'ws' | 'view' }[] = [
  { icon: 'obm',       label: 'OBM',       value: 'OBM',       type: 'ws'   },
  { icon: 'cfm',       label: 'CFM',       value: 'CFM',       type: 'ws'   },
  { icon: 'dashboard', label: 'Dashboard', value: 'dashboard', type: 'view' },
  { icon: 'monthly',   label: 'Monthly',   value: 'monthly',   type: 'view' },
  { icon: 'editors',   label: 'Editors',   value: 'editors',   type: 'view' },
  { icon: 'activity',  label: 'Activity',  value: 'activity',  type: 'view' },
];

function NavBtn({ active, icon, label, onClick, danger = false }: {
  active?: boolean; icon: string; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 44, height: 44, border: 'none', borderRadius: 12,
        background: active ? '#fff' : 'transparent',
        color: active ? '#111827' : danger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.45)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.1)';
          (e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : '#fff';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = danger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.45)';
        }
      }}
    >
      <Icon name={icon} />
    </button>
  );
}

export default function NavSidebar() {
  const { ws, setWs, view, setView, setCurrentUser, projects } = useApp();

  const overdueByWs = useMemo(() => {
    const count = (w: string) => projects.filter(p => p.ws === w && p.status !== 'Done' &&
      dateStatus(p.d3 || p.d2 || p.d1) === 'overdue').length;
    return { OBM: count('OBM'), CFM: count('CFM') };
  }, [projects]);
  const [showSettings, setShowSettings] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.type === 'ws') return view === 'tracker' && ws === item.value;
    return view === item.value;
  }

  function handleNav(item: typeof NAV_ITEMS[0]) {
    if (item.type === 'ws') { setWs(item.value as WorkspaceId); setView('tracker'); }
    else setView(item.value as View);
  }

  return (
    <>
      <div style={{
        width: 64, minWidth: 64, height: '100vh', background: '#111827',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 4, zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{
          width: 38, height: 38, background: '#fff', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, flexShrink: 0, fontSize: 18,
        }}>🎬</div>

        {/* Nav */}
        {NAV_ITEMS.map(item => {
          const badge = item.value === 'OBM' ? overdueByWs.OBM : item.value === 'CFM' ? overdueByWs.CFM : 0;
          return (
            <div key={item.label} style={{ position: 'relative' }}>
              <NavBtn active={isActive(item)} icon={item.icon} label={item.label} onClick={() => handleNav(item)} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: '#e05252', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  {badge}
                </span>
              )}
            </div>
          );
        })}

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavBtn icon="theme"    label="Theme"    onClick={() => setShowTheme(true)} />
          <NavBtn icon="settings" label="Settings" onClick={() => setShowSettings(true)} />
          <NavBtn icon="logout"   label="Logout"   onClick={() => { logout(); setCurrentUser(null); }} danger />
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showTheme    && <ThemeModal    onClose={() => setShowTheme(false)} />}
    </>
  );
}
