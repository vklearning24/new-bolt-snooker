import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock } from 'lucide-react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: 'streaming' | 'admin';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <View style={styles.container}>
        <Lock size={48} color="#666" />
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>Please log in to access this feature</Text>
      </View>
    );
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return fallback || (
      <View style={styles.container}>
        <Shield size={48} color="#FF6B6B" />
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>
          {requiredRole === 'admin' 
            ? 'This feature requires admin privileges'
            : 'This feature is restricted to streaming users'
          }
        </Text>
      </View>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <View style={styles.container}>
        <Shield size={48} color="#FF6B6B" />
        <Text style={styles.title}>Insufficient Permissions</Text>
        <Text style={styles.subtitle}>
          You don't have permission to access this feature
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    padding: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B0BEC5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});