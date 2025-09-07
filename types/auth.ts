export interface User {
  id: string;
  email: string;
  name: string;
  role: 'streaming' | 'admin' | 'editor' | 'moderator';
  createdAt: Date;
  lastSignInAt?: Date;
  isActive: boolean;
  emailConfirmedAt?: Date;
  permissions: LegacyPermission[];
  createdBy?: string; // Admin who created this user
}

export interface LegacyPermission {
  id: string;
  name: string;
  description: string;
  category: 'setup' | 'streaming' | 'scoreboard' | 'moments' | 'summary' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'streaming' | 'admin' | 'editor' | 'moderator';
  permissions: string[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  username?: string;
}

export const LEGACY_ROLE_PERMISSIONS = {
  streaming: [
    { id: 'setup_access', name: 'Setup Access', description: 'Access to setup configuration', category: 'setup' },
    { id: 'stream_control', name: 'Stream Control', description: 'Control live streaming', category: 'streaming' },
  ],
  editor: [
    { id: 'setup_access', name: 'Setup Access', description: 'Access to setup configuration', category: 'setup' },
    { id: 'stream_control', name: 'Stream Control', description: 'Control live streaming', category: 'streaming' },
    { id: 'scoreboard_manage', name: 'Scoreboard Management', description: 'Manage scoreboard and scores', category: 'scoreboard' },
    { id: 'moments_control', name: 'Moments Control', description: 'Trigger and manage special moments', category: 'moments' },
  ],
  moderator: [
    { id: 'setup_access', name: 'Setup Access', description: 'Access to setup configuration', category: 'setup' },
    { id: 'stream_control', name: 'Stream Control', description: 'Control live streaming', category: 'streaming' },
    { id: 'scoreboard_manage', name: 'Scoreboard Management', description: 'Manage scoreboard and scores', category: 'scoreboard' },
  ],
  admin: [
    { id: 'setup_access', name: 'Setup Access', description: 'Access to setup configuration', category: 'setup' },
    { id: 'stream_control', name: 'Stream Control', description: 'Control live streaming', category: 'streaming' },
    { id: 'scoreboard_manage', name: 'Scoreboard Management', description: 'Manage scoreboard and scores', category: 'scoreboard' },
    { id: 'moments_control', name: 'Moments Control', description: 'Trigger and manage special moments', category: 'moments' },
    { id: 'summary_access', name: 'Summary Access', description: 'View and generate match summaries', category: 'summary' },
    { id: 'user_management', name: 'User Management', description: 'Create and manage user accounts', category: 'admin' },
  ]
} as const;

// types/auth.ts
export type Role = 'admin' | 'streaming' | 'editor' | 'moderator';

// types/auth.ts
export const DEFAULT_PERMISSIONS = {
  'users.invite': {
    id: 'users.invite',
    name: 'Invite Users',
    description: 'Can invite new users to the workspace',
    category: 'users',
  },
  'users.manage': {
    id: 'users.manage',
    name: 'Manage Users',
    description: 'Can create, update, and delete user accounts',
    category: 'users',
  },
  'roles.assign': {
    id: 'roles.assign',
    name: 'Assign Roles',
    description: 'Can assign and modify user roles',
    category: 'admin',
  },
  // add more permissions here…
} as const;

export type PermissionId = keyof typeof DEFAULT_PERMISSIONS;
export type Permission = typeof DEFAULT_PERMISSIONS[PermissionId];

// types/auth.ts
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionId[]> = {
  admin: [
    'users.invite',
    'users.manage',
    'roles.assign',
    // other admin permissions…
  ],
  editor: [
    'users.invite',
  ],
  moderator: [
    // moderator permissions
  ],
  streaming: [
    // add only what streamers should have
  ],
};

// types/auth.ts
export const getPermissionsForRole = (role: Role): PermissionId[] =>
  DEFAULT_ROLE_PERMISSIONS[role] ?? [];

// types/auth.ts
export interface AppUser {
  id: string;
  email: string;
  role: Role;            // must be 'admin' | 'streaming'
  permissions?: string[]; // optional per-user extras (if you support overrides)
}
