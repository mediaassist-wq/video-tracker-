'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AddClientModal from './modals/AddClientModal';
import ConfirmModal from './modals/ConfirmModal';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableClient({
  cl, isActive, isAdmin, count, onSelect, onDelete,
}: {
  cl: string; isActive: boolean; isAdmin: boolean; count: number;
  onSelect: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cl });
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex', alignItems: 'center', marginBottom: 2,
        borderRadius: 'var(--r)', overflow: 'hidden',
        transform: CSS.Transform.toString(transform),
        transition, opacity: isDragging ? 0.4 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isAdmin && (
        <span
          {...attributes} {...listeners}
          style={{ cursor: 'grab', color: 'var(--text3)', fontSize: 14, padding: '0 4px', touchAction: 'none', flexShrink: 0 }}
          title="Drag to reorder"
        >⠿</span>
      )}
      <button
        onClick={onSelect}
        style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 4, padding: '6px 8px',
          border: 'none', borderRadius: 'var(--r)',
          background: isActive ? 'var(--accent)' : hovered ? 'var(--bg4)' : 'transparent',
          color: isActive ? '#fff' : 'var(--text)',
          fontSize: 13, textAlign: 'left', cursor: 'pointer', transition: 'all .1s', overflow: 'hidden',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
          {cl}
        </span>
        <span style={{
          flexShrink: 0,
          background: isActive ? 'rgba(255,255,255,.2)' : 'var(--bg5)',
          color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--text3)',
          borderRadius: 10, padding: '0 5px', fontSize: 10, minWidth: 18,
          textAlign: 'center', fontFamily: 'DM Mono, monospace',
        }}>{count}</span>
      </button>
      {isAdmin && (
        <button
          className="icon-btn danger"
          style={{
            flexShrink: 0, opacity: hovered ? 1 : 0, marginLeft: 2,
            fontSize: 11, padding: '4px 5px', transition: 'opacity .15s',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Remove client"
        >✕</button>
      )}
    </div>
  );
}

export default function Sidebar({ onClientSelect, isOpen }: { onClientSelect?: () => void; isOpen?: boolean }) {
  const { ws, clients, setClients, reorderClients, projects, selClient, setSelClient, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const list = clients[ws] || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function countForClient(cl: string) {
    return projects.filter(p => p.ws === ws && p.cl === cl).length;
  }

  function removeClient(cl: string) {
    const updated = { ...clients, [ws]: clients[ws].filter(c => c !== cl) };
    setClients(updated);
    if (selClient === cl) setSelClient(updated[ws][0] || '');
    setDeleteTarget(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.indexOf(active.id as string);
    const newIndex = list.indexOf(over.id as string);
    reorderClients(ws, arrayMove(list, oldIndex, newIndex));
  }

  return (
    <>
      <div className={`sidebar${isOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
          <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text3)' }}>
            {ws} Clients
          </span>
          {isAdmin && (
            <button className="btn" style={{ fontSize: 11, padding: '2px 7px' }} onClick={() => setShowAdd(true)}>
              + Add
            </button>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={list} strategy={verticalListSortingStrategy}>
            {list.map(cl => (
              <SortableClient
                key={cl} cl={cl}
                isActive={selClient === cl}
                isAdmin={isAdmin}
                count={countForClient(cl)}
                onSelect={() => { setSelClient(cl); onClientSelect?.(); }}
                onDelete={() => setDeleteTarget(cl)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {list.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 4px' }}>No clients yet.</p>
        )}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      {deleteTarget && (
        <ConfirmModal
          title="Remove Client"
          description={`Remove "${deleteTarget}" from ${ws}? Projects will remain.`}
          onConfirm={() => removeClient(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
