'use client';
import { useState, KeyboardEvent } from 'react';
import { useApp } from '@/context/AppContext';
import type { WorkspaceId } from '@/lib/types';

export default function AddClientModal({ onClose }: { onClose: () => void }) {
  const { ws, clients, setClients } = useApp();
  const [selWs, setSelWs] = useState<WorkspaceId>(ws);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function add() {
    const trimmed = name.trim();
    if (!trimmed) { setError('Client name is required.'); return; }
    if (clients[selWs].includes(trimmed)) { setError('Client already exists.'); return; }
    setClients({ ...clients, [selWs]: [...clients[selWs], trimmed] });
    onClose();
  }

  function onKey(e: KeyboardEvent) { if (e.key === 'Enter') add(); }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 15, fontWeight: 600 }}>Add Client</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label>Workspace</label>
            <select value={selWs} onChange={e => setSelWs(e.target.value as WorkspaceId)}>
              <option value="OBM">OBM</option>
              <option value="CFM">CFM</option>
            </select>
          </div>
          <div className="form-group">
            <label>Client Name</label>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} placeholder="Client name" autoFocus />
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-dark" onClick={add}>Add Client</button>
        </div>
      </div>
    </div>
  );
}
