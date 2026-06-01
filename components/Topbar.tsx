'use client';
import { useApp } from '@/context/AppContext';

interface Props {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const VIEW_LABELS: Record<string, string> = {
  tracker: 'Tracker',
  dashboard: 'Dashboard',
  monthly: 'Monthly',
  editors: 'Editors',
};

export default function Topbar({ onMenuClick, showMenu }: Props) {
  const { currentUser, saveStatus, view, ws } = useApp();

  const pageTitle = view === 'tracker' ? `${ws} Workspace` : (VIEW_LABELS[view] || '');

  return (
    <div className="topbar">
      {/* Mobile hamburger */}
      {view === 'tracker' && (
        <button
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            display: 'none', padding: '4px 6px', border: 'none',
            background: 'transparent', fontSize: 18, cursor: 'pointer',
            color: 'var(--text)', flexShrink: 0,
          }}
        >
          {showMenu ? '✕' : '☰'}
        </button>
      )}

      {/* Greeting */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
          Hello, {currentUser?.username}! 👋
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
          {pageTitle}
        </div>
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {saveStatus !== 'idle' && (
          <span className="mono" style={{ fontSize: 11, color: saveStatus === 'saved' ? 'var(--done)' : 'var(--text3)' }}>
            {saveStatus === 'saving' ? '● Saving...' : '✓ Saved'}
          </span>
        )}
        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
          color: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0, userSelect: 'none',
        }}>
          {currentUser?.username?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
