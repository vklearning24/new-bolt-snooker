import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function LiveScoreboard() {
  // Mock data - in real app this would come from state management
  const player1Score = 67;
  const player2Score = 23;
  const currentBreak = 24;
  const frame = 3;
  const currentPlayer = 1;

  return (
    <Animated.View entering={FadeIn.delay(500)} style={styles.container}>
      <LinearGradient
        colors={['rgba(27, 94, 32, 0.95)', 'rgba(46, 125, 50, 0.95)']}
        style={styles.scoreboard}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.frameText}>Frame {frame}</Text>
          <View style={styles.breakContainer}>
            <Text style={styles.breakLabel}>Break</Text>
            <Animated.Text entering={SlideInUp} style={styles.breakValue}>
              {currentBreak}
            </Animated.Text>
          </View>
        </View>

        {/* Scores */}
        <View style={styles.scoresContainer}>
          <View style={[styles.playerScore, currentPlayer === 1 && styles.activePlayer]}>
            <Text style={styles.playerName}>Player 1</Text>
            <Animated.Text entering={SlideInUp} style={styles.score}>
              {player1Score}
            </Animated.Text>
          </View>
          
          <View style={styles.versus}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          <View style={[styles.playerScore, currentPlayer === 2 && styles.activePlayer]}>
            <Text style={styles.playerName}>Player 2</Text>
            <Animated.Text entering={SlideInUp} style={styles.score}>
              {player2Score}
            </Animated.Text>
          </View>
        </View>

        {/* Ball Values */}
        <View style={styles.ballsContainer}>
          {[
            { color: '#FF0000', value: 1, label: 'Red' },
            { color: '#FFFF00', value: 2, label: 'Yellow' },
            { color: '#00FF00', value: 3, label: 'Green' },
            { color: '#8B4513', value: 4, label: 'Brown' },
            { color: '#0000FF', value: 5, label: 'Blue' },
            { color: '#FFC0CB', value: 6, label: 'Pink' },
            { color: '#000000', value: 7, label: 'Black' },
          ].map((ball) => (
            <View key={ball.value} style={[styles.ball, { backgroundColor: ball.color }]}>
              <Text style={[styles.ballValue, ball.color === '#000000' && { color: '#fff' }]}>
                {ball.value}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 280,
  },
  scoreboard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(64, 224, 208, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  frameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  breakContainer: {
    alignItems: 'center',
  },
  breakLabel: {
    color: '#E8F5E8',
    fontSize: 10,
    fontWeight: '500',
  },
  breakValue: {
    color: '#40E0D0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerScore: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    opacity: 0.7,
  },
  activePlayer: {
    backgroundColor: 'rgba(64, 224, 208, 0.3)',
    opacity: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  score: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  versus: {
    marginHorizontal: 16,
  },
  vsText: {
    color: '#E8F5E8',
    fontSize: 12,
    fontWeight: '600',
  },
  ballsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ball: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ballValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
});