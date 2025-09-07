import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Square, Mic, MicOff, Camera, Settings } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ControlPanelSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  isStreaming: boolean;
  isMuted: boolean;
  onToggleStream: () => void;
  onToggleMute: () => void;
  onCameraSwitch: () => void;
  onSettings: () => void;
}

export default function ControlPanelSidebar({
  isVisible,
  onToggle,
  isStreaming,
  isMuted,
  onToggleStream,
  onToggleMute,
  onCameraSwitch,
  onSettings,
}: ControlPanelSidebarProps) {
  const translateX = useSharedValue(200);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const controls = [
    {
      id: 'stop',
      icon: Square,
      label: 'Stop Stream',
      onPress: onToggleStream,
      active: isStreaming,
      color: isStreaming ? '#F44336' : '#666',
    },
    {
      id: 'mic',
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      onPress: onToggleMute,
      active: !isMuted,
      color: isMuted ? '#F44336' : '#40E0D0',
    },
    {
      id: 'camera',
      icon: Camera,
      label: 'Switch Camera',
      onPress: onCameraSwitch,
      active: true,
      color: '#40E0D0',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      onPress: onSettings,
      active: false,
      color: '#666',
    },
  ];

  return (
    <>
      {/* Trigger Area */}
      <TouchableOpacity 
        style={styles.triggerArea} 
        onPress={onToggle}
        activeOpacity={1}
      >
        <View style={styles.triggerIndicator}>
          <Settings size={16} color="#40E0D0" />
        </View>
      </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, animatedStyle]}>
        <LinearGradient
          colors={['rgba(0, 105, 148, 0.95)', 'rgba(64, 224, 208, 0.95)']}
          style={styles.sidebarContent}
        >
          <View style={styles.header}>
            <Settings size={24} color="#fff" />
            <Text style={styles.headerTitle}>Controls</Text>
          </View>

          <View style={styles.controlsContainer}>
            {controls.map((control) => {
              const IconComponent = control.icon;
              return (
                <TouchableOpacity
                  key={control.id}
                  style={[
                    styles.controlItem,
                    control.active && styles.activeControl,
                  ]}
                  onPress={control.onPress}
                >
                  <View style={[styles.controlIcon, { backgroundColor: control.color }]}>
                    <IconComponent size={20} color="#fff" />
                  </View>
                  <Text style={styles.controlLabel}>{control.label}</Text>
                </TouchableOpacity>
              );
            })}
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
    right: 0,
    top: 100,
    width: 40,
    height: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
    zIndex: 10,
  },
  triggerIndicator: {
    backgroundColor: 'rgba(64, 224, 208, 0.8)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 80,
    width: 180,
    zIndex: 20,
  },
  sidebarContent: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
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
  controlsContainer: {
    gap: 12,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  activeControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 14,
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