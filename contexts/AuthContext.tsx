import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, CreateUserRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  hasPermission: (permissionId: string) => boolean;
  isAdmin: () => boolean;
  isStreamer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session on app start
    const checkExistingSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        }
      } catch (error) {
        console.log('No existing session found');
      }
    };

    checkExistingSession();

    // Listen for auth state changes (including email verification)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user just verified their email
          if (session.user.email_confirmed_at && session.user.aud === 'authenticated') {
            try {
              const user = await authService.getCurrentUser();
              if (user) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: user });
              }
            } catch (error) {
              console.error('Error after email verification:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const result = await authService.register(userData);
      dispatch({ type: 'CLEAR_ERROR' });
      return result;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: (error as Error).message });
      throw error;
    }
  };


  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const createUser = async (userData: CreateUserRequest) => {
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('Only admin users can create new accounts');
    }
    return authService.createUser(userData);
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('Only admin users can update accounts');
    }
    return authService.updateUser(userId, updates);
  };

  const deleteUser = async (userId: string) => {
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('Only admin users can delete accounts');
    }
    return authService.deleteUser(userId);
  };

  const getAllUsers = async () => {
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('Only admin users can view all accounts');
    }
    return authService.getAllUsers();
  };

  const hasPermission = (permissionId: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.some(p => p.id === permissionId);
  };

  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false;
  };

  const isStreamer = (): boolean => {
    return state.user?.role === 'streaming' || false;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        createUser,
        updateUser,
        deleteUser,
        getAllUsers,
        hasPermission,
        isAdmin,
        isStreamer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
// contexts/AuthContext.tsx (or hooks/useAuth.ts)
import { createContext, useContext, useMemo } from 'react';
import {
  AppUser,
  Role,
  PermissionId,
  getPermissionsForRole,
} from '@/types/auth';

type AuthContextValue = {
  user: AppUser | null;
  isAdmin: () => boolean;
  isStreamer: () => boolean;
  hasPermission: (id: PermissionId) => boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: () => false,
  isStreamer: () => false,
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

// Example provider (adapt to your auth loading logic)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // wire this to your Supabase session -> AppUser (role included)
  const user: AppUser | null = /* …get current user… */ null;

  const isAdmin = () => user?.role === 'admin';
  const isStreamer = () => user?.role === 'streaming';

  // role-based permissions
  const rolePerms = useMemo<PermissionId[]>(
    () => (user ? getPermissionsForRole(user.role as Role) : []),
    [user?.role]
  );

  // optional: merge in any per-user overrides you store (string[])
  const effectivePerms = useMemo<Set<string>>(() => {
    const extras = (user?.permissions ?? []) as string[];
    return new Set<string>([...rolePerms, ...extras]);
  }, [rolePerms, user?.permissions]);

  const hasPermission = (id: PermissionId) => effectivePerms.has(id);

  const value: AuthContextValue = {
    user,
    isAdmin,
    isStreamer,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
