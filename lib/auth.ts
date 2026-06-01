'use client';
import { lsGet, lsSet, lsDel } from './storage';
import { supabase } from './supabase';
import type { Users, SessionUser, Role } from './types';

const SALT = 'vt-salt-2026';

export async function hashStr(str: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Supabase user helpers ────────────────────────────────────────────────────

export async function getUsersFromDB(): Promise<Users> {
  const { data } = await supabase.from('users').select('*');
  if (!data) return {};
  const result: Users = {};
  (data as { username: string; hash: string; role: string }[]).forEach(u => {
    result[u.username] = { hash: u.hash, role: u.role as Role };
  });
  return result;
}

export async function upsertUserInDB(username: string, hash: string, role: Role): Promise<void> {
  await supabase.from('users').upsert({ username, hash, role });
}

export async function deleteUserFromDB(username: string): Promise<void> {
  await supabase.from('users').delete().eq('username', username);
}

// ── Kept for backward compat (local only) ───────────────────────────────────
export function getUsers(): Users {
  return lsGet<Users>('vt-users-v1', {});
}
export function saveUsers(users: Users): void {
  lsSet('vt-users-v1', users);
}

// ── Init default admin ───────────────────────────────────────────────────────
export async function initDefaultUser(): Promise<void> {
  const { data } = await supabase.from('users').select('username').eq('username', 'admin').maybeSingle();
  if (!data) {
    const hash = await hashStr('admin123');
    await supabase.from('users').insert({ username: 'admin', hash, role: 'admin' });
  }
}

// ── Login ────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<SessionUser | null> {
  const { data } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
  if (!data) return null;
  const hash = await hashStr(password);
  if (hash !== data.hash) return null;
  const session: SessionUser = { username, role: data.role as Role };
  localStorage.setItem('vt-session', `1:${username}:${data.role}`);
  return session;
}

export function logout(): void {
  lsDel('vt-session');
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    let s = localStorage.getItem('vt-session');
    if (!s || s === '0' || s === 'null') return null;
    // Handle old JSON-stringified format: "\"1:admin:admin\""
    if (s.startsWith('"') && s.endsWith('"')) {
      try { s = JSON.parse(s); } catch { return null; }
    }
    const parts = (s as string).split(':');
    if (parts[0] !== '1' || !parts[1] || !parts[2]) return null;
    return { username: parts[1], role: parts[2] as Role };
  } catch {
    return null;
  }
}
