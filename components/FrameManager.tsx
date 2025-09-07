import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Trophy, RotateCcw } from 'lucide-react-native';

interface FrameManagerProps {
  onNextFrame: () => void;
  onResetScores: () => void;
  player1Score: number;
  player2Score: number;
}

export default function FrameManager({ 
  onNextFrame, 
  onResetScores, 
  player1Score, 
  player2Score 
}: FrameManagerProps) {
  const handleNextFrame = () => {
    const winner = player1Score > player2Score ? 'Player 1' : 'Player 2';
    const score = `${Math.max(player1Score, player2Score)} - ${Math.min(player1Score, player2Score)}`;
    
    Alert.alert(
      'Frame Complete',
      `${winner} wins the frame with a score of ${score}.\n\nProceed to next frame?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next Frame',
          onPress: onNextFrame,
        },
      ]
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Trophy size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Frame Management</Text>
      </View>
      
      <View style={styles.frameButtons}>
        <TouchableOpacity style={styles.nextFrameButton} onPress={handleNextFrame}>
          <Trophy size={20} color="#fff" />
          <Text style={styles.nextFrameText}>Complete Frame</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={onResetScores}>
          <RotateCcw size={20} color="#fff" />
          <Text style={styles.resetText}>Reset Scores</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.frameNote}>
        Complete frame when one player has won or conceded. Reset scores to start the current frame over.
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
  frameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  nextFrameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  nextFrameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  frameNote: {
    color: '#B0BEC5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});