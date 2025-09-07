import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface FoulTrackerProps {
  onAddFoul: (player: 1 | 2, points: number) => void;
  fouls: { player1: number; player2: number };
}

const foulTypes = [
  { points: 4, label: 'Touching Ball' },
  { points: 4, label: 'Wrong Ball First' },
  { points: 5, label: 'Blue Ball Foul' },
  { points: 6, label: 'Pink Ball Foul' },
  { points: 7, label: 'Black Ball Foul' },
];

export default function FoulTracker({ onAddFoul, fouls }: FoulTrackerProps) {
  const handleFoul = (points: number) => {
    Alert.alert(
      'Foul Committed',
      `Who committed the ${points}-point foul?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Player 1',
          onPress: () => onAddFoul(1, points),
        },
        {
          text: 'Player 2',
          onPress: () => onAddFoul(2, points),
        },
      ]
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <AlertTriangle size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Foul Tracker</Text>
      </View>
      
      <View style={styles.foulStats}>
        <View style={styles.foulStat}>
          <Text style={styles.foulStatLabel}>Player 1 Fouls</Text>
          <Text style={styles.foulStatValue}>{fouls.player1}</Text>
        </View>
        <View style={styles.foulStat}>
          <Text style={styles.foulStatLabel}>Player 2 Fouls</Text>
          <Text style={styles.foulStatValue}>{fouls.player2}</Text>
        </View>
      </View>

      <View style={styles.foulButtons}>
        {foulTypes.map((foul) => (
          <TouchableOpacity
            key={`${foul.points}-${foul.label}`}
            style={styles.foulButton}
            onPress={() => handleFoul(foul.points)}
          >
            <Text style={styles.foulPoints}>+{foul.points}</Text>
            <Text style={styles.foulLabel}>{foul.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  foulStats: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  foulStat: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  foulStatLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '500',
  },
  foulStatValue: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  foulButtons: {
    gap: 8,
  },
  foulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  foulPoints: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foulLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});