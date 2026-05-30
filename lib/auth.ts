'use client';
import { lsGet, lsSet, lsDel } from './storage';
import type { Users, SessionUser, Role } from './types';

const SALT = 'vt-salt-2026';

export async function hashStr(str: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getUsers(): Users {
  return lsGet<Users>('vt-users-v1', {});
}

export function saveUsers(users: Users): void {
  lsSet('vt-users-v1', users);
}

export async function initDefaultUser(): Promise<void> {
  const users = getUsers();
  if (!users['admin']) {
    const hash = await hashStr('admin123');
    users['admin'] = { hash, role: 'admin' };
    saveUsers(users);
  }
}

export async function login(username: string, password: string): Promise<SessionUser | null> {
  const users = getUsers();
  const user = users[username];
  if (!user) return null;
  const hash = await hashStr(password);
  if (hash !== user.hash) return null;
  const session: SessionUser = { username, role: user.role as Role };
  lsSet('vt-session', `1:${username}:${user.role}`);
  return session;
}

export function logout(): void {
  lsDel('vt-session');
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('vt-session');
    if (!s || s === '0') return null;
    const parts = s.split(':');
    if (parts[0] !== '1') return null;
    return { username: parts[1], role: parts[2] as Role };
  } catch {
    return null;
  }
}
