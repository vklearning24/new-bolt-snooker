import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { History, Clock } from 'lucide-react-native';

interface Moment {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  player: string;
}

interface MomentHistoryProps {
  moments: Moment[];
}

export default function MomentHistory({ moments }: MomentHistoryProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <History size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Recent Moments</Text>
      </View>
      
      {moments.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock size={48} color="#666" />
          <Text style={styles.emptyText}>No moments triggered yet</Text>
          <Text style={styles.emptySubtext}>Special moments will appear here once triggered</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {moments.map((moment) => (
            <View key={moment.id} style={styles.momentItem}>
              <View style={styles.momentHeader}>
                <Text style={styles.momentTitle}>{moment.title}</Text>
                <Text style={styles.momentTime}>{formatTime(moment.timestamp)}</Text>
              </View>
              <Text style={styles.momentPlayer}>{moment.player}</Text>
              <Text style={styles.momentDescription}>{moment.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  historyList: {
    maxHeight: 300,
  },
  momentItem: {
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#40E0D0',
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  momentTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  momentTime: {
    color: '#B0BEC5',
    fontSize: 12,
  },
  momentPlayer: {
    color: '#40E0D0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  momentDescription: {
    color: '#B0BEC5',
    fontSize: 12,
    lineHeight: 16,
  },
});