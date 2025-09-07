import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { History, User, Shield, Calendar, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  changed_user_id: string;
  changed_by_user_id: string;
  old_role: string;
  new_role: string;
  old_is_active: boolean;
  new_is_active: boolean;
  change_reason: string;
  created_at: string;
  changed_user: { name: string; email: string };
  changed_by: { name: string; email: string };
}

export default function AuditLogViewer() {
  const { getAuditLogs } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'role_changes' | 'status_changes'>('all');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const auditLogs = await getAuditLogs();
      setLogs(auditLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'role_changes') {
      return log.old_role !== log.new_role;
    }
    if (filter === 'status_changes') {
      return log.old_is_active !== log.new_is_active;
    }
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#FF9800';
      case 'editor': return '#9C27B0';
      case 'moderator': return '#2196F3';
      case 'streaming': return '#40E0D0';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading audit logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <Text style={styles.headerSubtitle}>Track all role and status changes</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Controls */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Filter size={20} color="#40E0D0" />
            <Text style={styles.filterTitle}>Filter Logs</Text>
          </View>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                All Changes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'role_changes' && styles.activeFilter]}
              onPress={() => setFilter('role_changes')}
            >
              <Text style={[styles.filterText, filter === 'role_changes' && styles.activeFilterText]}>
                Role Changes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'status_changes' && styles.activeFilter]}
              onPress={() => setFilter('status_changes')}
            >
              <Text style={[styles.filterText, filter === 'status_changes' && styles.activeFilterText]}>
                Status Changes
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Audit Logs List */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.logsSection}>
          <View style={styles.sectionHeader}>
            <History size={24} color="#40E0D0" />
            <Text style={styles.sectionTitle}>Recent Changes ({filteredLogs.length})</Text>
          </View>

          {filteredLogs.map((log, index) => (
            <Animated.View key={log.id} entering={FadeInUp.delay(300 + index * 50)}>
              <View style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logUser}>
                    <User size={16} color="#40E0D0" />
                    <Text style={styles.logUserName}>{log.changed_user.name}</Text>
                  </View>
                  <View style={styles.logDate}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.logDateText}>{formatDate(log.created_at)}</Text>
                  </View>
                </View>

                <View style={styles.logContent}>
                  <Text style={styles.logReason}>{log.change_reason}</Text>
                  
                  {log.old_role !== log.new_role && (
                    <View style={styles.roleChange}>
                      <Text style={styles.changeLabel}>Role:</Text>
                      <View style={styles.roleFlow}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(log.old_role) }]}>
                          <Text style={styles.roleBadgeText}>{log.old_role}</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(log.new_role) }]}>
                          <Text style={styles.roleBadgeText}>{log.new_role}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {log.old_is_active !== log.new_is_active && (
                    <View style={styles.statusChange}>
                      <Text style={styles.changeLabel}>Status:</Text>
                      <View style={styles.statusFlow}>
                        <Text style={[styles.statusText, !log.old_is_active && styles.inactiveStatus]}>
                          {log.old_is_active ? 'Active' : 'Inactive'}
                        </Text>
                        <Text style={styles.arrow}>→</Text>
                        <Text style={[styles.statusText, !log.new_is_active && styles.inactiveStatus]}>
                          {log.new_is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.logFooter}>
                  <Shield size={14} color="#666" />
                  <Text style={styles.logChangedBy}>
                    Changed by: {log.changed_by.name}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}

          {filteredLogs.length === 0 && (
            <View style={styles.emptyState}>
              <History size={48} color="#666" />
              <Text style={styles.emptyTitle}>No audit logs found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'No changes have been recorded yet'
                  : 'No changes match the selected filter'
                }
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
  filterSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  filterText: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  logsSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
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
  logCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logUserName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logDateText: {
    color: '#666',
    fontSize: 12,
  },
  logContent: {
    marginBottom: 12,
  },
  logReason: {
    color: '#B0BEC5',
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  roleChange: {
    marginBottom: 8,
  },
  statusChange: {
    marginBottom: 8,
  },
  changeLabel: {
    color: '#40E0D0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveStatus: {
    color: '#FF6B6B',
  },
  arrow: {
    color: '#666',
    fontSize: 14,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3C3C3E',
  },
  logChangedBy: {
    color: '#666',
    fontSize: 12,
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