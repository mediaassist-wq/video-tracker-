'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Project, Clients, SessionUser, WorkspaceId, View } from '@/lib/types';
import { lsGet, lsSet } from '@/lib/storage';
import { getSession, initDefaultUser } from '@/lib/auth';
import { DEFAULT_CLIENTS, SEED_PROJECTS } from '@/lib/data';

interface AppState {
  projects: Project[];
  clients: Clients;
  ws: WorkspaceId;
  selClient: string;
  view: View;
  currentUser: SessionUser | null;
  theme: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  setProjects: (p: Project[]) => void;
  setClients: (c: Clients) => void;
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
  const [ws, setWs] = useState<WorkspaceId>('OBM');
  const [selClient, setSelClient] = useState('');
  const [view, setView] = useState<View>('tracker');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [theme, setThemeRaw] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDefaultUser().then(() => {
      const session = getSession();
      setCurrentUser(session);
      const savedTheme = lsGet<string>('vt-theme', '');
      setThemeRaw(savedTheme);
      const savedProjects = lsGet<Project[]>('vt-projects-v4', []);
      const savedClients = lsGet<Clients>('vt-clients-v1', DEFAULT_CLIENTS);
      if (savedProjects.length === 0) {
        setProjectsRaw(SEED_PROJECTS);
        lsSet('vt-projects-v4', SEED_PROJECTS);
      } else {
        setProjectsRaw(savedProjects);
      }
      setClientsRaw(savedClients.OBM?.length ? savedClients : DEFAULT_CLIENTS);
      setReady(true);
    });
  }, []);

  const triggerSave = useCallback(() => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 600);
  }, []);

  const setProjects = useCallback((p: Project[]) => {
    setProjectsRaw(p);
    lsSet('vt-projects-v4', p);
    triggerSave();
  }, [triggerSave]);

  const setClients = useCallback((c: Clients) => {
    setClientsRaw(c);
    lsSet('vt-clients-v1', c);
    triggerSave();
  }, [triggerSave]);

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

  if (!ready) return null;

  return (
    <AppContext.Provider value={{
      projects, clients, ws, selClient, view, currentUser, theme, saveStatus,
      setProjects, setClients, setWs, setSelClient, setView, setCurrentUser, setTheme,
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
