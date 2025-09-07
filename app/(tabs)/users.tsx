import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserManagement from '@/components/UserManagement';

export default function UsersTab() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserManagement />
    </ProtectedRoute>
  );
}