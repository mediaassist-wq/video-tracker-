'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { generateId, WS_CFG } from '@/lib/helpers';
import type { Project, WorkspaceId, Status, Priority } from '@/lib/types';

interface Props {
  project?: Project | null;
  onClose: () => void;
}

const STATUSES: Status[] = ['Done', 'Full- Running', 'Revision', 'Waiting', 'Pending', 'Kishan'];
const PRIORITIES: Priority[] = ['', 'HIGH', 'MEDIUM', 'LOW'];

export default function ProjectModal({ project, onClose }: Props) {
  const { projects, setProjects, clients, editorNames, ws: globalWs, selClient } = useApp();

  const [ws, setWs] = useState<WorkspaceId>(project?.ws || globalWs);
  const [cl, setCl] = useState(project?.cl || selClient || clients[globalWs][0] || '');
  const [title, setTitle] = useState(project?.title || '');
  // editors stored as comma-separated string; only keep names that exist in editorNames list
  const [selectedEditors, setSelectedEditors] = useState<string[]>(
    project?.editor
      ? project.editor.split(',').map(s => s.trim()).filter(s => editorNames.includes(s))
      : []
  );
  const [status, setStatus] = useState<Status>(project?.status || 'Pending');
  const [priority, setPriority] = useState<Priority>(project?.priority || '');
  const [d1, setD1] = useState(project?.d1 || '');
  const [d2, setD2] = useState(project?.d2 || '');
  const [d3, setD3] = useState(project?.d3 || '');
  const [other, setOther] = useState(project?.other || '');
  const [error, setError] = useState('');

  const cfg = WS_CFG[ws];
  const clientList = clients[ws] || [];

  function toggleEditor(name: string) {
    setSelectedEditors(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  }

  function save() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!cl) { setError('Client is required.'); return; }

    const editor = selectedEditors.join(', ');

    if (project) {
      setProjects(projects.map(p => p.id === project.id
        ? { ...p, ws, cl, title, editor, status, priority, d1, d2, d3, other }
        : p
      ));
    } else {
      setProjects([...projects, { id: generateId(), ws, cl, title, editor, status, priority, d1, d2, d3, other }]);
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 15, fontWeight: 600 }}>{project ? 'Edit Project' : 'Add Project'}</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Workspace</label>
              <select value={ws} onChange={e => { setWs(e.target.value as WorkspaceId); setCl(clients[e.target.value as WorkspaceId][0] || ''); }}>
                <option value="OBM">OBM</option>
                <option value="CFM">CFM</option>
              </select>
            </div>
            <div className="form-group">
              <label>Client</label>
              <select value={cl} onChange={e => setCl(e.target.value)}>
                {clientList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group full-span">
              <label>Video / Project Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" autoFocus />
            </div>

            {/* Multi-editor selector */}
            <div className="form-group full-span">
              <label>Editor(s)</label>
              {editorNames.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>
                  No editors added yet. Go to Editors tab to add editors.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {editorNames.map(name => {
                    const selected = selectedEditors.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleEditor(name)}
                        style={{
                          padding: '4px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          background: selected ? 'var(--accent)' : 'var(--bg3)',
                          color: selected ? '#fff' : 'var(--text)',
                          fontWeight: selected ? 600 : 400,
                          transition: 'all 0.15s',
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedEditors.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '6px 0 0' }}>
                  Selected: {selectedEditors.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Status)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p || '—'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{cfg.d1} Date</label>
              <input type="date" value={d1} onChange={e => setD1(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{cfg.d2} Date</label>
              <input type="date" value={d2} onChange={e => setD2(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{cfg.d3} Date</label>
              <input type="date" value={d3} onChange={e => setD3(e.target.value)} />
            </div>
            <div className="form-group full-span">
              <label>Note</label>
              <input value={other} onChange={e => setOther(e.target.value)} placeholder="Special notes (optional)" />
            </div>
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-dark" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
