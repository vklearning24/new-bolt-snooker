import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Eye, Heart } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

interface ViewerStatsProps {
  viewerCount: number;
  isStreaming: boolean;
  isLandscape?: boolean;
}

export default function ViewerStats({ viewerCount, isStreaming, isLandscape = false }: ViewerStatsProps) {
  if (!isStreaming) return null;

  const likes = Math.floor(viewerCount * 0.7);
  const shares = Math.floor(viewerCount * 0.1);

  return (
    <Animated.View entering={FadeIn.delay(1000)} style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <Animated.View entering={SlideInRight.delay(1200)} style={styles.stat}>
        <Eye size={16} color="#fff" />
        <Text style={styles.statText}>{viewerCount}</Text>
      </Animated.View>
      
      <Animated.View entering={SlideInRight.delay(1400)} style={styles.stat}>
        <Heart size={16} color="#FF6B6B" />
        <Text style={styles.statText}>{likes}</Text>
      </Animated.View>
      
      <Animated.View entering={SlideInRight.delay(1600)} style={styles.stat}>
        <Users size={16} color="#4ECDC4" />
        <Text style={styles.statText}>{shares}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    right: 20,
    gap: 12,
  },
  landscapeContainer: {
    top: 80,
    right: 60,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});