import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Eye, Heart, Share } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ViewerCountSidebarProps {
  viewerCount: number;
  isVisible: boolean;
  onToggle: () => void;
}

export default function ViewerCountSidebar({ viewerCount, isVisible, onToggle }: ViewerCountSidebarProps) {
  const translateX = useSharedValue(-200);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const likes = Math.floor(viewerCount * 0.7);
  const shares = Math.floor(viewerCount * 0.1);

  return (
    <>
      {/* Trigger Area */}
      <TouchableOpacity 
        style={styles.triggerArea} 
        onPress={onToggle}
        activeOpacity={1}
      >
        <View style={styles.triggerIndicator}>
          <Users size={16} color="#40E0D0" />
        </View>
      </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, animatedStyle]}>
        <LinearGradient
          colors={['rgba(0, 105, 148, 0.95)', 'rgba(64, 224, 208, 0.95)']}
          style={styles.sidebarContent}
        >
          <View style={styles.header}>
            <Users size={24} color="#fff" />
            <Text style={styles.headerTitle}>Live Viewers</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Eye size={20} color="#fff" />
              <Text style={styles.statValue}>{viewerCount}</Text>
              <Text style={styles.statLabel}>Watching</Text>
            </View>

            <View style={styles.statItem}>
              <Heart size={20} color="#FF6B6B" />
              <Text style={styles.statValue}>{likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>

            <View style={styles.statItem}>
              <Share size={20} color="#4ECDC4" />
              <Text style={styles.statValue}>{shares}</Text>
              <Text style={styles.statLabel}>Shares</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onToggle}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  triggerArea: {
    position: 'absolute',
    left: 0,
    top: 100,
    width: 40,
    height: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    zIndex: 10,
  },
  triggerIndicator: {
    backgroundColor: 'rgba(64, 224, 208, 0.8)',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 80,
    width: 180,
    zIndex: 20,
  },
  sidebarContent: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});