'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtDate, STATUS_STYLES, PRIORITY_STYLES, WS_CFG } from '@/lib/helpers';
import type { Project } from '@/lib/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ProjectDetailModal({ project, onClose, onEdit }: {
  project: Project;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const { comments, addComment, currentUser } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const projComments = comments.filter(c => c.project_id === project.id);
  const cfg = WS_CFG[project.ws];
  const ss = STATUS_STYLES[project.status];
  const ps = project.priority ? PRIORITY_STYLES[project.priority] : null;

  async function handleComment() {
    if (!text.trim()) return;
    setSending(true);
    await addComment(project.id, text.trim());
    setText('');
    setSending(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 15, fontWeight: 600, flex: 1, marginRight: 8 }}>{project.title}</span>
          {onEdit && currentUser?.role === 'admin' && (
            <button className="btn" style={{ fontSize: 12, padding: '3px 10px', marginRight: 6 }} onClick={onEdit}>Edit</button>
          )}
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Workspace', value: project.ws },
              { label: 'Client', value: project.cl },
              { label: 'Editor', value: project.editor || '—' },
              { label: 'Status', value: (
                <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                  {project.status}
                </span>
              )},
              { label: 'Priority', value: ps ? (
                <span style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {project.priority}
                </span>
              ) : '—' },
              { label: 'Note', value: project.other || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: cfg.d1, val: project.d1 },
              { label: cfg.d2, val: project.d2 },
              { label: cfg.d3, val: project.d3 },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'DM Mono,monospace' }}>{fmtDate(val) || '—'}</div>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
              Comments ({projComments.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
              {projComments.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>No comments yet.</p>
              )}
              {projComments.map(c => (
                <div key={c.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(c.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                placeholder="Add a comment…"
                style={{ flex: 1 }}
              />
              <button className="btn btn-dark" onClick={handleComment} disabled={sending || !text.trim()}>
                {sending ? '…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
