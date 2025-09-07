import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Plus, Minus, RotateCcw, Users, Target, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, SlideInLeft, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import ScoreController from '@/components/ScoreController';
import FrameManager from '@/components/FrameManager';
import FoulTracker from '@/components/FoulTracker';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ScoreboardManagement() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ScoreboardContent />
    </ProtectedRoute>
  );
}

function ScoreboardContent() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentBreak, setCurrentBreak] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [player1Frames, setPlayer1Frames] = useState(0);
  const [player2Frames, setPlayer2Frames] = useState(0);
  const [fouls, setFouls] = useState({ player1: 0, player2: 0 });

  const scoreAnimation = useSharedValue(1);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreAnimation.value }],
  }));

  const addScore = (points: number) => {
    scoreAnimation.value = withSpring(1.2, {}, () => {
      scoreAnimation.value = withSpring(1);
    });

    if (currentPlayer === 1) {
      setPlayer1Score(prev => prev + points);
    } else {
      setPlayer2Score(prev => prev + points);
    }
    setCurrentBreak(prev => prev + points);
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setCurrentBreak(0);
  };

  const resetScores = () => {
    Alert.alert(
      'Reset Scores',
      'Are you sure you want to reset all scores?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPlayer1Score(0);
            setPlayer2Score(0);
            setCurrentBreak(0);
            setCurrentPlayer(1);
          },
        },
      ]
    );
  };

  const nextFrame = () => {
    const winner = player1Score > player2Score ? 1 : 2;
    if (winner === 1) {
      setPlayer1Frames(prev => prev + 1);
    } else {
      setPlayer2Frames(prev => prev + 1);
    }
    
    setCurrentFrame(prev => prev + 1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentBreak(0);
    setCurrentPlayer(1);
  };

  const addFoul = (player: 1 | 2, points: number) => {
    const opponent = player === 1 ? 2 : 1;
    
    // Add points to opponent
    if (opponent === 1) {
      setPlayer1Score(prev => prev + points);
    } else {
      setPlayer2Score(prev => prev + points);
    }
    
    // Track foul
    setFouls(prev => ({
      ...prev,
      [`player${player}`]: prev[`player${player}` as keyof typeof prev] + 1
    }));
    
    // Switch to opponent
    setCurrentPlayer(opponent);
    setCurrentBreak(0);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <Text style={styles.headerTitle}>Scoreboard Control</Text>
        <Text style={styles.headerSubtitle}>Frame {currentFrame} • Professional Match</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Scoreboard Display */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.scoreboardSection}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            style={styles.mainScoreboard}
          >
            <View style={styles.frameScore}>
              <Text style={styles.frameScoreText}>
                {player1Frames} - {player2Frames}
              </Text>
              <Text style={styles.frameLabel}>Frames Won</Text>
            </View>

            <Animated.View style={[styles.currentScores, scoreAnimatedStyle]}>
              <View style={[styles.playerScore, currentPlayer === 1 && styles.activePlayerScore]}>
                <Text style={styles.playerLabel}>Player 1</Text>
                <Text style={styles.scoreValue}>{player1Score}</Text>
                {currentPlayer === 1 && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                )}
              </View>

              <View style={styles.centerInfo}>
                <Text style={styles.currentBreakLabel}>Current Break</Text>
                <Text style={styles.currentBreakValue}>{currentBreak}</Text>
              </View>

              <View style={[styles.playerScore, currentPlayer === 2 && styles.activePlayerScore]}>
                <Text style={styles.playerLabel}>Player 2</Text>
                <Text style={styles.scoreValue}>{player2Score}</Text>
                {currentPlayer === 2 && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Score Controllers */}
        <Animated.View entering={SlideInLeft.delay(200)} style={styles.section}>
          <ScoreController onAddScore={addScore} />
        </Animated.View>

        {/* Player Controls */}
        <Animated.View entering={SlideInLeft.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color="#F57F17" />
            <Text style={styles.sectionTitle}>Player Controls</Text>
          </View>
          
          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={[styles.playerButton, currentPlayer === 1 && styles.activePlayerButton]}
              onPress={() => setCurrentPlayer(1)}
            >
              <Text style={styles.playerButtonText}>Player 1 Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.switchButton} onPress={switchPlayer}>
              <RotateCcw size={20} color="#fff" />
              <Text style={styles.switchButtonText}>Switch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playerButton, currentPlayer === 2 && styles.activePlayerButton]}
              onPress={() => setCurrentPlayer(2)}
            >
              <Text style={styles.playerButtonText}>Player 2 Active</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Foul Tracker */}
        <Animated.View entering={SlideInLeft.delay(400)} style={styles.section}>
          <FoulTracker onAddFoul={addFoul} fouls={fouls} />
        </Animated.View>

        {/* Frame Manager */}
        <Animated.View entering={SlideInLeft.delay(500)} style={styles.section}>
          <FrameManager 
            onNextFrame={nextFrame}
            onResetScores={resetScores}
            player1Score={player1Score}
            player2Score={player2Score}
          />
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
  scoreboardSection: {
    marginBottom: 20,
  },
  mainScoreboard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#40E0D0',
  },
  frameScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  frameScoreText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  frameLabel: {
    color: '#E8F5E8',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  currentScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerScore: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activePlayerScore: {
    backgroundColor: 'rgba(64, 224, 208, 0.3)',
    borderWidth: 2,
    borderColor: '#40E0D0',
  },
  playerLabel: {
    color: '#E8F5E8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  activeIndicator: {
    backgroundColor: '#F57F17',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerInfo: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  currentBreakLabel: {
    color: '#E8F5E8',
    fontSize: 12,
    fontWeight: '500',
  },
  currentBreakValue: {
    color: '#40E0D0',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
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
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerButton: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activePlayerButton: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  playerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006994',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});