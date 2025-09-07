import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Square, Mic, MicOff, Settings, Camera } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface StreamControlsProps {
  isStreaming: boolean;
  isMuted: boolean;
  onToggleStream: () => void;
  onToggleMute: () => void;
  onSettings: () => void;
  isLandscape?: boolean;
}

export default function StreamControls({
  isStreaming,
  isMuted,
  onToggleStream,
  onToggleMute,
  onSettings,
  isLandscape = false,
}: StreamControlsProps) {
  const streamButtonScale = useSharedValue(1);
  const muteButtonScale = useSharedValue(1);

  const streamButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streamButtonScale.value }],
  }));

  const muteButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: muteButtonScale.value }],
  }));

  const handleStreamPress = () => {
    streamButtonScale.value = withSpring(0.9, {}, () => {
      streamButtonScale.value = withSpring(1);
    });
    onToggleStream();
  };

  const handleMutePress = () => {
    muteButtonScale.value = withSpring(0.9, {}, () => {
      muteButtonScale.value = withSpring(1);
    });
    onToggleMute();
  };

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={[styles.controls, isLandscape && styles.landscapeControls]}>
        {/* Settings */}
        <TouchableOpacity style={styles.controlButton} onPress={onSettings}>
          <Settings size={24} color="#fff" />
        </TouchableOpacity>

        {/* Camera Switch */}
        <TouchableOpacity style={styles.controlButton}>
          <Camera size={24} color="#fff" />
        </TouchableOpacity>

        {/* Mute/Unmute */}
        <Animated.View style={muteButtonStyle}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.mutedButton]}
            onPress={handleMutePress}
          >
            {isMuted ? (
              <MicOff size={24} color="#fff" />
            ) : (
              <Mic size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Stream Toggle */}
        <Animated.View style={streamButtonStyle}>
          <TouchableOpacity
            style={[
              styles.streamButton,
              isStreaming ? styles.stopButton : styles.startButton
            ]}
            onPress={handleStreamPress}
          >
            {isStreaming ? (
              <Square size={28} color="#fff" fill="#fff" />
            ) : (
              <Play size={28} color="#fff" fill="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  landscapeContainer: {
    paddingHorizontal: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  landscapeControls: {
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mutedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  streamButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  startButton: {
    backgroundColor: '#006994',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
});