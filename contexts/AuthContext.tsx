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
  getAuditLogs: () => Promise<any[]>;
  hasPermission: (permissionId: string) => boolean;
  isAdmin: () => boolean;
  isStreamer: () => boolean;
  isContributor: () => boolean;
  isEditor: () => boolean;
  isModerator: () => boolean;
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
    return authService.createUser(userData);
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    return authService.updateUser(userId, updates);
  };

  const deleteUser = async (userId: string) => {
    return authService.deleteUser(userId);
  };

  const getAllUsers = async () => {
    return authService.getAllUsers();
  };

  const getAuditLogs = async () => {
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('Only admin users can view audit logs');
    }
    return authService.getAuditLogs();
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

  const isEditor = (): boolean => {
    return state.user?.role === 'editor' || false;
  };

  const isModerator = (): boolean => {
    return state.user?.role === 'moderator' || false;
  };

  const isContributor = (): boolean => {
    return state.user?.role === 'contributor' || false;
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
        getAuditLogs,
        hasPermission,
        isAdmin,
        isStreamer,
        isContributor,
        isEditor,
        isModerator,
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