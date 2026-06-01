'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { logout } from '@/lib/auth';
import ThemeModal from './modals/ThemeModal';
import SettingsModal from './modals/SettingsModal';
import type { View, WorkspaceId } from '@/lib/types';

interface Props {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export default function Topbar({ onMenuClick, showMenu }: Props) {
  const { ws, setWs, view, setView, saveStatus, setCurrentUser } = useApp();
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function handleLogout() { logout(); setCurrentUser(null); }

  const tabs: { label: string; value: View | WorkspaceId; type: 'ws' | 'view' }[] = [
    { label: 'OBM', value: 'OBM', type: 'ws' },
    { label: 'CFM', value: 'CFM', type: 'ws' },
    { label: 'Dashboard', value: 'dashboard', type: 'view' },
    { label: 'Monthly', value: 'monthly', type: 'view' },
    { label: 'Editors', value: 'editors', type: 'view' },
  ];

  function isActive(tab: typeof tabs[0]) {
    if (tab.type === 'ws') return view === 'tracker' && ws === tab.value;
    return view === tab.value;
  }

  function handleTab(tab: typeof tabs[0]) {
    if (tab.type === 'ws') { setWs(tab.value as WorkspaceId); setView('tracker'); }
    else setView(tab.value as View);
  }

  return (
    <>
      <div className="topbar">
        {/* Hamburger for mobile sidebar */}
        {view === 'tracker' && (
          <button
            onClick={onMenuClick}
            style={{
              display: 'none', padding: '4px 6px', border: 'none', background: 'transparent',
              fontSize: 18, cursor: 'pointer', color: 'var(--text)', flexShrink: 0,
            }}
            className="mobile-menu-btn"
            aria-label="Toggle sidebar"
          >
            {showMenu ? '✕' : '☰'}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, background: 'var(--accent)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
          }}>🎬</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
            Video Tracker
          </span>
        </div>

        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.label} className={`nav-tab${isActive(tab) ? ' active' : ''}`} onClick={() => handleTab(tab)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {saveStatus !== 'idle' && (
            <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
              {saveStatus === 'saving' ? '● Saving...' : '● Saved'}
            </span>
          )}
          <button className="btn" style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }} onClick={() => setShowTheme(true)}>🎨</button>
          <button className="btn" style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }} onClick={() => setShowSettings(true)}>⚙</button>
          <button
            className="btn"
            style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }}
            onClick={handleLogout}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#dc2626'; (e.target as HTMLElement).style.color = '#dc2626'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = ''; (e.target as HTMLElement).style.color = ''; }}
          >
            Logout
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
