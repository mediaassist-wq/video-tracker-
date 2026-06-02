'use client';
import { useApp } from '@/context/AppContext';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const ACTION_ICON: Record<string, string> = {
  'Add Project': '＋',
  'Delete Project': '✕',
  'Duplicate Project': '⧉',
  'Bulk Status Change': '◈',
  'Delete': '✕',
};

export default function ActivityView() {
  const { activityLog } = useApp();

  return (
    <div className="views-scroll">
      <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Activity Log</h2>
      </div>

      <div className="section-panel" style={{ margin: 16 }}>
        {activityLog.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No activity yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activityLog.map((log, i) => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                borderBottom: i < activityLog.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: 'var(--bg4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, flexShrink: 0, color: 'var(--text2)',
                }}>
                  {ACTION_ICON[log.action] || '●'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{log.action}</span>
                    <span style={{ fontSize: 11, background: 'var(--bg4)', borderRadius: 4, padding: '1px 6px', color: 'var(--text2)' }}>{log.username}</span>
                  </div>
                  {log.details && <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</p>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, marginTop: 2 }}>{timeAgo(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
