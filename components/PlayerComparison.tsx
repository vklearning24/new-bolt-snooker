import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, TrendingUp } from 'lucide-react-native';

interface MatchData {
  totalPoints: { player1: number; player2: number };
  frameWins: { player1: number; player2: number };
  fouls: { player1: number; player2: number };
  winner: string;
}

interface PlayerComparisonProps {
  matchData: MatchData;
}

export default function PlayerComparison({ matchData }: MatchData) {
  const totalPoints = matchData.totalPoints.player1 + matchData.totalPoints.player2;
  const p1PointsPercentage = (matchData.totalPoints.player1 / totalPoints) * 100;
  const p2PointsPercentage = (matchData.totalPoints.player2 / totalPoints) * 100;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Users size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Player Comparison</Text>
      </View>
      
      <View style={styles.comparisonGrid}>
        <View style={[styles.playerCard, matchData.winner === 'Player 1' && styles.winnerCard]}>
          <Text style={styles.playerTitle}>Player 1</Text>
          {matchData.winner === 'Player 1' && (
            <View style={styles.winnerBadge}>
              <Text style={styles.winnerText}>WINNER</Text>
            </View>
          )}
          
          <View style={styles.playerStats}>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.frameWins.player1}</Text>
              <Text style={styles.statLabel}>Frames Won</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.totalPoints.player1}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.fouls.player1}</Text>
              <Text style={styles.statLabel}>Fouls</Text>
            </View>
          </View>

          <View style={styles.pointsBar}>
            <View style={[styles.pointsFill, { width: `${p1PointsPercentage}%` }]} />
          </View>
          <Text style={styles.pointsPercentage}>{p1PointsPercentage.toFixed(1)}% of total points</Text>
        </View>

        <View style={[styles.playerCard, matchData.winner === 'Player 2' && styles.winnerCard]}>
          <Text style={styles.playerTitle}>Player 2</Text>
          {matchData.winner === 'Player 2' && (
            <View style={styles.winnerBadge}>
              <Text style={styles.winnerText}>WINNER</Text>
            </View>
          )}
          
          <View style={styles.playerStats}>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.frameWins.player2}</Text>
              <Text style={styles.statLabel}>Frames Won</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.totalPoints.player2}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statValue}>{matchData.fouls.player2}</Text>
              <Text style={styles.statLabel}>Fouls</Text>
            </View>
          </View>

          <View style={styles.pointsBar}>
            <View style={[styles.pointsFill, { width: `${p2PointsPercentage}%` }]} />
          </View>
          <Text style={styles.pointsPercentage}>{p2PointsPercentage.toFixed(1)}% of total points</Text>
        </View>
      </View>

      <View style={styles.performanceInsight}>
        <TrendingUp size={20} color="#4CAF50" />
        <Text style={styles.insightText}>
          {matchData.winner} demonstrated superior frame control and consistency throughout the match.
        </Text>
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
  comparisonGrid: {
    gap: 12,
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  winnerCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  playerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  winnerBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  winnerText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  playerStat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B0BEC5',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  pointsBar: {
    height: 6,
    backgroundColor: 'rgba(245, 127, 23, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  pointsFill: {
    height: '100%',
    backgroundColor: '#40E0D0',
    borderRadius: 3,
  },
  pointsPercentage: {
    color: '#B0BEC5',
    fontSize: 12,
    textAlign: 'center',
  },
  performanceInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  insightText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});