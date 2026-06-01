import type { Status, Priority } from './types';

export function fmtDate(d: string): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return '—';
  return `${day}/${m}/${y.slice(2)}`;
}

// Returns: 'overdue' | 'today' | 'soon' (≤3 days) | 'upcoming' | 'empty'
export function dateStatus(d: string): 'overdue' | 'today' | 'soon' | 'upcoming' | 'empty' {
  if (!d) return 'empty';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const date  = new Date(d); date.setHours(0, 0, 0, 0);
  const diff  = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3)  return 'soon';
  return 'upcoming';
}

export function getProjMonth(p: { d1: string; d2: string; d3: string }): string {
  const d = p.d2 || p.d1 || p.d3;
  if (!d) return '';
  return d.slice(0, 7);
}

export function monthLabel(ym: string): string {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export const STATUS_STYLES: Record<Status, { bg: string; color: string; border: string }> = {
  'Done':         { bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' },
  'Full- Running':{ bg: '#111827', color: '#ffffff', border: '#111827' },
  'Revision':     { bg: '#fafafa', color: '#3f3f46', border: '#d4d4d8' },
  'Waiting':      { bg: '#fafafa', color: '#3f3f46', border: '#d4d4d8' },
  'Pending':      { bg: '#fafafa', color: '#a1a1aa', border: '#e4e4e7' },
  'Kishan':       { bg: '#18181b', color: '#e4e4e7', border: '#3f3f46' },
};

export const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'HIGH':   { bg: '#18181b', color: '#fafafa', border: '#3f3f46' },
  'MEDIUM': { bg: '#f4f4f5', color: '#52525b', border: '#d4d4d8' },
  'LOW':    { bg: '#fafafa', color: '#a1a1aa', border: '#e4e4e7' },
};

export const WS_CFG = {
  OBM: { d1: '5 Min', d2: 'Full', d3: 'Release' },
  CFM: { d1: 'Start', d2: 'Delivery', d3: 'Published' },
};

export const ALL_STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
