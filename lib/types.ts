export type WorkspaceId = 'OBM' | 'CFM';
export type Status = 'Done' | 'Full- Running' | 'Revision' | 'Waiting' | 'Pending' | 'Kishan';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | '';
export type Role = 'admin' | 'editor';
export type View = 'tracker' | 'dashboard' | 'monthly' | 'editors';

export interface Project {
  id: string;
  ws: WorkspaceId;
  cl: string;
  title: string;
  editor: string;
  status: Status;
  priority: Priority;
  d1: string;
  d2: string;
  d3: string;
  other: string;
  sort_order?: number;
}

export interface Clients {
  OBM: string[];
  CFM: string[];
}

export interface UserRecord {
  hash: string;
  role: Role;
}

export interface Users {
  [username: string]: UserRecord;
}

export interface SessionUser {
  username: string;
  role: Role;
}

export interface WorkspaceConfig {
  d1: string;
  d2: string;
  d3: string;
}
