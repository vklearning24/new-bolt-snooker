export interface User {
  id: string;
  email: string;
  name: string;
  role: 'streaming' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  isVerified: boolean;
  permissions: Permission[];
  createdBy?: string; // Admin who created this user
}

export interface Permission {
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
  loginType: 'streaming' | 'admin';
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'streaming' | 'admin';
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

export const DEFAULT_PERMISSIONS = {
  streaming: [
    { id: 'setup_access', name: 'Setup Access', description: 'Access to setup configuration', category: 'setup' },
    { id: 'stream_control', name: 'Stream Control', description: 'Control live streaming', category: 'streaming' },
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