import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

interface MatchData {
  player1: {
    name: string;
    flag: string;
    frameScore: number;
    currentScore: number;
    breakCount?: number;
  };
  player2: {
    name: string;
    flag: string;
    frameScore: number;
    currentScore: number;
    breakCount?: number;
  };
  currentFrame: number;
  remainingReds: number;
  currentPlayer: number;
}

interface BroadcastScoreboardProps {
  matchData: MatchData;
  isLandscape: boolean;
  onPositionChange?: (x: number, y: number) => void;
  initialPosition?: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  isDraggable?: boolean;
}

export default function BroadcastScoreboard({ 
  matchData, 
  isLandscape, 
  onPositionChange,
  initialPosition = { x: 50, y: 50 },
  containerWidth,
  containerHeight,
  isDraggable = true
}: BroadcastScoreboardProps) {
  const [scoreboardLayout, setScoreboardLayout] = React.useState({ width: 280, height: 120 });
  const translateX = useSharedValue((initialPosition.x / 100) * containerWidth);
  const translateY = useSharedValue((initialPosition.y / 100) * containerHeight);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  // Update position when orientation changes or initialPosition changes
  React.useEffect(() => {
    // Safeguard against zero dimensions
    const safeContainerWidth = containerWidth || 1;
    const safeContainerHeight = containerHeight || 1;
    
    // Clamp percentage positions to valid range
    const clampedX = Math.max(0, Math.min(100, initialPosition.x));
    const clampedY = Math.max(0, Math.min(100, initialPosition.y));
    
    translateX.value = withSpring((clampedX / 100) * safeContainerWidth);
    translateY.value = withSpring((clampedY / 100) * safeContainerHeight);
  }, [initialPosition.x, initialPosition.y, containerWidth, containerHeight]);

  // Force update position values when container dimensions change significantly
  React.useEffect(() => {
    if (!isDragging.value && containerWidth > 0 && containerHeight > 0) {
      const currentXPercent = (translateX.value / (containerWidth || 1)) * 100;
      const currentYPercent = (translateY.value / (containerHeight || 1)) * 100;
      
      // Only update if the current position seems invalid
      if (currentXPercent < 0 || currentXPercent > 100 || currentYPercent < 0 || currentYPercent > 100) {
        translateX.value = withSpring((initialPosition.x / 100) * containerWidth);
        translateY.value = withSpring((initialPosition.y / 100) * containerHeight);
      }
    }
  }, [containerWidth, containerHeight]);

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
    },
    onActive: (event, context: any) => {
      if (!context.startX) {
        context.startX = translateX.value;
        context.startY = translateY.value;
      }
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: () => {
      isDragging.value = false;
      scale.value = withSpring(1);
      
      // Use actual scoreboard dimensions for accurate constraints
      const scoreboardWidth = scoreboardLayout.width;
      const scoreboardHeight = scoreboardLayout.height;
      const padding = 20;
      
      // Safeguard against zero dimensions
      const safeContainerWidth = containerWidth || 1;
      const safeContainerHeight = containerHeight || 1;
      
      // Ensure the scoreboard stays within bounds
      const maxX = Math.max(padding, safeContainerWidth - scoreboardWidth - padding);
      const maxY = Math.max(padding, safeContainerHeight - scoreboardHeight - padding);
      
      const constrainedX = Math.max(padding, Math.min(maxX, translateX.value));
      const constrainedY = Math.max(padding, Math.min(maxY, translateY.value));
      
      translateX.value = withSpring(constrainedX);
      translateY.value = withSpring(constrainedY);

      // Convert to percentage and notify parent
      const newX = Math.max(0, Math.min(100, (constrainedX / safeContainerWidth) * 100));
      const newY = Math.max(0, Math.min(100, (constrainedY / safeContainerHeight) * 100));
      
      if (onPositionChange) {
        runOnJS(onPositionChange)(newX, newY);
      }
    },
  }, [scoreboardLayout, containerWidth, containerHeight, onPositionChange, initialPosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Ensure the component re-renders when container dimensions change
  React.useEffect(() => {
    // This effect ensures the component updates when dimensions change
  }, [containerWidth, containerHeight, initialPosition]);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setScoreboardLayout({ width, height });
  };
  const ScoreboardContent = () => (
    <LinearGradient
      colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
      style={[styles.scoreboard, isLandscape && styles.landscapeScoreboard]}
      onLayout={handleLayout}
    >
      {isDraggable && (
        <View style={styles.dragIndicator}>
          <View style={styles.dragHandle} />
          <View style={styles.dragHandle} />
          <View style={styles.dragHandle} />
        </View>
      )}
      
        {/* Player 1 Section */}
        <View style={[styles.playerSection, isLandscape && styles.landscapePlayerSection]}>
          <View style={styles.playerInfo}>
            <Text style={styles.flag}>{matchData.player1.flag}</Text>
            <View style={styles.frameScoreContainer}>
              <Text style={styles.frameScoreText}>{matchData.player1.frameScore}</Text>
            </View>
            {matchData.currentPlayer === 1 && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeArrow} />
              </View>
            )}
          </View>
          <View style={[
            styles.playerNameContainer,
            matchData.currentPlayer === 1 && styles.activePlayerContainer
          ]}>
            <Text style={[
              styles.playerName, 
              matchData.currentPlayer === 1 && styles.activePlayerName
            ]}>
              {matchData.player1.name}
            </Text>
            {matchData.currentPlayer === 1 && matchData.player1.breakCount !== undefined && (
              <View style={styles.breakCountContainer}>
                <Text style={styles.breakLabel}>Break</Text>
                <Text style={styles.breakCount}>{matchData.player1.breakCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Center Score Section */}
        <View style={[styles.centerSection, isLandscape && styles.landscapeCenterSection]}>
          <View style={styles.currentScores}>
            <Text style={styles.currentScore}>{matchData.player1.currentScore}</Text>
            <View style={styles.frameInfo}>
              <Text style={styles.frameNumber}>({matchData.currentFrame})</Text>
            </View>
            <Text style={styles.currentScore}>{matchData.player2.currentScore}</Text>
          </View>

          {/* Remaining Reds Indicator */}
          <View style={styles.redsIndicator}>
            {Array.from({ length: 6 }, (_, i) => (
              <View 
                key={i}
                style={[
                  styles.redDot,
                  i < matchData.remainingReds && styles.activeRedDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Player 2 Section */}
        <View style={[styles.playerSection, isLandscape && styles.landscapePlayerSection]}>
          <View style={styles.playerInfo}>
            {matchData.currentPlayer === 2 && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeArrow} />
              </View>
            )}
            <View style={styles.frameScoreContainer}>
              <Text style={styles.frameScoreText}>{matchData.player2.frameScore}</Text>
            </View>
            <Text style={styles.flag}>{matchData.player2.flag}</Text>
          </View>
          <View style={[
            styles.playerNameContainer,
            matchData.currentPlayer === 2 && styles.activePlayerContainer
          ]}>
            <Text style={[
              styles.playerName, 
              matchData.currentPlayer === 2 && styles.activePlayerName
            ]}>
              {matchData.player2.name}
            </Text>
            {matchData.currentPlayer === 2 && matchData.player2.breakCount !== undefined && (
              <View style={styles.breakCountContainer}>
                <Text style={styles.breakLabel}>Break</Text>
                <Text style={styles.breakCount}>{matchData.player2.breakCount}</Text>
              </View>
            )}
          </View>
        </View>
    </LinearGradient>
  );

  if (!isDraggable) {
    return <ScoreboardContent />;
  }

  return (
    <PanGestureHandler onGestureEvent={panGestureHandler}>
      <Animated.View style={[styles.draggableContainer, animatedStyle]}>
        <ScoreboardContent />
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  draggableContainer: {
    position: 'absolute',
    zIndex: 25,
  },
  dragIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 2,
  },
  dragHandle: {
    width: 3,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1.5,
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#40E0D0',
    minWidth: 280,
    maxWidth: 400,
  },
  landscapeScoreboard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 320,
    maxWidth: 450,
  },
  playerSection: {
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 80,
  },
  landscapePlayerSection: {
    minWidth: 100,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIndicator: {
    marginHorizontal: 8,
  },
  activeArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#40E0D0',
  },
  flag: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  frameScoreContainer: {
    backgroundColor: '#006994',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  frameScoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerNameContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  activePlayerContainer: {
    backgroundColor: 'rgba(64, 224, 208, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.3)',
  },
  playerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  activePlayerName: {
    color: '#40E0D0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  breakCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakLabel: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  breakCount: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerSection: {
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  landscapeCenterSection: {
    minWidth: 140,
    paddingHorizontal: 12,
  },
  currentScores: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  currentScore: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'center',
  },
  frameInfo: {
    marginHorizontal: 8,
  },
  frameNumber: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  redsIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
  },
  activeRedDot: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});