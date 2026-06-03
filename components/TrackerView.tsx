'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtDate, dateStatus, STATUS_STYLES, PRIORITY_STYLES, WS_CFG, monthLabel, getProjMonth } from '@/lib/helpers';
import type { Project, Status, Priority } from '@/lib/types';
import ProjectModal from './modals/ProjectModal';
import ProjectDetailModal from './modals/ProjectDetailModal';
import ConfirmModal from './modals/ConfirmModal';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { generateId } from '@/lib/helpers';

const STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return <span className="status-pill" style={{ background: s.bg, color: s.color, borderColor: s.border }}>{status}</span>;
}

function PriChip({ priority }: { priority: Priority }) {
  if (!priority) return null;
  const s = PRIORITY_STYLES[priority];
  return <span className="pri-chip" style={{ background: s.bg, color: s.color, borderColor: s.border }}>{priority}</span>;
}

function DateChip({ value, isDone }: { value: string; isDone?: boolean }) {
  if (!value) return <span style={{ color: 'var(--text4)', fontSize: 12 }}>—</span>;
  const st = isDone ? 'done' : dateStatus(value);

  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    done:     { bg: 'rgba(255,255,255,0.04)', color: 'var(--text3)',          border: 'rgba(255,255,255,0.06)' },
    overdue:  { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',               border: 'rgba(239,68,68,0.25)'   },
    today:    { bg: 'rgba(124,111,247,0.18)', color: '#a89cff',               border: 'rgba(124,111,247,0.35)' },
    soon:     { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24',               border: 'rgba(251,191,36,0.25)'  },
    upcoming: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text2)',          border: 'rgba(255,255,255,0.10)' },
  };
  const c = cfg[st] || cfg.upcoming;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 6, padding: '3px 8px',
      fontSize: 11, fontFamily: 'DM Mono, monospace',
      fontWeight: 500, whiteSpace: 'nowrap',
      backdropFilter: 'blur(4px)',
    }}>
      {fmtDate(value)}
    </span>
  );
}

const ALL_COLS = ['title', 'editor', 'status', 'dates', 'priority'] as const;
type Col = typeof ALL_COLS[number];

