import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, Star } from 'lucide-react-native';

interface MatchData {
  highestBreak: { player: string; value: number };
  centuryBreaks: { player1: number; player2: number };
  averageBreak: { player1: number; player2: number };
}

interface BreakAnalysisProps {
  matchData: MatchData;
}

export default function BreakAnalysis({ matchData }: BreakAnalysisProps) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Target size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Break Analysis</Text>
      </View>
      
      <View style={styles.analysisGrid}>
        <View style={styles.highlightCard}>
          <Star size={32} color="#FFD700" />
          <Text style={styles.highlightLabel}>Highest Break</Text>
          <Text style={styles.highlightValue}>{matchData.highestBreak.value}</Text>
          <Text style={styles.highlightPlayer}>{matchData.highestBreak.player}</Text>
        </View>

        <View style={styles.breakStats}>
          <View style={styles.breakStat}>
            <Text style={styles.breakStatLabel}>Century Breaks</Text>
            <View style={styles.breakStatValues}>
              <View style={styles.breakStatItem}>
                <Text style={styles.breakStatValue}>{matchData.centuryBreaks.player1}</Text>
                <Text style={styles.breakStatPlayer}>P1</Text>
              </View>
              <View style={styles.breakStatItem}>
                <Text style={styles.breakStatValue}>{matchData.centuryBreaks.player2}</Text>
                <Text style={styles.breakStatPlayer}>P2</Text>
              </View>
            </View>
          </View>

          <View style={styles.breakStat}>
            <Text style={styles.breakStatLabel}>Average Break</Text>
            <View style={styles.breakStatValues}>
              <View style={styles.breakStatItem}>
                <Text style={styles.breakStatValue}>{matchData.averageBreak.player1.toFixed(1)}</Text>
                <Text style={styles.breakStatPlayer}>P1</Text>
              </View>
              <View style={styles.breakStatItem}>
                <Text style={styles.breakStatValue}>{matchData.averageBreak.player2.toFixed(1)}</Text>
                <Text style={styles.breakStatPlayer}>P2</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.analysisNote}>
        {matchData.centuryBreaks.player1 + matchData.centuryBreaks.player2 > 0
          ? `Outstanding performance with ${matchData.centuryBreaks.player1 + matchData.centuryBreaks.player2} century break${
              matchData.centuryBreaks.player1 + matchData.centuryBreaks.player2 === 1 ? '' : 's'
            }!`
          : 'A tactical match with consistent break building.'
        }
      </Text>
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
  analysisGrid: {
    gap: 16,
    marginBottom: 16,
  },
  highlightCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  highlightLabel: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  highlightValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
  highlightPlayer: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  breakStats: {
    flexDirection: 'row',
    gap: 12,
  },
  breakStat: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
  },
  breakStatLabel: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  breakStatValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakStatItem: {
    alignItems: 'center',
  },
  breakStatValue: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  breakStatPlayer: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  analysisNote: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});