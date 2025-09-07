import { User, LoginCredentials, CreateUserRequest, DEFAULT_PERMISSIONS } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock storage for demo purposes - in production, this would be a real backend
class AuthService {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      isActive: true,
      isVerified: true,
      permissions: DEFAULT_PERMISSIONS.admin,
    },
    {
      id: '2',
      email: 'streamer@example.com',
      name: 'Streamer User',
      role: 'streaming',
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date(),
      isActive: true,
      isVerified: true,
      permissions: DEFAULT_PERMISSIONS.streaming,
    },
  ];

  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.users.find(u => 
      u.email === credentials.email && 
      u.role === credentials.loginType &&
      u.isActive
    );

    if (!user) {
      throw new Error('Invalid credentials or user not found');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // In production, verify password hash here
    user.lastLogin = new Date();
    this.currentUser = user;
    
    // Store in AsyncStorage for persistence
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  async register(userData: RegisterRequest): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    // Check if email already exists
    if (this.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email.toLowerCase(),
      name: userData.name,
      role: 'streaming', // Default role for new registrations
      createdAt: new Date(),
      isActive: true,
      isVerified: false, // Requires email verification
      permissions: DEFAULT_PERMISSIONS.streaming,
    };

    this.users.push(newUser);

    // Simulate sending verification email
    console.log(`Verification email sent to ${userData.email}`);
    
    return {
      success: true,
      message: `We've sent a confirmation link to ${userData.email}. Please verify to continue.`
    };
  }

  async simulateEmailVerification(email: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email is already verified');
    }

    user.isVerified = true;
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('currentUser');
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check AsyncStorage for existing session
    const stored = await AsyncStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date(),
      isActive: true,
      permissions: userData.role === 'admin' ? DEFAULT_PERMISSIONS.admin : DEFAULT_PERMISSIONS.streaming,
      createdBy: this.currentUser?.id,
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(userId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users.splice(userIndex, 1);
  }

  async getAllUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...this.users];
  }
}

export const authService = new AuthService();