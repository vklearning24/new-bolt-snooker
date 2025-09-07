import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartBar as BarChart3, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface MatchData {
  totalPoints: { player1: number; player2: number };
  fouls: { player1: number; player2: number };
  averageBreak: { player1: number; player2: number };
  frameWins: { player1: number; player2: number };
}

interface MatchStatisticsProps {
  matchData: MatchData;
}

export default function MatchStatistics({ matchData }: MatchStatisticsProps) {
  const totalFrames = matchData.frameWins.player1 + matchData.frameWins.player2;
  const winPercentageP1 = (matchData.frameWins.player1 / totalFrames) * 100;
  const winPercentageP2 = (matchData.frameWins.player2 / totalFrames) * 100;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <BarChart3 size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Match Statistics</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Points</Text>
          <View style={styles.statComparison}>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{matchData.totalPoints.player1}</Text>
              <Text style={styles.playerLabel}>Player 1</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{matchData.totalPoints.player2}</Text>
              <Text style={styles.playerLabel}>Player 2</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Average Break</Text>
          <View style={styles.statComparison}>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{matchData.averageBreak.player1.toFixed(1)}</Text>
              <Text style={styles.playerLabel}>Player 1</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{matchData.averageBreak.player2.toFixed(1)}</Text>
              <Text style={styles.playerLabel}>Player 2</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Win Percentage</Text>
          <View style={styles.statComparison}>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{winPercentageP1.toFixed(0)}%</Text>
              <Text style={styles.playerLabel}>Player 1</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.statPlayer}>
              <Text style={styles.statValue}>{winPercentageP2.toFixed(0)}%</Text>
              <Text style={styles.playerLabel}>Player 2</Text>
            </View>
          </View>
        </View>

        <View style={styles.foulCard}>
          <AlertTriangle size={20} color="#FF6B6B" />
          <Text style={styles.foulLabel}>Fouls Committed</Text>
          <View style={styles.foulStats}>
            <Text style={styles.foulStat}>P1: {matchData.fouls.player1}</Text>
            <Text style={styles.foulStat}>P2: {matchData.fouls.player2}</Text>
          </View>
        </View>
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
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  statComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  vs: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  foulCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  foulLabel: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  foulStats: {
    flexDirection: 'row',
    gap: 12,
  },
  foulStat: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});