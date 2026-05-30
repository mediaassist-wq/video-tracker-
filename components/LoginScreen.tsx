'use client';
import { useState, KeyboardEvent } from 'react';
import { login } from '@/lib/auth';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { setCurrentUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true); setError('');
    const user = await login(username.trim(), password);
    setLoading(false);
    if (!user) { setError('Invalid username or password.'); return; }
    setCurrentUser(user);
  }

  function onKey(e: KeyboardEvent) { if (e.key === 'Enter') handleLogin(); }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 360, background: 'var(--bg2)', borderRadius: 'var(--r2)',
        border: '1px solid var(--border)', padding: '32px 28px',
        boxShadow: 'var(--shadow2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🎬</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Video Tracker</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={onKey} placeholder="Username" autoFocus
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={onKey} placeholder="Password"
              style={{ width: '100%' }}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
          <button
            onClick={handleLogin} disabled={loading}
            className="btn btn-dark"
            style={{ width: '100%', marginTop: 4, justifyContent: 'center', display: 'flex' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 24 }}>
          Video Production Tracker · Internal Tool
        </p>
      </div>
    </div>
  );
}
