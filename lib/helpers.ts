import type { Status, Priority } from './types';

export function fmtDate(d: string): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return '—';
  return `${day}/${m}/${y.slice(2)}`;
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
  'Done':         { bg: 'var(--done-bg)',  color: 'var(--done)',  border: 'var(--done)' },
  'Full- Running':{ bg: 'var(--run-bg)',   color: 'var(--run)',   border: 'var(--run)' },
  'Revision':     { bg: 'var(--rev-bg)',   color: 'var(--rev)',   border: 'var(--rev)' },
  'Waiting':      { bg: 'var(--wait-bg)',  color: 'var(--wait)',  border: 'var(--wait)' },
  'Pending':      { bg: 'var(--pend-bg)',  color: 'var(--pend)',  border: 'var(--pend)' },
  'Kishan':       { bg: 'var(--kish-bg)',  color: 'var(--kish)',  border: 'var(--kish)' },
};

export const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'HIGH':   { bg: 'var(--high-bg)',  color: 'var(--high)',  border: 'var(--high)' },
  'MEDIUM': { bg: 'var(--med-bg)',   color: 'var(--med)',   border: 'var(--med)' },
  'LOW':    { bg: 'var(--low-bg)',   color: 'var(--low)',   border: 'var(--low)' },
};

export const WS_CFG = {
  OBM: { d1: '5 Min', d2: 'Full', d3: 'Release' },
  CFM: { d1: 'Start', d2: 'Delivery', d3: 'Published' },
};

export const ALL_STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
