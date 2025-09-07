import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Zap, Star, Target, Award, Flame, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import SpecialMomentCard from '@/components/SpecialMomentCard';
import MomentHistory from '@/components/MomentHistory';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Moment {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  player: string;
}

export default function SpecialMomentsTrigger() {
  return (
    <ProtectedRoute requiredRole="admin">
      <MomentsContent />
    </ProtectedRoute>
  );
}

function MomentsContent() {
  const [triggeredMoments, setTriggeredMoments] = useState<Moment[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<'Player 1' | 'Player 2'>('Player 1');

  const triggerAnimation = useSharedValue(1);

  const specialMoments = [
    {
      id: 'century-break',
      icon: Crown,
      title: 'Century Break',
      description: '100+ points in single visit',
      color: '#FFD700',
      gradient: ['#FFD700', '#FFA000'],
    },
    {
      id: 'maximum-break',
      icon: Star,
      title: 'Maximum Break',
      description: 'Perfect 147 break',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#E53E3E'],
    },
    {
      id: 'difficult-shot',
      icon: Target,
      title: 'Incredible Shot',
      description: 'Outstanding skill display',
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#26A69A'],
    },
    {
      id: 'comeback',
      icon: Flame,
      title: 'Amazing Comeback',
      description: 'Overturning significant deficit',
      color: '#FF9500',
      gradient: ['#FF9500', '#FF6F00'],
    },
    {
      id: 'match-winner',
      icon: Award,
      title: 'Match Winner',
      description: 'Decisive final shot',
      color: '#9C27B0',
      gradient: ['#9C27B0', '#7B1FA2'],
    },
    {
      id: 'break-builder',
      icon: Zap,
      title: 'Break Builder',
      description: '50+ points break',
      color: '#2196F3',
      gradient: ['#2196F3', '#1976D2'],
    },
  ];

  const animatedTriggerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: triggerAnimation.value }],
  }));

  const triggerMoment = (moment: typeof specialMoments[0]) => {
    triggerAnimation.value = withSequence(
      withSpring(1.2),
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );

    const newMoment: Moment = {
      id: `${moment.id}-${Date.now()}`,
      type: moment.id,
      title: moment.title,
      description: moment.description,
      timestamp: new Date(),
      player: selectedPlayer,
    };

    setTriggeredMoments(prev => [newMoment, ...prev]);

    // In a real app, this would trigger the overlay animation on the stream
    console.log('Triggering special moment:', newMoment);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <Text style={styles.headerTitle}>Special Moments</Text>
        <Text style={styles.headerSubtitle}>Highlight exceptional plays</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player Selection */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={24} color="#40E0D0" />
            <Text style={styles.sectionTitle}>Select Player</Text>
          </View>
          
          <View style={styles.playerSelection}>
            <TouchableOpacity
              style={[styles.playerButton, selectedPlayer === 'Player 1' && styles.selectedPlayer]}
              onPress={() => setSelectedPlayer('Player 1')}
            >
              <Text style={[styles.playerButtonText, selectedPlayer === 'Player 1' && styles.selectedPlayerText]}>
                Player 1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playerButton, selectedPlayer === 'Player 2' && styles.selectedPlayer]}
              onPress={() => setSelectedPlayer('Player 2')}
            >
              <Text style={[styles.playerButtonText, selectedPlayer === 'Player 2' && styles.selectedPlayerText]}>
                Player 2
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Special Moments Grid */}
        <Animated.View entering={SlideInUp.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={24} color="#40E0D0" />
            <Text style={styles.sectionTitle}>Trigger Moments</Text>
          </View>
          
          <View style={styles.momentsGrid}>
            {specialMoments.map((moment, index) => (
              <Animated.View
                key={moment.id}
                entering={SlideInUp.delay(300 + index * 100)}
                style={animatedTriggerStyle}
              >
                <SpecialMomentCard
                  moment={moment}
                  onTrigger={() => triggerMoment(moment)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Moment History */}
        <Animated.View entering={SlideInUp.delay(800)} style={styles.section}>
          <MomentHistory moments={triggeredMoments} />
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
  playerSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  playerButton: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayer: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  playerButtonText: {
    color: '#B0BEC5',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPlayerText: {
    color: '#fff',
  },
  momentsGrid: {
    gap: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});