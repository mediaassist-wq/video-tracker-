'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { hashStr, getUsersFromDB, upsertUserInDB, deleteUserFromDB } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Users, Role } from '@/lib/types';
import AddUserModal from './AddUserModal';
import ConfirmModal from './ConfirmModal';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<Users>({});
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [unPw, setUnPw] = useState('');
  const [unMsg, setUnMsg] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState<string | null>(null);

  useEffect(() => {
    getUsersFromDB().then(setUsers);
  }, []);

  async function changePassword() {
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwMsg('All fields required.'); return; }
    if (pwNew.length < 6) { setPwMsg('New password must be at least 6 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwMsg('New passwords do not match.'); return; }

    // Verify current password against DB
    const { data } = await supabase.from('users').select('hash').eq('username', currentUser!.username).maybeSingle();
    if (!data) { setPwMsg('User not found.'); return; }
    const currentHash = await hashStr(pwCurrent);
    if (currentHash !== data.hash) { setPwMsg('Current password is incorrect.'); return; }

    // Save new password
    const newHash = await hashStr(pwNew);
    await upsertUserInDB(currentUser!.username, newHash, currentUser!.role);
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwMsg('✓ Password changed successfully.');
  }

  async function changeUsername() {
    if (!newUsername.trim() || !unPw) { setUnMsg('All fields required.'); return; }
    const existing = await supabase.from('users').select('username').eq('username', newUsername.trim()).maybeSingle();
    if (existing.data) { setUnMsg('Username already taken.'); return; }

    const { data } = await supabase.from('users').select('hash,role').eq('username', currentUser!.username).maybeSingle();
    if (!data) { setUnMsg('User not found.'); return; }
    const hash = await hashStr(unPw);
    if (hash !== data.hash) { setUnMsg('Incorrect password.'); return; }

    // Insert new username, delete old
    await upsertUserInDB(newUsername.trim(), data.hash, data.role as Role);
    await deleteUserFromDB(currentUser!.username);
    setUnMsg('✓ Username changed. Please log in again.');
    getUsersFromDB().then(setUsers);
  }

  async function doDeleteUser(username: string) {
    await deleteUserFromDB(username);
    getUsersFromDB().then(setUsers);
    setDeleteUser(null);
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span style={{ fontSize: 15, fontWeight: 600 }}>Settings</span>
            <button className="icon-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Current user info */}
            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Logged in as:</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{currentUser?.username}</span>
              <span style={{
                background: isAdmin ? 'var(--run-bg)' : 'var(--bg4)',
                color: isAdmin ? 'var(--run)' : 'var(--text2)',
                borderRadius: 4, padding: '1px 7px', fontSize: 11, fontFamily: 'DM Mono,monospace',
              }}>{currentUser?.role}</span>
            </div>

            {/* Change Password */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Change My Password</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="password" placeholder="Current password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} />
                <input type="password" placeholder="New password (min 6)" value={pwNew} onChange={e => setPwNew(e.target.value)} />
                <input type="password" placeholder="Confirm new password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} />
                {pwMsg && <p style={{ fontSize: 12, color: pwMsg.startsWith('✓') ? 'var(--done)' : '#dc2626' }}>{pwMsg}</p>}
                <button className="btn btn-dark" style={{ alignSelf: 'flex-start' }} onClick={changePassword}>Change Password</button>
              </div>
            </div>

            {/* Change Username */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Change Username</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input placeholder="New username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                <input type="password" placeholder="Confirm password" value={unPw} onChange={e => setUnPw(e.target.value)} />
                {unMsg && <p style={{ fontSize: 12, color: unMsg.startsWith('✓') ? 'var(--done)' : '#dc2626' }}>{unMsg}</p>}
                <button className="btn btn-dark" style={{ alignSelf: 'flex-start' }} onClick={changeUsername}>Change Username</button>
              </div>
            </div>

            {/* User Management (admin only) */}
            {isAdmin && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600 }}>User Management</h4>
                  <button className="btn btn-dark" style={{ fontSize: 12 }} onClick={() => setShowAddUser(true)}>+ Add User</button>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  {Object.entries(users).map(([uname, u]) => (
                    <div key={uname} style={{
                      display: 'flex', alignItems: 'center', padding: '8px 12px',
                      borderBottom: '1px solid var(--border)', gap: 8,
                    }}>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{uname}</span>
                      <span style={{
                        background: u.role === 'admin' ? 'var(--run-bg)' : 'var(--bg4)',
                        color: u.role === 'admin' ? 'var(--run)' : 'var(--text2)',
                        borderRadius: 4, padding: '1px 7px', fontSize: 11, fontFamily: 'DM Mono,monospace',
                      }}>{u.role}</span>
                      {uname !== currentUser?.username && (
                        <button className="icon-btn danger" onClick={() => setDeleteUser(uname)}>🗑</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onDone={() => getUsersFromDB().then(setUsers)}
        />
      )}
      {deleteUser && (
        <ConfirmModal
          title="Delete User"
          description={`Delete user "${deleteUser}"? This cannot be undone.`}
          onConfirm={() => doDeleteUser(deleteUser)}
          onCancel={() => setDeleteUser(null)}
        />
      )}
    </>
  );
}
