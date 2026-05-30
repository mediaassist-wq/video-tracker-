'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function EditorsView() {
  const { projects } = useApp();

  const editors = useMemo(() => {
    const map = new Map<string, { done: number; inProg: number; pend: number; total: number }>();
    projects.forEach(p => {
      if (!p.editor) return;
      if (!map.has(p.editor)) map.set(p.editor, { done: 0, inProg: 0, pend: 0, total: 0 });
      const e = map.get(p.editor)!;
      e.total++;
      if (p.status === 'Done') e.done++;
      else if (['Full- Running','Revision','Waiting'].includes(p.status)) e.inProg++;
      else e.pend++;
    });
    return Array.from(map.entries()).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.total - a.total);
  }, [projects]);

  const totalEditors = editors.length;
  const totalDone = editors.reduce((s, e) => s + e.done, 0);
  const totalActive = editors.reduce((s, e) => s + e.inProg, 0);
  const avgPerEditor = totalEditors ? Math.round(editors.reduce((s, e) => s + e.total, 0) / totalEditors) : 0;
  const maxTotal = Math.max(...editors.map(e => e.total), 1);

  return (
    <div className="views-scroll">
      <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Editors Overview</h2>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Total Editors', value: totalEditors },
          { label: 'Projects Done', value: totalDone, color: 'var(--done)' },
          { label: 'Active Projects', value: totalActive, color: 'var(--run)' },
          { label: 'Avg per Editor', value: avgPerEditor },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Per-Editor Breakdown</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Editor</th><th>Total</th><th>Done</th><th>In Progress</th><th>Pending</th><th>Done %</th>
            </tr>
          </thead>
          <tbody>
            {editors.map(e => (
              <tr key={e.name}>
                <td style={{ fontWeight: 500 }}>{e.name}</td>
                <td className="mono">{e.total}</td>
                <td className="mono" style={{ color: 'var(--done)' }}>{e.done}</td>
                <td className="mono" style={{ color: 'var(--run)' }}>{e.inProg}</td>
                <td className="mono" style={{ color: 'var(--pend)' }}>{e.pend}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 60, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${e.total ? Math.round(e.done/e.total*100) : 0}%`, height: '100%', background: 'var(--done)', borderRadius: 3 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {e.total ? Math.round(e.done/e.total*100) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Workload Chart</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {editors.map(e => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 80, fontSize: 12, fontWeight: 500, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
              <div style={{ flex: 1, height: 20, display: 'flex', borderRadius: 4, overflow: 'hidden', background: 'var(--bg4)' }}>
                <div style={{ width: `${Math.round(e.done/maxTotal*100)}%`, background: 'var(--done)', minWidth: e.done ? 3 : 0 }} />
                <div style={{ width: `${Math.round(e.inProg/maxTotal*100)}%`, background: 'var(--run)', minWidth: e.inProg ? 3 : 0 }} />
                <div style={{ width: `${Math.round(e.pend/maxTotal*100)}%`, background: 'var(--pend)', minWidth: e.pend ? 3 : 0 }} />
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', width: 24, textAlign: 'right' }}>{e.total}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {[['var(--done)', 'Done'], ['var(--run)', 'In Progress'], ['var(--pend)', 'Pending']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
