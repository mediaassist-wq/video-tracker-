'use client';
import { useState } from 'react';
import { hashStr, upsertUserInDB, getUsersFromDB } from '@/lib/auth';
import type { Role } from '@/lib/types';

export default function AddUserModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [error, setError] = useState('');

  async function create() {
    if (!username.trim()) { setError('Username required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const existing = await getUsersFromDB();
    if (existing[username.trim()]) { setError('Username already exists.'); return; }
    const hash = await hashStr(password);
    await upsertUserInDB(username.trim(), hash, role);
    onDone();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 15, fontWeight: 600 }}>Add User</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password (min 6 chars)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)}>
              <option value="editor">Editor (view only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-dark" onClick={create}>Create User</button>
        </div>
      </div>
    </div>
  );
}
