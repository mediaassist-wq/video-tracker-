'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtDate, STATUS_STYLES, PRIORITY_STYLES, getProjMonth, monthLabel } from '@/lib/helpers';
import type { WorkspaceId, Status, Priority } from '@/lib/types';

export default function MonthlyView() {
  const { projects } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selWs, setSelWs] = useState<WorkspaceId | 'ALL'>('ALL');
  const [dateField, setDateField] = useState<'d2' | 'd3' | 'd1' | 'any'>('d2');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterCol, setFilterCol] = useState<'any' | 'd1' | 'd2' | 'd3'>('any');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedCol, setAppliedCol] = useState<'any' | 'd1' | 'd2' | 'd3'>('any');
  const [hasFilter, setHasFilter] = useState(false);

  const selYM = `${year}-${String(month).padStart(2, '0')}`;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function applyFilter() {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedCol(filterCol);
    setHasFilter(!!(fromDate || toDate));
  }

  function clearFilter() {
    setFromDate(''); setToDate(''); setAppliedFrom(''); setAppliedTo('');
    setHasFilter(false);
  }

  const baseProjects = useMemo(() => {
    let ps = projects;
    if (selWs !== 'ALL') ps = ps.filter(p => p.ws === selWs);

    if (hasFilter && (appliedFrom || appliedTo)) {
      ps = ps.filter(p => {
        const dates = appliedCol === 'any' ? [p.d1, p.d2, p.d3].filter(Boolean) : [p[appliedCol]].filter(Boolean);
        return dates.some(d => {
          if (appliedFrom && d < appliedFrom) return false;
          if (appliedTo && d > appliedTo) return false;
          return true;
        });
      });
    } else {
      if (dateField === 'any') {
        ps = ps.filter(p => getProjMonth(p) === selYM);
      } else {
        ps = ps.filter(p => p[dateField]?.startsWith(selYM));
      }
    }
    return ps;
  }, [projects, selWs, selYM, dateField, hasFilter, appliedFrom, appliedTo, appliedCol]);

  const done = baseProjects.filter(p => p.status === 'Done').length;
  const inProg = baseProjects.filter(p => ['Full- Running','Revision','Waiting'].includes(p.status)).length;
  const pend = baseProjects.filter(p => p.status === 'Pending').length;

  const clientGroups = useMemo(() => {
    const map = new Map<string, typeof baseProjects>();
    baseProjects.forEach(p => {
      if (!map.has(p.cl)) map.set(p.cl, []);
      map.get(p.cl)!.push(p);
    });
    return Array.from(map.entries());
  }, [baseProjects]);

  function dlSheet() {
    const rows = baseProjects.map((p, i) => {
      return `<tr><td>${i+1}</td><td>${p.cl}</td><td>${p.title}</td><td>${p.editor}</td><td>${p.status}</td><td>${fmtDate(p.d1)}</td><td>${fmtDate(p.d2)}</td><td>${fmtDate(p.d3)}</td><td>${p.priority}</td></tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><title>${monthLabel(selYM)}</title>
<style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}
th{background:#f0f0f0;padding:8px;text-align:left;font-size:11px;border-bottom:2px solid #ddd}
td{padding:7px 8px;font-size:12px;border-bottom:1px solid #eee}</style></head>
<body><h2>${monthLabel(selYM)} — Projects</h2>${rows ? `<table><thead><tr><th>#</th><th>Client</th><th>Title</th><th>Editor</th><th>Status</th><th>Start/5Min</th><th>Full/Delivery</th><th>Release/Published</th><th>Priority</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>No projects.</p>'}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a'); a.href = url; a.download = `monthly-${selYM}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  const statuses: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

  return (
    <div className="views-scroll">
      <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn" style={{ padding: '4px 10px' }} onClick={prevMonth}>‹ Prev</button>
        <span style={{ fontSize: 15, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>{monthLabel(selYM)}</span>
        <button className="btn" style={{ padding: '4px 10px' }} onClick={nextMonth}>Next ›</button>
        <select value={selWs} onChange={e => setSelWs(e.target.value as WorkspaceId | 'ALL')} style={{ width: 90 }}>
          <option value="ALL">All</option>
          <option value="OBM">OBM</option>
          <option value="CFM">CFM</option>
        </select>
        <select value={dateField} onChange={e => setDateField(e.target.value as typeof dateField)} style={{ width: 150 }}>
          <option value="d2">Full/Delivery Date</option>
          <option value="d3">Release/Published</option>
          <option value="d1">5 Min/Start Date</option>
          <option value="any">Any Date</option>
        </select>
        <button className="btn btn-dark" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={dlSheet}>↓ Download Sheet</button>
      </div>

      <div className="filters-bar" style={{ background: 'var(--bg3)' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Date Range:</span>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: 140 }} />
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>to</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: 140 }} />
        <select value={filterCol} onChange={e => setFilterCol(e.target.value as typeof filterCol)} style={{ width: 150 }}>
          <option value="any">Any Column</option>
          <option value="d1">5 Min/Start</option>
          <option value="d2">Full/Delivery</option>
          <option value="d3">Release/Published</option>
        </select>
        <button className="btn btn-dark" style={{ fontSize: 12 }} onClick={applyFilter}>Apply</button>
        <button className="btn" style={{ fontSize: 12 }} onClick={clearFilter}>Clear</button>
        {hasFilter && (
          <span style={{ fontSize: 11, color: 'var(--kish)', fontWeight: 500 }}>
            ● Filter active: {appliedFrom || '…'} → {appliedTo || '…'}
          </span>
        )}
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Total', value: baseProjects.length, sub: monthLabel(selYM) },
          { label: 'Done', value: done, sub: `${baseProjects.length ? Math.round(done/baseProjects.length*100) : 0}%`, color: 'var(--done)' },
          { label: 'In Progress', value: inProg, sub: 'Running + Rev + Waiting', color: 'var(--run)' },
          { label: 'Pending', value: pend, sub: 'Awaiting start', color: 'var(--pend)' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {clientGroups.map(([cl, ps]) => {
        const statusCounts: Partial<Record<Status, number>> = {};
        ps.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
        const wsLabel = ps[0]?.ws;

        return (
          <div key={cl} className="section-panel">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'var(--bg5)', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'var(--text2)' }}>{wsLabel}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{cl}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {statuses.filter(s => statusCounts[s]).map(s => {
                    const st = STATUS_STYLES[s];
                    return (
                      <span key={s} className="status-pill" style={{ background: st.bg, color: st.color, borderColor: st.border, fontSize: 10 }}>
                        {s}: {statusCounts[s]}
                      </span>
                    );
                  })}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{ps.length} projects</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Title</th>
                  <th>Editor</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {ps.map((p, i) => (
                  <tr key={p.id}>
                    <td className="mono" style={{ color: 'var(--text3)', fontSize: 11 }}>{i+1}</td>
                    <td style={{ fontWeight: 500 }}>{p.title}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--text2)' }}>{p.editor}</td>
                    <td>
                      <span className="status-pill" style={{ background: STATUS_STYLES[p.status].bg, color: STATUS_STYLES[p.status].color, borderColor: STATUS_STYLES[p.status].border }}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.d1 && <span style={{ background: 'var(--bg4)', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'DM Mono,monospace', color: 'var(--text2)' }}>S:{fmtDate(p.d1)}</span>}
                        {p.d2 && <span style={{ background: 'var(--run-bg)', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'DM Mono,monospace', color: 'var(--run)' }}>D:{fmtDate(p.d2)}</span>}
                        {p.d3 && <span style={{ background: 'var(--done-bg)', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'DM Mono,monospace', color: 'var(--done)' }}>P:{fmtDate(p.d3)}</span>}
                      </div>
                    </td>
                    <td>
                      {p.priority && (
                        <span className="pri-chip" style={{ background: PRIORITY_STYLES[p.priority].bg, color: PRIORITY_STYLES[p.priority].color, borderColor: PRIORITY_STYLES[p.priority].border }}>
                          {p.priority}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {clientGroups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: 14 }}>
          📭 No projects for this period.
        </div>
      )}
    </div>
  );
}
