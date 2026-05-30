'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getProjMonth, monthLabel, WS_CFG } from '@/lib/helpers';
import type { WorkspaceId } from '@/lib/types';

function last6Months(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const escape = (s: string) => s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardView() {
  const { projects, ws: globalWs } = useApp();
  const [selWs, setSelWs] = useState<WorkspaceId | 'ALL'>('ALL');
  const months = last6Months();
  const [selMonth, setSelMonth] = useState(months[0]);

  const wsProjects = selWs === 'ALL' ? projects : projects.filter(p => p.ws === selWs);
  const monthProjects = wsProjects.filter(p => getProjMonth(p) === selMonth);

  const done = monthProjects.filter(p => p.status === 'Done').length;
  const inProgress = monthProjects.filter(p => ['Full- Running','Revision','Waiting'].includes(p.status)).length;
  const pendingAll = wsProjects.filter(p => p.status !== 'Done').length;

  const prevMonth = months[1];
  const prevProjects = wsProjects.filter(p => getProjMonth(p) === prevMonth);
  const prevDone = prevProjects.filter(p => p.status === 'Done').length;
  const prevInProgress = prevProjects.filter(p => ['Full- Running','Revision','Waiting'].includes(p.status)).length;
  const prevPending = prevProjects.filter(p => p.status === 'Pending').length;

  const clientList = Array.from(new Set(wsProjects.map(p => p.cl))).sort();

  const barData = months.map(m => {
    const mp = wsProjects.filter(p => getProjMonth(p) === m);
    return {
      m,
      done: mp.filter(p => p.status === 'Done').length,
      inProg: mp.filter(p => ['Full- Running','Revision','Waiting'].includes(p.status)).length,
      pend: mp.filter(p => p.status === 'Pending').length,
      total: mp.length,
    };
  }).reverse();

  const maxBar = Math.max(...barData.map(b => b.total), 1);

  function dlMonthly() {
    const headers = ['#','Workspace','Client','Title','Editor','Status','Priority','5Min/Start','Full/Delivery','Release/Published','Notes'];
    const rows = monthProjects.map((p, i) => [
      String(i+1), p.ws, p.cl, p.title, p.editor, p.status, p.priority, p.d1, p.d2, p.d3, p.other
    ]);
    downloadCSV(`monthly-report-${selMonth}.csv`, rows, headers);
  }

  function dlAll() {
    const headers = ['#','Workspace','Client','Title','Editor','Status','Priority','5Min/Start','Full/Delivery','Release/Published','Notes'];
    const rows = wsProjects.map((p, i) => [
      String(i+1), p.ws, p.cl, p.title, p.editor, p.status, p.priority, p.d1, p.d2, p.d3, p.other
    ]);
    downloadCSV(`all-projects.csv`, rows, headers);
  }

  function dlPrint() {
    const html = `<!DOCTYPE html><html><head><title>Report ${selMonth}</title>
<style>body{font-family:sans-serif;padding:20px;color:#111}h1{margin-bottom:12px}
.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.k{border:1px solid #ddd;border-radius:8px;padding:14px}.k-l{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:4px}
.k-v{font-size:28px;font-weight:600}table{width:100%;border-collapse:collapse}
th{background:#f5f5f5;padding:8px;text-align:left;font-size:11px;border-bottom:1px solid #ddd}
td{padding:8px;font-size:12px;border-bottom:1px solid #eee}</style></head><body>
<h1>Monthly Report — ${monthLabel(selMonth)}</h1>
<div class="kpi">
<div class="k"><div class="k-l">Total</div><div class="k-v">${monthProjects.length}</div></div>
<div class="k"><div class="k-l">Done</div><div class="k-v">${done}</div></div>
<div class="k"><div class="k-l">In Progress</div><div class="k-v">${inProgress}</div></div>
<div class="k"><div class="k-l">Pending</div><div class="k-v">${pendingAll}</div></div>
</div>
<table><thead><tr><th>#</th><th>Client</th><th>Title</th><th>Editor</th><th>Status</th><th>Priority</th></tr></thead>
<tbody>${monthProjects.map((p,i) => `<tr><td>${i+1}</td><td>${p.cl}</td><td>${p.title}</td><td>${p.editor}</td><td>${p.status}</td><td>${p.priority}</td></tr>`).join('')}</tbody>
</table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a'); a.href = url; a.download = `report-${selMonth}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="views-scroll">
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>Monthly Dashboard</h2>
        <select value={selWs} onChange={e => setSelWs(e.target.value as WorkspaceId | 'ALL')} style={{ width: 100 }}>
          <option value="ALL">All WS</option>
          <option value="OBM">OBM</option>
          <option value="CFM">CFM</option>
        </select>
        <select value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ width: 130 }}>
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total This Month</div>
          <div className="kpi-value">{monthProjects.length}</div>
          <div className="kpi-sub">{monthLabel(selMonth)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Done</div>
          <div className="kpi-value" style={{ color: 'var(--done)' }}>{done}</div>
          <div className="kpi-sub">{monthProjects.length > 0 ? Math.round(done / monthProjects.length * 100) : 0}% completion rate</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Progress</div>
          <div className="kpi-value" style={{ color: 'var(--run)' }}>{inProgress}</div>
          <div className="kpi-sub">Running + Revision + Waiting</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">All Pending</div>
          <div className="kpi-value" style={{ color: 'var(--pend)' }}>{pendingAll}</div>
          <div className="kpi-sub">Non-done across all time</div>
        </div>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Last 6 Months</span>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
          {barData.map(b => (
            <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{b.total}</span>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: `${Math.round((b.total / maxBar) * 100)}px`, minHeight: b.total ? 4 : 0, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: `${b.total ? Math.round(b.done / b.total * 100) : 0}%`, background: 'var(--done)', minHeight: b.done ? 3 : 0 }} />
                <div style={{ height: `${b.total ? Math.round(b.inProg / b.total * 100) : 0}%`, background: 'var(--run)', minHeight: b.inProg ? 3 : 0 }} />
                <div style={{ flex: 1, background: 'var(--pend-bg)', minHeight: b.pend ? 3 : 0 }} />
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{monthLabel(b.m).slice(0, 3)}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 12 }}>
          {[['var(--done)', 'Done'], ['var(--run)', 'In Progress'], ['var(--border2)', 'Pending']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
              <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>This Month vs Last Month</span>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total', cur: monthProjects.length, prev: prevProjects.length },
            { label: 'Done', cur: done, prev: prevDone },
            { label: 'In Progress', cur: inProgress, prev: prevInProgress },
            { label: 'Pending', cur: monthProjects.filter(p=>p.status==='Pending').length, prev: prevPending },
          ].map(({ label, cur, prev }) => {
            const delta = cur - prev;
            return (
              <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <div className="kpi-label">{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 500 }}>{cur}</span>
                  <span style={{ fontSize: 11, color: delta > 0 ? 'var(--done)' : delta < 0 ? 'var(--high)' : 'var(--text3)' }}>
                    {delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '–'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Per-Client Breakdown</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Client</th><th>WS</th><th>Total</th><th>Done</th><th>In Progress</th><th>Pending</th><th style={{width:120}}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {clientList.map(cl => {
                const cp = wsProjects.filter(p => p.cl === cl);
                const cd = cp.filter(p => p.status === 'Done').length;
                const ci = cp.filter(p => ['Full- Running','Revision','Waiting'].includes(p.status)).length;
                const cpend = cp.filter(p => p.status === 'Pending').length;
                const pct = cp.length ? Math.round(cd / cp.length * 100) : 0;
                const ws2 = cp[0]?.ws;
                return (
                  <tr key={cl}>
                    <td style={{ fontWeight: 500 }}>{cl}</td>
                    <td><span style={{ background: 'var(--bg4)', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontFamily: 'DM Mono,monospace' }}>{ws2}</span></td>
                    <td className="mono">{cp.length}</td>
                    <td style={{ color: 'var(--done)' }} className="mono">{cd}</td>
                    <td style={{ color: 'var(--run)' }} className="mono">{ci}</td>
                    <td style={{ color: 'var(--pend)' }} className="mono">{cpend}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--done)', borderRadius: 3 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text3)', minWidth: 28 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Download Reports</span>
        </div>
        <div style={{ padding: 16, display: 'flex', gap: 10 }}>
          <button className="btn" onClick={dlMonthly}>📄 Monthly Report (CSV)</button>
          <button className="btn" onClick={dlAll}>📋 All Projects (CSV)</button>
          <button className="btn" onClick={dlPrint}>🖨 Print-Ready Report</button>
        </div>
      </div>
    </div>
  );
}
