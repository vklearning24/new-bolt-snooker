import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Trophy, ChartBar as BarChart3, Target, Users, Download, Share as ShareIcon, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import MatchStatistics from '@/components/MatchStatistics';
import BreakAnalysis from '@/components/BreakAnalysis';
import PlayerComparison from '@/components/PlayerComparison';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MatchData {
  finalScore: { player1: number; player2: number };
  frameWins: { player1: number; player2: number };
  winner: string;
  duration: string;
  highestBreak: { player: string; value: number };
  totalPoints: { player1: number; player2: number };
  fouls: { player1: number; player2: number };
  averageBreak: { player1: number; player2: number };
  centuryBreaks: { player1: number; player2: number };
  specialMoments: number;
}

export default function PostMatchSummary() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SummaryContent />
    </ProtectedRoute>
  );
}

function SummaryContent() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading match data
    setTimeout(() => {
      setMatchData({
        finalScore: { player1: 4, player2: 2 },
        frameWins: { player1: 4, player2: 2 },
        winner: 'Player 1',
        duration: '2h 34m',
        highestBreak: { player: 'Player 1', value: 127 },
        totalPoints: { player1: 456, player2: 312 },
        fouls: { player1: 3, player2: 7 },
        averageBreak: { player1: 32.4, player2: 28.1 },
        centuryBreaks: { player1: 2, player2: 0 },
        specialMoments: 8,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const shareResults = async () => {
    if (!matchData) return;
    
    const message = `🎱 Snooker Match Results\n\n🏆 Winner: ${matchData.winner}\n📊 Final Score: ${matchData.frameWins.player1}-${matchData.frameWins.player2}\n⏱️ Duration: ${matchData.duration}\n🎯 Highest Break: ${matchData.highestBreak.value} (${matchData.highestBreak.player})\n\n#Snooker #LiveStream`;
    
    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating match summary...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!matchData) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.emptyContainer}>
          <BarChart3 size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Match Data</Text>
          <Text style={styles.emptyText}>Complete a match to view summary statistics</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <Text style={styles.headerTitle}>Match Summary</Text>
        <Text style={styles.headerSubtitle}>Complete analysis and statistics</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Winner */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.winnerSection}>
          <LinearGradient
            colors={['#FFD700', '#FFA000']}
            style={styles.winnerCard}
          >
            <Trophy size={48} color="#fff" />
            <Text style={styles.winnerTitle}>Match Winner</Text>
            <Text style={styles.winnerName}>{matchData.winner}</Text>
            <Text style={styles.winnerScore}>
              {matchData.frameWins.player1} - {matchData.frameWins.player2}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={SlideInUp.delay(200)} style={styles.quickStatsSection}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#40E0D0" />
            <Text style={styles.sectionTitle}>Quick Stats</Text>
          </View>
          
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{matchData.duration}</Text>
              <Text style={styles.quickStatLabel}>Match Duration</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{matchData.highestBreak.value}</Text>
              <Text style={styles.quickStatLabel}>Highest Break</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{matchData.totalPoints.player1 + matchData.totalPoints.player2}</Text>
              <Text style={styles.quickStatLabel}>Total Points</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{matchData.specialMoments}</Text>
              <Text style={styles.quickStatLabel}>Special Moments</Text>
            </View>
          </View>
        </Animated.View>

        {/* Player Comparison */}
        <Animated.View entering={SlideInUp.delay(300)} style={styles.section}>
          <PlayerComparison matchData={matchData} />
        </Animated.View>

        {/* Match Statistics */}
        <Animated.View entering={SlideInUp.delay(400)} style={styles.section}>
          <MatchStatistics matchData={matchData} />
        </Animated.View>

        {/* Break Analysis */}
        <Animated.View entering={SlideInUp.delay(500)} style={styles.section}>
          <BreakAnalysis matchData={matchData} />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={SlideInUp.delay(600)} style={styles.actionsSection}>
          <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
            <ShareIcon size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Results</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton}>
            <Download size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Export Data</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyText: {
    color: '#B0BEC5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
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
  winnerSection: {
    marginBottom: 20,
  },
  winnerCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  winnerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  winnerName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  winnerScore: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  quickStatsSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickStat: {
    width: '48%',
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickStatValue: {
    color: '#40E0D0',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006994',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});