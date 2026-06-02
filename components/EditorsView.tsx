'use client';
import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getProjMonth, monthLabel } from '@/lib/helpers';

function last6Months(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export default function EditorsView() {
  const { projects, editorNames, addEditorName, removeEditorName, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [newName, setNewName] = useState('');
  const [err, setErr] = useState('');
  const [selEditor, setSelEditor] = useState<string | null>(null);
  const months = last6Months();

  const editorStats = useMemo(() => {
    const map = new Map<string, { done: number; inProg: number; pend: number; total: number; monthlyDone: Record<string, number> }>();
    projects.forEach(p => {
      if (!p.editor) return;
      const names = p.editor.split(',').map(s => s.trim()).filter(Boolean);
      names.forEach(name => {
        if (!map.has(name)) map.set(name, { done: 0, inProg: 0, pend: 0, total: 0, monthlyDone: {} });
        const e = map.get(name)!;
        e.total++;
        const m = getProjMonth(p);
        if (p.status === 'Done') {
          e.done++;
          if (m) e.monthlyDone[m] = (e.monthlyDone[m] || 0) + 1;
        } else if (['Full- Running', 'Revision', 'Waiting'].includes(p.status)) e.inProg++;
        else e.pend++;
      });
    });
    return Array.from(map.entries()).map(([name, s]) => ({
      name, ...s,
      completionRate: s.total ? Math.round(s.done / s.total * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [projects]);

  const totalEditors = editorStats.length;
  const totalDone = editorStats.reduce((s, e) => s + e.done, 0);
  const totalActive = editorStats.reduce((s, e) => s + e.inProg, 0);
  const topEditor = editorStats[0];
  const maxTotal = Math.max(...editorStats.map(e => e.total), 1);

  // Monthly done trend for selected editor or all
  const trendData = useMemo(() => months.map(m => {
    if (selEditor) {
      const e = editorStats.find(x => x.name === selEditor);
      return { m, done: e?.monthlyDone[m] || 0 };
    }
    return { m, done: editorStats.reduce((s, e) => s + (e.monthlyDone[m] || 0), 0) };
  }).reverse(), [months, editorStats, selEditor]);

  const maxTrend = Math.max(...trendData.map(t => t.done), 1);

  // Projects for selected editor
  const editorProjects = useMemo(() => {
    if (!selEditor) return [];
    return projects.filter(p => p.editor.split(',').map(s => s.trim()).includes(selEditor))
      .sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));
  }, [selEditor, projects]);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) { setErr('Name is required.'); return; }
    if (editorNames.includes(name)) { setErr('Already exists.'); return; }
    await addEditorName(name);
    setNewName(''); setErr('');
  }

  return (
    <div className="views-scroll">
      <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Editors Overview</h2>
      </div>

      {/* Admin: manage editors */}
      {isAdmin && (
        <div className="section-panel" style={{ margin: '16px 16px 0' }}>
          <div className="section-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Manage Editors</span></div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newName} onChange={e => { setNewName(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Editor name" style={{ flex: 1 }} />
              <button className="btn btn-dark" onClick={handleAdd}>+ Add</button>
            </div>
            {err && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{err}</p>}
            {editorNames.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {editorNames.map(name => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>
                    <span>{name}</span>
                    <button onClick={() => removeEditorName(name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        {[
          { label: 'Total Editors', value: totalEditors },
          { label: 'Projects Done', value: totalDone, color: '#3d7a58' },
          { label: 'Active Projects', value: totalActive, color: '#4060b0' },
          { label: 'Top Editor', value: topEditor?.name || '—', small: true },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color, fontSize: k.small ? 18 : undefined }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, margin: '0 16px 16px' }}>
        {/* Per-editor breakdown */}
        <div className="section-panel" style={{ margin: 0, marginRight: 8 }}>
          <div className="section-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Per-Editor Breakdown</span></div>
          <table>
            <thead>
              <tr><th>Editor</th><th>Total</th><th>Done</th><th>Active</th><th>Pending</th><th>Rate</th></tr>
            </thead>
            <tbody>
              {editorStats.map(e => (
                <tr key={e.name} style={{ cursor: 'pointer', background: selEditor === e.name ? 'var(--bg3)' : undefined }} onClick={() => setSelEditor(selEditor === e.name ? null : e.name)}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td className="mono">{e.total}</td>
                  <td className="mono" style={{ color: '#3d7a58' }}>{e.done}</td>
                  <td className="mono" style={{ color: '#4060b0' }}>{e.inProg}</td>
                  <td className="mono" style={{ color: 'var(--pend)' }}>{e.pend}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 40, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${e.completionRate}%`, height: '100%', background: '#3d7a58', borderRadius: 2 }} />
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{e.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Workload chart */}
        <div className="section-panel" style={{ margin: 0, marginLeft: 8 }}>
          <div className="section-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Workload Chart</span></div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {editorStats.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 72, fontSize: 12, fontWeight: 500, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                <div style={{ flex: 1, height: 18, display: 'flex', borderRadius: 4, overflow: 'hidden', background: 'var(--bg4)' }}>
                  <div style={{ width: `${Math.round(e.done / maxTotal * 100)}%`, background: '#3d7a58', minWidth: e.done ? 3 : 0 }} />
                  <div style={{ width: `${Math.round(e.inProg / maxTotal * 100)}%`, background: '#4060b0', minWidth: e.inProg ? 3 : 0 }} />
                  <div style={{ width: `${Math.round(e.pend / maxTotal * 100)}%`, background: '#d4d4d8', minWidth: e.pend ? 3 : 0 }} />
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', width: 20, textAlign: 'right' }}>{e.total}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {[['#3d7a58', 'Done'], ['#4060b0', 'Active'], ['#d4d4d8', 'Pending']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                  <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Monthly Done Trend {selEditor ? `— ${selEditor}` : '(All Editors)'}
          </span>
          {selEditor && <button className="btn" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setSelEditor(null)}>Show All</button>}
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'flex-end', height: 130 }}>
          {trendData.map(t => (
            <div key={t.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{t.done || ''}</span>
              <div style={{ width: '100%', background: t.done ? '#111827' : 'var(--bg4)', borderRadius: 4, height: `${Math.max(Math.round(t.done / maxTrend * 80), t.done ? 8 : 4)}px`, transition: 'height .3s' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{monthLabel(t.m).slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected editor projects */}
      {selEditor && editorProjects.length > 0 && (
        <div className="section-panel">
          <div className="section-header">
            <span style={{ fontSize: 13, fontWeight: 600 }}>{selEditor}'s Projects ({editorProjects.length})</span>
          </div>
          <table>
            <thead><tr><th>#</th><th>Title</th><th>Client</th><th>WS</th><th>Status</th><th>Priority</th></tr></thead>
            <tbody>
              {editorProjects.map((p, i) => (
                <tr key={p.id}>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{p.cl}</td>
                  <td><span style={{ background: 'var(--bg4)', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontFamily: 'DM Mono,monospace' }}>{p.ws}</span></td>
                  <td><span style={{ fontSize: 12 }}>{p.status}</span></td>
                  <td>{p.priority && <span style={{ fontSize: 11, fontWeight: 700 }}>{p.priority}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
