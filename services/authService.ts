import { User, LoginCredentials, CreateUserRequest, DEFAULT_PERMISSIONS, RegisterRequest } from '@/types/auth';
import { LEGACY_ROLE_PERMISSIONS } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

class AuthService {
  private currentUser: User | null = null;

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
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm for admin-created users
        user_metadata: {
          name: userData.name,
          role: userData.role,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // The user_profiles entry should be created automatically by the trigger
      // Wait a moment and then fetch the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error after creation:', profileError);
        throw new Error('User created but profile not found');
      }

      const newUser: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: profileData.name,
        role: profileData.role,
        createdAt: new Date(authData.user.created_at),
        isActive: profileData.is_active ?? true,
        emailConfirmedAt: authData.user.email_confirmed_at ? new Date(authData.user.email_confirmed_at) : undefined,
        permissions: profileData.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : LEGACY_ROLE_PERMISSIONS.streaming,
        createdBy: this.currentUser?.id,
      };

      return newUser;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Check if this is a self-update that would remove admin privileges
      if (this.currentUser && this.currentUser.id === userId) {
        const isCurrentlyAdmin = this.currentUser.role === 'admin';
        const wouldRemoveAdmin = updates.role && updates.role !== 'admin';
        const wouldDeactivate = updates.isActive === false;
        
        if (isCurrentlyAdmin && (wouldRemoveAdmin || wouldDeactivate)) {
          // Check if this user is the last admin
          const { data: isLastAdmin, error: checkError } = await supabase
            .rpc('is_last_admin', { user_id: userId });
          
          if (checkError) {
            console.error('Error checking last admin status:', checkError);
            throw new Error('Unable to verify admin status');
          }
          
          if (isLastAdmin) {
            throw new Error('Cannot remove admin privileges or deactivate the last admin account');
          }
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name: updates.name,
          role: updates.role,
          is_active: updates.isActive,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Fetch the updated user data
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      
      if (!authData.user) {
        throw new Error('User not found');
      }

      const updatedUser: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: data.name,
        role: data.role,
        createdAt: new Date(authData.user.created_at),
        lastSignInAt: authData.user.last_sign_in_at ? new Date(authData.user.last_sign_in_at) : undefined,
        isActive: data.is_active ?? true,
        emailConfirmedAt: authData.user.email_confirmed_at ? new Date(authData.user.email_confirmed_at) : undefined,
        permissions: data.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : LEGACY_ROLE_PERMISSIONS.streaming,
        permissions: data.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : 
                    data.role === 'editor' ? LEGACY_ROLE_PERMISSIONS.editor :
                    data.role === 'moderator' ? LEGACY_ROLE_PERMISSIONS.moderator :
                    LEGACY_ROLE_PERMISSIONS.streaming,
        createdBy: data.created_by,
      };

      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete from auth (this should cascade to user_profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      const users: User[] = [];

      for (const profile of profilesData) {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
          
          if (authData.user) {
            users.push({
              id: authData.user.id,
              email: authData.user.email!,
              name: profile.name,
              role: profile.role,
              createdAt: new Date(authData.user.created_at),
              lastSignInAt: authData.user.last_sign_in_at ? new Date(authData.user.last_sign_in_at) : undefined,
              isActive: profile.is_active ?? true,
              emailConfirmedAt: authData.user.email_confirmed_at ? new Date(authData.user.email_confirmed_at) : undefined,
              permissions: profile.role === 'admin' ? LEGACY_ROLE_PERMISSIONS.admin : 
                          profile.role === 'editor' ? LEGACY_ROLE_PERMISSIONS.editor :
                          profile.role === 'moderator' ? LEGACY_ROLE_PERMISSIONS.moderator :
                          LEGACY_ROLE_PERMISSIONS.streaming,
              createdBy: profile.created_by,
            });
          }
        } catch (error) {
          console.error(`Error fetching auth data for user ${profile.id}:`, error);
        }
      }

      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async getAuditLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('role_audit_logs')
        .select(`
          *,
          changed_user:user_profiles!changed_user_id(name, email),
          changed_by:user_profiles!changed_by_user_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }
export const authService = new AuthService();