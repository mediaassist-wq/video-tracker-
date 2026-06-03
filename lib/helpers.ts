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
  'Done':         { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)'  },
  'Full- Running':{ bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa', border: 'rgba(96,165,250,0.30)'  },
  'Revision':     { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  'Waiting':      { bg: 'rgba(253,224,71,0.10)',  color: '#fde047', border: 'rgba(253,224,71,0.22)'  },
  'Pending':      { bg: 'rgba(255,255,255,0.06)', color: 'rgba(240,238,255,0.45)', border: 'rgba(255,255,255,0.10)' },
  'Kishan':       { bg: 'rgba(192,132,252,0.15)', color: '#c084fc', border: 'rgba(192,132,252,0.30)' },
};

export const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'HIGH':   { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.30)' },
  'MEDIUM': { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  'LOW':    { bg: 'rgba(255,255,255,0.06)', color: 'rgba(240,238,255,0.4)', border: 'rgba(255,255,255,0.10)' },
};

export const WS_CFG = {
  OBM: { d1: '5 Min', d2: 'Full', d3: 'Release' },
  CFM: { d1: 'Start', d2: 'Delivery', d3: 'Published' },
};

export const ALL_STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
