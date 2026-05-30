'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AddClientModal from './modals/AddClientModal';
import ConfirmModal from './modals/ConfirmModal';

export default function Sidebar() {
  const { ws, clients, setClients, projects, selClient, setSelClient, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const list = clients[ws] || [];

  function countForClient(cl: string) {
    return projects.filter(p => p.ws === ws && p.cl === cl).length;
  }

  function removeClient(cl: string) {
    const updated = { ...clients, [ws]: clients[ws].filter(c => c !== cl) };
    setClients(updated);
    if (selClient === cl) setSelClient(updated[ws][0] || '');
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
          <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text3)' }}>
            {ws} Clients
          </span>
          {isAdmin && (
            <button className="btn" style={{ fontSize: 11, padding: '2px 7px' }} onClick={() => setShowAdd(true)}>
              + Add
            </button>
          )}
        </div>

        {list.map(cl => (
          <div
            key={cl}
            style={{ display: 'flex', alignItems: 'center', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 2 }}
            className="sidebar-row"
          >
            <button
              onClick={() => setSelClient(cl)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', border: 'none', borderRadius: 'var(--r)',
                background: selClient === cl ? 'var(--accent)' : 'transparent',
                color: selClient === cl ? 'var(--bg2)' : 'var(--text)',
                fontSize: 13, textAlign: 'left', transition: 'all .1s', cursor: 'pointer',
              }}
              onMouseEnter={e => { if (selClient !== cl) (e.currentTarget as HTMLElement).style.background = 'var(--bg4)'; }}
              onMouseLeave={e => { if (selClient !== cl) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                {cl}
              </span>
              <span style={{
                background: selClient === cl ? 'rgba(255,255,255,.2)' : 'var(--bg4)',
                color: selClient === cl ? 'var(--bg2)' : 'var(--text3)',
                borderRadius: 10, padding: '0 5px', fontSize: 10, minWidth: 18, textAlign: 'center',
                fontFamily: 'DM Mono, monospace',
              }}>
                {countForClient(cl)}
              </span>
            </button>
            {isAdmin && (
              <button
                className="icon-btn danger"
                style={{ opacity: 0, marginLeft: 2, fontSize: 12 }}
                onClick={() => setDeleteTarget(cl)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
              >✕</button>
            )}
          </div>
        ))}

        {list.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 4px' }}>No clients yet.</p>
        )}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      {deleteTarget && (
        <ConfirmModal
          title="Remove Client"
          description={`Remove "${deleteTarget}" from ${ws}? Projects will remain.`}
          onConfirm={() => removeClient(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
