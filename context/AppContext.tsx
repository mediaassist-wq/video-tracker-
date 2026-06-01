'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Project, Clients, SessionUser, WorkspaceId, View } from '@/lib/types';
import { lsGet, lsSet } from '@/lib/storage';
import { getSession, initDefaultUser, logout } from '@/lib/auth';
import { DEFAULT_CLIENTS, SEED_PROJECTS } from '@/lib/data';
import { supabase } from '@/lib/supabase';

interface AppState {
  projects: Project[];
  clients: Clients;
  editorNames: string[];
  ws: WorkspaceId;
  selClient: string;
  view: View;
  currentUser: SessionUser | null;
  theme: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  setProjects: (p: Project[]) => Promise<void>;
  setClients: (c: Clients) => Promise<void>;
  addEditorName: (name: string) => Promise<void>;
  removeEditorName: (name: string) => Promise<void>;
  setWs: (w: WorkspaceId) => void;
  setSelClient: (c: string) => void;
  setView: (v: View) => void;
  setCurrentUser: (u: SessionUser | null) => void;
  setTheme: (t: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjectsRaw] = useState<Project[]>([]);
  const [clients, setClientsRaw] = useState<Clients>({ OBM: [], CFM: [] });
  const [editorNames, setEditorNames] = useState<string[]>([]);
  const [ws, setWs] = useState<WorkspaceId>('OBM');
  const [selClient, setSelClient] = useState('');
  const [view, setView] = useState<View>('tracker');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [theme, setThemeRaw] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const projectsRef = useRef<Project[]>([]);
  const clientsRef = useRef<Clients>({ OBM: [], CFM: [] });

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { clientsRef.current = clients; }, [clients]);

  const triggerSave = useCallback(() => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 600);
  }, []);

  // ── Load initial data from Supabase ──────────────────────────────────────
  useEffect(() => {
    initDefaultUser().then(async () => {
      const session = getSession();
      setCurrentUser(session);

      const savedTheme = lsGet<string>('vt-theme', '');
      setThemeRaw(savedTheme);

      const { data: dbProjects } = await supabase.from('projects').select('*');
      const { data: dbClients } = await supabase.from('clients').select('*');
      const { data: dbEditors } = await supabase.from('editors').select('*');

      if (!dbProjects || dbProjects.length === 0) {
        await supabase.from('projects').insert(SEED_PROJECTS);
        setProjectsRaw(SEED_PROJECTS);
        projectsRef.current = SEED_PROJECTS;
      } else {
        setProjectsRaw(dbProjects as Project[]);
        projectsRef.current = dbProjects as Project[];
      }

      if (!dbClients || dbClients.length === 0) {
        const rows = [
          ...DEFAULT_CLIENTS.OBM.map(name => ({ ws: 'OBM', name })),
          ...DEFAULT_CLIENTS.CFM.map(name => ({ ws: 'CFM', name })),
        ];
        await supabase.from('clients').insert(rows);
        setClientsRaw(DEFAULT_CLIENTS);
        clientsRef.current = DEFAULT_CLIENTS;
      } else {
        const built: Clients = { OBM: [], CFM: [] };
        (dbClients as { ws: string; name: string }[]).forEach(r => {
          if (r.ws === 'OBM') built.OBM.push(r.name);
          else if (r.ws === 'CFM') built.CFM.push(r.name);
        });
        setClientsRaw(built);
        clientsRef.current = built;
      }

      if (dbEditors) {
        setEditorNames((dbEditors as { name: string }[]).map(e => e.name).sort());
      }

      setReady(true);
    });
  }, []);

  // ── Real-time subscriptions ───────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    const projectsSub = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => {
        if (payload.eventType === 'INSERT') {
          setProjectsRaw(prev => {
            if (prev.find(p => p.id === (payload.new as Project).id)) return prev;
            return [...prev, payload.new as Project];
          });
        } else if (payload.eventType === 'UPDATE') {
          setProjectsRaw(prev => prev.map(p => p.id === (payload.new as Project).id ? payload.new as Project : p));
        } else if (payload.eventType === 'DELETE') {
          setProjectsRaw(prev => prev.filter(p => p.id !== (payload.old as Project).id));
        }
      })
      .subscribe();

    const clientsSub = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        supabase.from('clients').select('*').then(({ data }) => {
          if (!data) return;
          const built: Clients = { OBM: [], CFM: [] };
          (data as { ws: string; name: string }[]).forEach(r => {
            if (r.ws === 'OBM') built.OBM.push(r.name);
            else if (r.ws === 'CFM') built.CFM.push(r.name);
          });
          setClientsRaw(built);
          clientsRef.current = built;
        });
      })
      .subscribe();

    const editorsSub = supabase
      .channel('editors-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'editors' }, () => {
        supabase.from('editors').select('*').then(({ data }) => {
          if (!data) return;
          setEditorNames((data as { name: string }[]).map(e => e.name).sort());
        });
      })
      .subscribe();

    const usersSub = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, payload => {
        const session = getSession();
        if (session && (payload.old as { username: string }).username === session.username) {
          logout();
          setCurrentUser(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSub);
      supabase.removeChannel(clientsSub);
      supabase.removeChannel(editorsSub);
      supabase.removeChannel(usersSub);
    };
  }, [ready]);

  // ── setProjects ───────────────────────────────────────────────────────────
  const setProjects = useCallback(async (newProjects: Project[]) => {
    const old = projectsRef.current;
    const oldMap = new Map(old.map(p => [p.id, p]));
    const newMap = new Map(newProjects.map(p => [p.id, p]));

    const toDelete = old.filter(p => !newMap.has(p.id));
    const toInsert = newProjects.filter(p => !oldMap.has(p.id));
    const toUpdate = newProjects.filter(p => {
      if (!oldMap.has(p.id)) return false;
      return JSON.stringify(oldMap.get(p.id)) !== JSON.stringify(p);
    });

    setProjectsRaw(newProjects);
    projectsRef.current = newProjects;
    triggerSave();

    for (const p of toDelete) await supabase.from('projects').delete().eq('id', p.id);
    for (const p of toInsert) await supabase.from('projects').insert(p);
    for (const p of toUpdate) await supabase.from('projects').update(p).eq('id', p.id);
  }, [triggerSave]);

  // ── setClients ────────────────────────────────────────────────────────────
  const setClients = useCallback(async (newClients: Clients) => {
    const old = clientsRef.current;
    const wsKeys: WorkspaceId[] = ['OBM', 'CFM'];

    setClientsRaw(newClients);
    clientsRef.current = newClients;
    triggerSave();

    for (const w of wsKeys) {
      const oldList = old[w] || [];
      const newList = newClients[w] || [];
      const deleted = oldList.filter(n => !newList.includes(n));
      const added = newList.filter(n => !oldList.includes(n));
      for (const name of deleted) await supabase.from('clients').delete().eq('ws', w).eq('name', name);
      for (const name of added) await supabase.from('clients').insert({ ws: w, name });
    }
  }, [triggerSave]);

  // ── editors ───────────────────────────────────────────────────────────────
  const addEditorName = useCallback(async (name: string) => {
    await supabase.from('editors').insert({ name });
    setEditorNames(prev => [...prev, name].sort());
  }, []);

  const removeEditorName = useCallback(async (name: string) => {
    await supabase.from('editors').delete().eq('name', name);
    setEditorNames(prev => prev.filter(n => n !== name));
  }, []);

  const setTheme = useCallback((t: string) => {
    setThemeRaw(prev => {
      if (typeof document !== 'undefined') {
        if (prev) document.documentElement.classList.remove(prev);
        if (t) document.documentElement.classList.add(t);
      }
      return t;
    });
    lsSet('vt-theme', t);
  }, []);

  if (!ready) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
      Loading…
    </div>
  );

  return (
    <AppContext.Provider value={{
      projects, clients, editorNames, ws, selClient, view, currentUser, theme, saveStatus,
      setProjects, setClients, addEditorName, removeEditorName, setWs, setSelClient, setView, setCurrentUser, setTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
