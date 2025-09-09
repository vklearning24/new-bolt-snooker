import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Users, Plus, CreditCard as Edit, Trash2, Shield, Zap, Search, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { User, CreateUserRequest } from '@/types/auth';

export default function UserManagement() {
  const { getAllUsers, createUser, updateUser, deleteUser, user: currentUser, isContributor } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '', 
    // Default role for new users when a contributor is creating them
    // This will be enforced by the backend as well.
    email: '',
    password: '', // Password is only for creation, not update
    role: 'streaming' as 'streaming' | 'admin',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // If contributor, ensure role is streaming
    const roleToCreate = isContributor() ? 'streaming' : formData.role;

    if (!formData.name || !formData.email || !formData.password || !roleToCreate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const userData: CreateUserRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password, // Password is only for creation
        role: roleToCreate,
        permissions: [],
      };

      await createUser(userData);
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', role: 'streaming' });
      loadUsers();
      Alert.alert('Success', 'User created successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email, // Email cannot be updated via this function
        role: formData.role, // Role can be updated
      });
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'streaming' });
      loadUsers();
      Alert.alert('Success', 'User updated successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      loadUsers();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const startEdit = (user: User) => {
    // If current user is contributor and target user is admin, prevent editing
    if (isContributor() && user.role === 'admin') {
      Alert.alert('Permission Denied', 'Contributors cannot edit admin users.');
    } else {    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowCreateForm(true);
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    // Reset form data to default streaming role if current user is contributor
    // This ensures the form is ready for a new streaming user creation
    if (isContributor()) setFormData({ name: '', email: '', password: '', role: 'streaming' });
    setFormData({ name: '', email: '', password: '', role: 'streaming' });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>Manage streaming and admin accounts</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Add User */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" />
            <TextInput 
              // Disable search for contributors if they are not allowed to view all users
              // (though current backend allows them to view all)
              editable={!isContributor() || true} 
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => { 
                setShowCreateForm(true); 
                if (isContributor()) setFormData(prev => ({ ...prev, role: 'streaming' })); }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Create/Edit User Form */}
        {showCreateForm && (
          <Animated.View entering={SlideInRight} style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </Text>
              <TouchableOpacity onPress={cancelForm}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password input only for new user creation */}
              {!editingUser && ( 
                <TextInput 
                  style={styles.input} 
                  placeholder="Password" 
                  placeholderTextColor="#666" 
                  value={formData.password} 
                  onChangeText={(text) => setFormData({ ...formData, password: text })} 
                  secureTextEntry 
                /> 
              )} 

              <View style={styles.roleSelector}>
                <TouchableOpacity
                  // If contributor is editing an admin, disable all role changes
                  // If contributor is creating, only streaming is allowed (other buttons disabled)
                  // If contributor is editing non-admin, they can only change to streaming
                  disabled={isContributor() && editingUser && editingUser.role === 'admin'}

                  style={[styles.roleButton, formData.role === 'streaming' && styles.activeRole]}
                  onPress={() => setFormData({ ...formData, role: 'streaming' })}
                >
                  <Zap size={16} color={formData.role === 'streaming' ? '#fff' : '#40E0D0'} />
                  <Text style={[styles.roleText, formData.role === 'streaming' && styles.activeRoleText]}>
                    Streaming
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  // Disable 'admin' role selection for contributors (cannot create or assign admin)
                  // Also disable if editing an admin user (cannot change admin's role)
                  // This covers both creation and editing scenarios for contributors
                  disabled={isContributor()}

                  style={[styles.roleButton, formData.role === 'admin' && styles.activeRole]}
                  onPress={() => setFormData({ ...formData, role: 'admin' })}
                >
                  <Shield size={16} color={formData.role === 'admin' ? '#fff' : '#40E0D0'} />
                  <Text style={[styles.roleText, formData.role === 'admin' && styles.activeRoleText]}>
                    Admin
                  </Text>
                </TouchableOpacity>

                {/* Add Contributor role option */}
                {/* Only admins can create/assign contributor role */}
                <TouchableOpacity
                  // Disable for contributors (cannot create other contributors, cannot change admin's role)
                  disabled={isContributor() && (editingUser ? editingUser.role === 'admin' : true)}
                  style={[styles.roleButton, formData.role === 'contributor' && styles.activeRole]}
                  onPress={() => setFormData({ ...formData, role: 'contributor' })}
                >
                  <Users size={16} color={formData.role === 'contributor' ? '#fff' : '#40E0D0'} />
                  <Text style={[styles.roleText, formData.role === 'contributor' && styles.activeRoleText]}>Contributor</Text>
                </TouchableOpacity>
              </View>
              
              {/* Add Editor and Moderator role options for Admins */}
              {!isContributor() && ( // Only show these options if the current user is NOT a contributor
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[styles.roleButton, formData.role === 'editor' && styles.activeRole]}
                    onPress={() => setFormData({ ...formData, role: 'editor' })}
                  >
                    <Zap size={16} color={formData.role === 'editor' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.roleText, formData.role === 'editor' && styles.activeRoleText]}>
                      Editor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, formData.role === 'moderator' && styles.activeRole]}
                    onPress={() => setFormData({ ...formData, role: 'moderator' })}
                  >
                    <Zap size={16} color={formData.role === 'moderator' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.roleText, formData.role === 'moderator' && styles.activeRoleText]}>
                      Moderator
                    </Text>
                  </TouchableOpacity>
                </View>
              )}



              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingUser ? handleUpdateUser : handleCreateUser}
              >
                <Text style={styles.submitButtonText}>
                  {editingUser ? 'Update User' : 'Create User'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Users List */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color="#40E0D0" />
            <Text style={styles.sectionTitle}>All Users ({filteredUsers.length})</Text>
          </View>

          {filteredUsers.map((user, index) => (
            <Animated.View key={user.id} entering={FadeInUp.delay(300 + index * 100)}>
              <View style={[styles.userCard, !user.isActive && styles.inactiveUser]}>
                <View style={styles.userInfo}>
                  <View style={styles.userHeader}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={[styles.roleBadge, user.role === 'admin' && styles.adminBadge, user.role === 'contributor' && styles.contributorBadge]}>
                      {user.role === 'admin' ? (
                        <Shield size={12} color="#fff" />
                      ) : user.role === 'contributor' ? (
                        <Users size={12} color="#fff" />
                      ) : ( // Default for streaming, editor, moderator
                        <Zap size={12} color="#fff" />
                      )}
                      <Text style={styles.roleBadgeText}>
                        {user.role === 'admin' ? 'Admin' : 'Streamer'}
                      </Text>
                    </View> {/* This badge needs to be updated to show 'contributor' too */}
                  </View>

                  <Text style={styles.userEmail}>{user.email}</Text>
                  
                  <View style={styles.userMeta}>
                    <Text style={styles.userMetaText}>
                      Created: {user.createdAt.toLocaleDateString()}
                    </Text>
                    {user.lastSignInAt && (
                      <Text style={styles.userMetaText}>
                        Last login: {user.lastSignInAt.toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleUserStatus(user)}
                  >
                    {user.isActive ? (
                      <Eye size={16} color="#4CAF50" />
                    ) : (
                      <EyeOff size={16} color="#666" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    // Disable edit for admin users if the current user is a contributor (backend also enforces)
                    disabled={isContributor() && user.role === 'admin'}
                    style={styles.actionButton}
                    onPress={() => startEdit(user)}
                  >
                    <Edit size={16} color="#40E0D0" />
                  </TouchableOpacity>

                  {/* Disable delete for current user and for admin users if the current user is a contributor */}
                  {user.id !== currentUser?.id && !(isContributor() && user.role === 'admin') && ( // Backend also enforces
                    <TouchableOpacity
                      disabled={isContributor() && user.role === 'admin'}
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user)}
                    >
                      <Trash2 size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color="#666" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first user account'}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#B0BEC5',
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#40E0D0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#40E0D0',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeRole: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  roleText: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
  },
  activeRoleText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  inactiveUser: {
    opacity: 0.6,
    borderColor: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#40E0D0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#FF9800',
  },
  contributorBadge: {
    backgroundColor: '#006994', // A distinct color for contributor
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#B0BEC5',
    fontSize: 14,
    marginBottom: 8,
  },
  userMeta: {
    gap: 2,
  },
  userMetaText: {
    color: '#666',
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});