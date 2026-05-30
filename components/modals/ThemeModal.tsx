'use client';
import { useApp } from '@/context/AppContext';

const THEMES = [
  { id: '', label: 'Default', desc: 'Light & clean', colors: ['#f5f5f5', '#ffffff', '#111827', '#374151'] },
  { id: 'theme-midnight', label: 'Midnight', desc: 'Dark & sleek', colors: ['#0d0d0d', '#1a1a1a', '#e8e8e8', '#666666'] },
  { id: 'theme-ocean', label: 'Ocean', desc: 'Deep blue dark', colors: ['#0a1628', '#0f1f3d', '#4da6ff', '#94b8e8'] },
  { id: 'theme-moss', label: 'Moss', desc: 'Earthy green dark', colors: ['#0c1a0e', '#122214', '#6bcb77', '#92b890'] },
];

export default function ThemeModal({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useApp();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 15, fontWeight: 600 }}>Choose Theme</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); onClose(); }}
                style={{
                  border: `2px solid ${theme === t.id ? '#4da6ff' : 'var(--border2)'}`,
                  borderRadius: 'var(--r2)', padding: 12, background: 'var(--bg3)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {t.colors.map((c, i) => (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,.1)' }} />
                  ))}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
