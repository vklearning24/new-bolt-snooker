import { User, LoginCredentials, CreateUserRequest, DEFAULT_PERMISSIONS, RegisterRequest } from '@/types/auth';
import { LEGACY_ROLE_PERMISSIONS } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

class AuthService {
  private currentUser: User | null = null;

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No valid session found');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed - no user data received');
      }

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        // Sign out the unverified user
        await supabase.auth.signOut();
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      }

      // Fetch user profile from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profileData) {
        throw new Error('User profile not found');
      }

      // Construct User object
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profileData.name,
        role: profileData.role,
        createdAt: new Date(data.user.created_at),
        lastSignInAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
        isActive: profileData.is_active ?? true,
        emailConfirmedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : undefined,
        permissions: profileData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : LEGACY_ROLE_PERMISSIONS.streaming,
        createdBy: profileData.created_by,
      };

      this.currentUser = user;
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Validate input
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: 'streaming', // Default role for new registrations
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user data received');
      }

      return {
        success: true,
        message: `We've sent a confirmation link to ${userData.email}. Please verify your email to complete registration.`
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      await AsyncStorage.removeItem('currentUser');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        return null;
      }

      if (!session?.user) {
        // Check AsyncStorage for cached user data
        const stored = await AsyncStorage.getItem('currentUser');
        if (stored) {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        }
        return null;
      }

      // Fetch user profile from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      if (!profileData) {
        console.error('User profile not found');
        return null;
      }

      // Construct User object
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: profileData.name,
        role: profileData.role,
        createdAt: new Date(session.user.created_at),
        lastSignInAt: session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at) : undefined,
        isActive: profileData.is_active ?? true,
        emailConfirmedAt: session.user.email_confirmed_at ? new Date(session.user.email_confirmed_at) : undefined,
        permissions: profileData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : LEGACY_ROLE_PERMISSIONS.streaming,
        createdBy: profileData.created_by,
      };

      this.currentUser = user;
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-users/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const createdUserData = await response.json();
      return {
        ...createdUserData,
        createdAt: new Date(createdUserData.createdAt),
        lastSignInAt: createdUserData.lastSignInAt ? new Date(createdUserData.lastSignInAt) : undefined,
        emailConfirmedAt: createdUserData.emailConfirmedAt ? new Date(createdUserData.emailConfirmedAt) : undefined,
        permissions: createdUserData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : 
                    createdUserData.role === 'editor' ? LEGACY_ROLE_PERMISSIONS.editor :
                    createdUserData.role === 'moderator' ? LEGACY_ROLE_PERMISSIONS.moderator :
                    LEGACY_ROLE_PERMISSIONS.streaming,
      };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: updates.name,
          role: updates.role,
          isActive: updates.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const userData = await response.json();
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        lastSignInAt: userData.lastSignInAt ? new Date(userData.lastSignInAt) : undefined,
        emailConfirmedAt: userData.emailConfirmedAt ? new Date(userData.emailConfirmedAt) : undefined,
        permissions: userData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : 
                    userData.role === 'editor' ? LEGACY_ROLE_PERMISSIONS.editor :
                    userData.role === 'moderator' ? LEGACY_ROLE_PERMISSIONS.moderator :
                    LEGACY_ROLE_PERMISSIONS.streaming,
      };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-users/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-users/users`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const usersData = await response.json();
      return usersData.map((userData: any) => ({
        ...userData,
        createdAt: new Date(userData.createdAt),
        lastSignInAt: userData.lastSignInAt ? new Date(userData.lastSignInAt) : undefined,
        emailConfirmedAt: userData.emailConfirmedAt ? new Date(userData.emailConfirmedAt) : undefined,
        permissions: userData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : 
                    userData.role === 'editor' ? LEGACY_ROLE_PERMISSIONS.editor :
                    userData.role === 'moderator' ? LEGACY_ROLE_PERMISSIONS.moderator :
                    LEGACY_ROLE_PERMISSIONS.streaming,
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async getAuditLogs(): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-audit-logs`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch audit logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }
}
export const authService = new AuthService();