function SortableRow({ p, i, isAdmin, selected, onSelect, onEdit, onDelete, onDetail, onDuplicate, visibleCols, cfg }: {
  p: Project; i: number; isAdmin: boolean; selected: boolean;
  onSelect: () => void; onEdit: () => void; onDelete: () => void; onDetail: () => void; onDuplicate: () => void;
  visibleCols: Set<Col>; cfg: { d1: string; d2: string; d3: string };
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, background: selected ? 'rgba(17,24,39,0.04)' : undefined, cursor: 'pointer' }}
      onClick={onDetail}
    >
      {isAdmin && (
        <td onClick={e => e.stopPropagation()} style={{ width: 36, paddingLeft: 8 }}>
          <input type="checkbox" checked={selected} onChange={onSelect} style={{ cursor: 'pointer' }} />
        </td>
      )}
      <td className="mono" style={{ color: 'var(--text3)', fontSize: 11, width: 36 }}>{i + 1}</td>
      {visibleCols.has('title') && (
        <td style={{ maxWidth: 280 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
          {p.other && <div className="mono" style={{ fontSize: 10, color: 'var(--kish)', marginTop: 2 }}>{p.other}</div>}
        </td>
      )}
      {visibleCols.has('editor') && <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>{p.editor || '—'}</td>}
      {visibleCols.has('status') && <td><StatusPill status={p.status} /></td>}
      {visibleCols.has('dates') && <>
        <td><DateChip value={p.d1} isDone={p.status === 'Done'} /></td>
        <td><DateChip value={p.d2} isDone={p.status === 'Done'} /></td>
        <td><DateChip value={p.d3} isDone={p.status === 'Done'} /></td>
      </>}
      {visibleCols.has('priority') && <td><PriChip priority={p.priority} /></td>}
      <td onClick={e => e.stopPropagation()}>
        <div className="row-actions">
          {isAdmin && <span {...attributes} {...listeners} title="Drag" style={{ cursor: 'grab', color: 'var(--text3)', fontSize: 14, padding: '0 2px', touchAction: 'none' }}>⠿</span>}
          {isAdmin && <button className="icon-btn" onClick={onEdit} title="Edit">✏️</button>}
          {isAdmin && <button className="icon-btn" onClick={onDuplicate} title="Duplicate">⧉</button>}
          {isAdmin && <button className="icon-btn danger" onClick={onDelete} title="Delete">🗑</button>}
        </div>
      </td>
    </tr>
  );
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const escape = (s: string) => s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function TrackerView() {
  const { projects, setProjects, ws, selClient, setSelClient, clients, currentUser, logActivity, comments } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const cfg = WS_CFG[ws];

  useEffect(() => {
    const list = clients[ws] || [];
    if (!selClient || !list.includes(selClient)) setSelClient(list[0] || '');
  }, [ws, clients]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [deleteProj, setDeleteProj] = useState<Project | null>(null);
  const [detailProj, setDetailProj] = useState<Project | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status | ''>('');
  const [visibleCols, setVisibleCols] = useState<Set<Col>>(new Set(ALL_COLS));
  const [showColMenu, setShowColMenu] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const clientProjects = useMemo(() =>
    projects.filter(p => p.ws === ws && p.cl === selClient).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [projects, ws, selClient]);

  const availableMonths = useMemo(() => {
    const months = new Set(clientProjects.map(getProjMonth).filter(Boolean));
    return Array.from(months).sort().reverse();
  }, [clientProjects]);

  const filtered = useMemo(() => clientProjects.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.editor.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterPriority && p.priority !== filterPriority) return false;
    if (filterMonth && getProjMonth(p) !== filterMonth) return false;
    return true;
  }), [clientProjects, search, filterStatus, filterPriority, filterMonth]);

  const isFiltering = !!(search || filterStatus || filterPriority || filterMonth);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<Status, number>> = {};
    clientProjects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [clientProjects]);

  const overdueCount = useMemo(() =>
    clientProjects.filter(p => p.status !== 'Done' && (dateStatus(p.d3 || p.d2 || p.d1) === 'overdue')).length,
    [clientProjects]);

  function deleteProject(id: string) {
    const p = projects.find(x => x.id === id);
    setProjects(projects.filter(p => p.id !== id));
    if (p) logActivity('Delete Project', `"${p.title}" (${ws}/${p.cl})`);
    setDeleteProj(null);
  }

  function duplicateProject(p: Project) {
    const copy = { ...p, id: generateId(), title: p.title + ' (copy)', sort_order: (p.sort_order ?? 0) + 0.5 };
    setProjects([...projects, copy]);
    logActivity('Duplicate Project', `"${p.title}" → "${copy.title}"`);
  }

  function applyBulkStatus() {
    if (!bulkStatus || selected.size === 0) return;
    const updated = projects.map(p => selected.has(p.id) ? { ...p, status: bulkStatus as Status } : p);
    setProjects(updated);
    logActivity('Bulk Status Change', `${selected.size} projects → "${bulkStatus}"`);
    setSelected(new Set());
    setBulkStatus('');
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function toggleSelectAll() {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)));
  }

  function handleExport() {
    const headers = ['#', 'Client', 'Title', 'Editor', 'Status', 'Priority', cfg.d1, cfg.d2, cfg.d3, 'Note'];
    const rows = filtered.map((p, i) => [String(i + 1), p.cl, p.title, p.editor, p.status, p.priority, p.d1, p.d2, p.d3, p.other]);
    downloadCSV(`${ws}-${selClient}-projects.csv`, rows, headers);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = clientProjects.findIndex(p => p.id === active.id);
    const newIndex = clientProjects.findIndex(p => p.id === over.id);
    const reordered = arrayMove(clientProjects, oldIndex, newIndex).map((p, i) => ({ ...p, sort_order: i }));
    const updated = projects.map(p => { const r = reordered.find(r => r.id === p.id); return r ?? p; });
    setProjects(updated);
  }

  function toggleCol(col: Col) {
    setVisibleCols(prev => { const s = new Set(prev); s.has(col) ? s.delete(col) : s.add(col); return s; });
  }

  const colSpan = 2 + (isAdmin ? 1 : 0) + (visibleCols.has('title') ? 1 : 0) + (visibleCols.has('editor') ? 1 : 0) + (visibleCols.has('status') ? 1 : 0) + (visibleCols.has('dates') ? 3 : 0) + (visibleCols.has('priority') ? 1 : 0);

  const tableBody = (items: Project[]) => (
    <tbody>
      {items.length === 0 ? (
        <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>📭 No projects found.</td></tr>
      ) : items.map((p, i) => (
        <SortableRow
          key={p.id} p={p} i={i} isAdmin={isAdmin}
          selected={selected.has(p.id)}
          onSelect={() => toggleSelect(p.id)}
          onEdit={() => setEditProj(p)}
          onDelete={() => setDeleteProj(p)}
          onDetail={() => setDetailProj(p)}
          onDuplicate={() => duplicateProject(p)}
          visibleCols={visibleCols} cfg={cfg}
        />
      ))}
    </tbody>
  );

  return (
    <>
      <div className="content-top">
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          {selClient || 'Select a client'}
          {overdueCount > 0 && (
            <span style={{ marginLeft: 10, background: '#fdf2f2', color: '#e05252', border: '1px solid #f0d0d0', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
              {overdueCount} overdue
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.filter(s => statusCounts[s]).map(s => {
            const st = STATUS_STYLES[s];
            return <span key={s} className="status-pill" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{s}: {statusCounts[s]}</span>;
          })}
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <input placeholder="Search title or editor…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 130 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 110 }}>
          <option value="">All Priorities</option>
          <option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 120 }}>
          <option value="">All Months</option>
          {availableMonths.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {/* Column toggle */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => setShowColMenu(v => !v)}>Columns ▾</button>
            {showColMenu && (
              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#1e1a35', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, zIndex: 50, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ALL_COLS.map(col => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={visibleCols.has(col)} onChange={() => toggleCol(col)} />
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn" style={{ fontSize: 12 }} onClick={handleExport}>↓ CSV</button>
          {isAdmin && <button className="btn btn-dark" onClick={() => setShowAdd(true)}>+ Add Project</button>}
        </div>
      </div>

      {/* Bulk action bar */}
      {isAdmin && selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#f0f4ff', borderBottom: '1px solid #c5d0f0' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value as Status)} style={{ width: 150 }}>
            <option value="">Change status to…</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-dark" style={{ fontSize: 12 }} onClick={applyBulkStatus} disabled={!bulkStatus}>Apply</button>
          <button className="btn" style={{ fontSize: 12 }} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      <div className="table-wrap" onClick={() => setShowColMenu(false)}>
        <table>
          <thead>
            <tr>
              {isAdmin && (
                <th style={{ width: 36, paddingLeft: 8 }}>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selected.size === filtered.length && filtered.length > 0} style={{ cursor: 'pointer' }} />
                </th>
              )}
              <th style={{ width: 36 }}>#</th>
              {visibleCols.has('title') && <th>Title</th>}
              {visibleCols.has('editor') && <th>Editor</th>}
              {visibleCols.has('status') && <th>Status</th>}
              {visibleCols.has('dates') && <><th>{cfg.d1}</th><th>{cfg.d2}</th><th>{cfg.d3}</th></>}
              {visibleCols.has('priority') && <th>Priority</th>}
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>

          {isFiltering ? tableBody(filtered) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {tableBody(filtered)}
              </SortableContext>
            </DndContext>
          )}
        </table>
      </div>

      {/* Row actions: duplicate (outside table for cleaner code) */}
      {filtered.map(p => (
        <div key={`dup-${p.id}`} style={{ display: 'none' }} />
      ))}

      {(showAdd || editProj) && (
        <ProjectModal project={editProj} onClose={() => { setShowAdd(false); setEditProj(null); }} />
      )}
      {deleteProj && (
        <ConfirmModal
          title="Delete Project"
          description={`Delete "${deleteProj.title}"? This cannot be undone.`}
          onConfirm={() => deleteProject(deleteProj.id)}
          onCancel={() => setDeleteProj(null)}
        />
      )}
      {detailProj && (
        <ProjectDetailModal
          project={detailProj}
          onClose={() => setDetailProj(null)}
          onEdit={() => { setEditProj(detailProj); setDetailProj(null); }}
        />
      )}
    </>
  );
}
