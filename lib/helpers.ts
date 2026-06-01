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
  'Done':         { bg: '#f0faf4', color: '#3d7a58', border: '#c5e0d0' },
  'Full- Running':{ bg: '#f0f4ff', color: '#4060b0', border: '#c5d0f0' },
  'Revision':     { bg: '#fdf6ee', color: '#9a6630', border: '#eed8b8' },
  'Waiting':      { bg: '#f8f4ff', color: '#7054a8', border: '#ddd0f8' },
  'Pending':      { bg: '#f7f7f8', color: '#606068', border: '#dddde0' },
  'Kishan':       { bg: '#fff4f8', color: '#a04870', border: '#f0c8d8' },
};

export const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'HIGH':   { bg: '#fdf2f2', color: '#b04848', border: '#f0cece' },
  'MEDIUM': { bg: '#fdf8f0', color: '#9a7030', border: '#eed8b0' },
  'LOW':    { bg: '#f4f4f5', color: '#707078', border: '#dddde0' },
};

export const WS_CFG = {
  OBM: { d1: '5 Min', d2: 'Full', d3: 'Release' },
  CFM: { d1: 'Start', d2: 'Delivery', d3: 'Published' },
};

export const ALL_STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
