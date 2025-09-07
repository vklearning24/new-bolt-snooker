import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Target } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ScoreControllerProps {
  onAddScore: (points: number) => void;
}

const ballValues = [
  { value: 1, color: '#FF0000', label: 'Red' },
  { value: 2, color: '#FFFF00', label: 'Yellow' },
  { value: 3, color: '#00FF00', label: 'Green' },
  { value: 4, color: '#8B4513', label: 'Brown' },
  { value: 5, color: '#0000FF', label: 'Blue' },
  { value: 6, color: '#FFC0CB', label: 'Pink' },
  { value: 7, color: '#000000', label: 'Black' },
];

export default function ScoreController({ onAddScore }: ScoreControllerProps) {
  const buttonScales = ballValues.map(() => useSharedValue(1));

  const handleBallPress = (value: number, index: number) => {
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });
    onAddScore(value);
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Target size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Score Points</Text>
      </View>
      
      <View style={styles.ballGrid}>
        {ballValues.map((ball, index) => {
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          return (
            <Animated.View key={ball.value} style={animatedStyle}>
              <TouchableOpacity
                style={[styles.ballButton, { backgroundColor: ball.color }]}
                onPress={() => handleBallPress(ball.value, index)}
              >
                <Text style={[
                  styles.ballValue,
                  ball.color === '#000000' && { color: '#fff' },
                  ball.color === '#FFFF00' && { color: '#000' },
                ]}>
                  {ball.value}
                </Text>
                <Text style={[
                  styles.ballLabel,
                  ball.color === '#000000' && { color: '#fff' },
                  ball.color === '#FFFF00' && { color: '#000' },
                ]}>
                  {ball.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Text style={styles.instructionText}>
        Tap a ball to add its value to the current player's score
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
  ballGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  ballButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ballValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  ballLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  instructionText: {
    color: '#B0BEC5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});