'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtDate, dateStatus, STATUS_STYLES, PRIORITY_STYLES, WS_CFG, monthLabel, getProjMonth } from '@/lib/helpers';
import type { Project, Status, Priority } from '@/lib/types';
import ProjectModal from './modals/ProjectModal';
import ConfirmModal from './modals/ConfirmModal';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span className="status-pill" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
}

function DateChip({ value, isDone }: { value: string; isDone?: boolean }) {
  if (!value) return <span style={{ color: 'var(--text4)', fontSize: 12 }}>—</span>;

  const st = isDone ? 'done' : dateStatus(value);
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    done:     { bg: '#f4f4f5', color: '#71717a', border: '#e4e4e7' },
    overdue:  { bg: '#fdf2f2', color: '#b45454', border: '#f0d0d0' },
    today:    { bg: '#f0f4ff', color: '#4f6fbd', border: '#d0dcf5' },
    soon:     { bg: '#fdf8f0', color: '#a07840', border: '#eddfc0' },
    upcoming: { bg: '#f7f7f8', color: '#52525b', border: '#e4e4e7' },
  };
  const s = styles[st] || styles.upcoming;
  const label = st === 'overdue' ? '! ' : st === 'today' ? '· ' : '';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: '3px 8px', fontSize: 11,
      fontFamily: 'DM Mono, monospace', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {label}{fmtDate(value)}
    </span>
  );
}

function PriChip({ priority }: { priority: Priority }) {
  if (!priority) return null;
  const s = PRIORITY_STYLES[priority];
  return (
    <span className="pri-chip" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {priority}
    </span>
  );
}

function SortableRow({
  p, i, isAdmin, onEdit, onDelete,
}: {
  p: Project; i: number; isAdmin: boolean;
  onEdit: (p: Project) => void; onDelete: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const cfg = WS_CFG[p.ws];

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: isDragging ? 'var(--bg3)' : undefined,
      }}
    >
      <td className="mono" style={{ color: 'var(--text3)', fontSize: 11 }}>{i + 1}</td>
      <td style={{ maxWidth: 300 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.title}
        </div>
        {p.other && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--kish)', marginTop: 2 }}>{p.other}</div>
        )}
      </td>
      <td className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>{p.editor}</td>
      <td><StatusPill status={p.status} /></td>
      <td><DateChip value={p.d1} isDone={p.status === 'Done'} /></td>
      <td><DateChip value={p.d2} isDone={p.status === 'Done'} /></td>
      <td><DateChip value={p.d3} isDone={p.status === 'Done'} /></td>
      <td><PriChip priority={p.priority} /></td>
      <td>
        <div className="row-actions">
          {isAdmin && (
            <span
              {...attributes} {...listeners}
              title="Drag to reorder"
              style={{ cursor: 'grab', color: 'var(--text3)', fontSize: 14, padding: '0 2px', touchAction: 'none' }}
            >⠿</span>
          )}
          {isAdmin && <button className="icon-btn" onClick={() => onEdit(p)} title="Edit">✏️</button>}
          {isAdmin && <button className="icon-btn danger" onClick={() => onDelete(p)} title="Delete">🗑</button>}
        </div>
      </td>
    </tr>
  );
}

export default function TrackerView() {
  const { projects, setProjects, ws, selClient, setSelClient, clients, currentUser } = useApp();
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // sorted by sort_order
  const clientProjects = useMemo(() =>
    projects
      .filter(p => p.ws === ws && p.cl === selClient)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [projects, ws, selClient]
  );

  const availableMonths = useMemo(() => {
    const months = new Set(clientProjects.map(getProjMonth).filter(Boolean));
    return Array.from(months).sort().reverse();
  }, [clientProjects]);

  const filtered = useMemo(() => {
    return clientProjects.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.editor.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterPriority && p.priority !== filterPriority) return false;
      if (filterMonth && getProjMonth(p) !== filterMonth) return false;
      return true;
    });
  }, [clientProjects, search, filterStatus, filterPriority, filterMonth]);

  const isFiltering = !!(search || filterStatus || filterPriority || filterMonth);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<Status, number>> = {};
    clientProjects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [clientProjects]);

  function deleteProject(id: string) {
    setProjects(projects.filter(p => p.id !== id));
    setDeleteProj(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = clientProjects.findIndex(p => p.id === active.id);
    const newIndex = clientProjects.findIndex(p => p.id === over.id);
    const reordered = arrayMove(clientProjects, oldIndex, newIndex).map((p, i) => ({
      ...p, sort_order: i,
    }));

    // merge back into full projects list
    const updated = projects.map(p => {
      const r = reordered.find(r => r.id === p.id);
      return r ?? p;
    });
    setProjects(updated);
  }

  const statuses: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];

  return (
    <>
      <div className="content-top">
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          {selClient || 'Select a client'}
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statuses.filter(s => statusCounts[s]).map(s => {
            const st = STATUS_STYLES[s];
            return (
              <span key={s} className="status-pill" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                {s}: {statusCounts[s]}
              </span>
            );
          })}
        </div>
      </div>

      <div className="filters-bar">
        <input
          placeholder="Search title or editor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 210 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 130 }}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 120 }}>
          <option value="">All Priorities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 130 }}>
          <option value="">All Months</option>
          {availableMonths.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        {isAdmin && (
          <button className="btn btn-dark" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(true)}>
            + Add Project
          </button>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Title</th>
              <th>Editor</th>
              <th>Status</th>
              <th>{cfg.d1}</th>
              <th>{cfg.d2}</th>
              <th>{cfg.d3}</th>
              <th>Priority</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          {isFiltering ? (
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                    📭 No projects found.
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <SortableRow key={p.id} p={p} i={i} isAdmin={isAdmin} onEdit={setEditProj} onDelete={setDeleteProj} />
              ))}
            </tbody>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                        📭 No projects found.
                      </td>
                    </tr>
                  ) : filtered.map((p, i) => (
                    <SortableRow key={p.id} p={p} i={i} isAdmin={isAdmin} onEdit={setEditProj} onDelete={setDeleteProj} />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          )}
        </table>
      </div>

      {(showAdd || editProj) && (
        <ProjectModal
          project={editProj}
          onClose={() => { setShowAdd(false); setEditProj(null); }}
        />
      )}
      {deleteProj && (
        <ConfirmModal
          title="Delete Project"
          description={`Delete "${deleteProj.title}"? This cannot be undone.`}
          onConfirm={() => deleteProject(deleteProj.id)}
          onCancel={() => setDeleteProj(null)}
        />
      )}
    </>
  );
}
