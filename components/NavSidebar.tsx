'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { logout } from '@/lib/auth';
import SettingsModal from './modals/SettingsModal';
import ThemeModal from './modals/ThemeModal';
import type { View, WorkspaceId } from '@/lib/types';

const NAV_ITEMS: { icon: string; label: string; value: View | WorkspaceId; type: 'ws' | 'view' }[] = [
  { icon: '🏠', label: 'OBM', value: 'OBM', type: 'ws' },
  { icon: '📁', label: 'CFM', value: 'CFM', type: 'ws' },
  { icon: '📊', label: 'Dashboard', value: 'dashboard', type: 'view' },
  { icon: '📅', label: 'Monthly', value: 'monthly', type: 'view' },
  { icon: '👥', label: 'Editors', value: 'editors', type: 'view' },
];

export default function NavSidebar() {
  const { ws, setWs, view, setView, setCurrentUser } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [tooltip, setTooltip] = useState('');

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.type === 'ws') return view === 'tracker' && ws === item.value;
    return view === item.value;
  }

  function handleNav(item: typeof NAV_ITEMS[0]) {
    if (item.type === 'ws') { setWs(item.value as WorkspaceId); setView('tracker'); }
    else setView(item.value as View);
  }

  function handleLogout() { logout(); setCurrentUser(null); }

  const iconBtn = (icon: string, label: string, onClick: () => void, danger = false) => (
    <button
      key={label}
      onClick={onClick}
      onMouseEnter={() => setTooltip(label)}
      onMouseLeave={() => setTooltip('')}
      title={label}
      style={{
        width: 44, height: 44, border: 'none', borderRadius: 12,
        background: 'transparent', color: danger ? '#f87171' : 'rgba(255,255,255,0.5)',
        fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transition: 'all .15s', position: 'relative',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.1)';
        (e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : '#fff';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : 'rgba(255,255,255,0.5)';
      }}
    >
      {icon}
    </button>
  );

  return (
    <>
      <div style={{
        width: 64, minWidth: 64, height: '100vh', background: '#111827',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 4, zIndex: 20, position: 'relative',
      }}>
        {/* Logo */}
        <div style={{
          width: 38, height: 38, background: '#fff', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, marginBottom: 16, flexShrink: 0,
        }}>🎬</div>

        {/* Nav items */}
        {NAV_ITEMS.map(item => {
          const active = isActive(item);
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              onMouseEnter={() => setTooltip(item.label)}
              onMouseLeave={() => setTooltip('')}
              title={item.label}
              style={{
                width: 44, height: 44, border: 'none', borderRadius: 12,
                background: active ? '#fff' : 'transparent',
                color: active ? '#111827' : 'rgba(255,255,255,0.45)',
                fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all .15s',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
              onMouseOver={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseOut={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                }
              }}
            >
              {item.icon}
            </button>
          );
        })}

        {/* Bottom buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {iconBtn('🎨', 'Theme', () => setShowTheme(true))}
          {iconBtn('⚙️', 'Settings', () => setShowSettings(true))}
          {iconBtn('🚪', 'Logout', handleLogout, true)}
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
    </>
  );
}
