import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Move, RotateCw, Eye, EyeOff, Trash2, ZoomIn, ZoomOut } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

interface LogoPosition {
  id: string;
  logoId: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
  visible: boolean;
}

interface LogoPositionControllerProps {
  logoPositions: LogoPosition[];
  onUpdatePosition: (id: string, updates: Partial<LogoPosition>) => void;
  onRemovePosition: (id: string) => void;
  selectedPositionId?: string;
  onSelectPosition: (id: string) => void;
}

export default function LogoPositionController({
  logoPositions,
  onUpdatePosition,
  onRemovePosition,
  selectedPositionId,
  onSelectPosition,
}: LogoPositionControllerProps) {
  const [activeControl, setActiveControl] = useState<'position' | 'scale' | 'opacity' | 'rotation' | null>(null);

  const selectedPosition = logoPositions.find(pos => pos.id === selectedPositionId);

  const handlePositionUpdate = (property: keyof LogoPosition, value: any) => {
    if (!selectedPosition) return;
    onUpdatePosition(selectedPosition.id, { [property]: value });
  };

  const resetPosition = () => {
    if (!selectedPosition) return;
    onUpdatePosition(selectedPosition.id, {
      x: 50,
      y: 50,
      scale: 1,
      opacity: 1,
      rotation: 0,
    });
  };

  if (!selectedPosition) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Move size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Logo Selected</Text>
          <Text style={styles.emptySubtitle}>
            Select a logo from the stream to adjust its position
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Move size={24} color="#40E0D0" />
        <Text style={styles.headerTitle}>Logo Controls</Text>
        <TouchableOpacity
          style={styles.visibilityButton}
          onPress={() => handlePositionUpdate('visible', !selectedPosition.visible)}
        >
          {selectedPosition.visible ? (
            <Eye size={20} color="#40E0D0" />
          ) : (
            <EyeOff size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {/* Position Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.controlTitle}>Position</Text>
        <View style={styles.positionGrid}>
          {[
            { label: 'TL', x: 10, y: 10 },
            { label: 'TC', x: 50, y: 10 },
            { label: 'TR', x: 90, y: 10 },
            { label: 'ML', x: 10, y: 50 },
            { label: 'MC', x: 50, y: 50 },
            { label: 'MR', x: 90, y: 50 },
            { label: 'BL', x: 10, y: 90 },
            { label: 'BC', x: 50, y: 90 },
            { label: 'BR', x: 90, y: 90 },
          ].map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.positionPreset,
                selectedPosition.x === preset.x && selectedPosition.y === preset.y && styles.activePreset
              ]}
              onPress={() => {
                handlePositionUpdate('x', preset.x);
                handlePositionUpdate('y', preset.y);
              }}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scale Control */}
      <View style={styles.controlSection}>
        <View style={styles.controlHeader}>
          <Text style={styles.controlTitle}>Scale</Text>
          <Text style={styles.controlValue}>{Math.round(selectedPosition.scale * 100)}%</Text>
        </View>
        <View style={styles.sliderContainer}>
          <ZoomOut size={16} color="#666" />
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={3}
            value={selectedPosition.scale}
            onValueChange={(value) => handlePositionUpdate('scale', value)}
            minimumTrackTintColor="#40E0D0"
            maximumTrackTintColor="#3C3C3E"
            thumbTintColor="#40E0D0"
          />
          <ZoomIn size={16} color="#666" />
        </View>
      </View>

      {/* Opacity Control */}
      <View style={styles.controlSection}>
        <View style={styles.controlHeader}>
          <Text style={styles.controlTitle}>Opacity</Text>
          <Text style={styles.controlValue}>{Math.round(selectedPosition.opacity * 100)}%</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={selectedPosition.opacity}
          onValueChange={(value) => handlePositionUpdate('opacity', value)}
          minimumTrackTintColor="#40E0D0"
          maximumTrackTintColor="#3C3C3E"
          thumbTintColor="#40E0D0"
        />
      </View>

      {/* Rotation Control */}
      <View style={styles.controlSection}>
        <View style={styles.controlHeader}>
          <Text style={styles.controlTitle}>Rotation</Text>
          <Text style={styles.controlValue}>{Math.round(selectedPosition.rotation)}°</Text>
        </View>
        <View style={styles.rotationControls}>
          <TouchableOpacity
            style={styles.rotationButton}
            onPress={() => handlePositionUpdate('rotation', selectedPosition.rotation - 15)}
          >
            <RotateCw size={16} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
            <Text style={styles.rotationButtonText}>-15°</Text>
          </TouchableOpacity>
          
          <Slider
            style={[styles.slider, { flex: 1, marginHorizontal: 12 }]}
            minimumValue={0}
            maximumValue={360}
            value={selectedPosition.rotation}
            onValueChange={(value) => handlePositionUpdate('rotation', value)}
            minimumTrackTintColor="#40E0D0"
            maximumTrackTintColor="#3C3C3E"
            thumbTintColor="#40E0D0"
          />
          
          <TouchableOpacity
            style={styles.rotationButton}
            onPress={() => handlePositionUpdate('rotation', selectedPosition.rotation + 15)}
          >
            <RotateCw size={16} color="#fff" />
            <Text style={styles.rotationButtonText}>+15°</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.resetButton} onPress={resetPosition}>
          <Text style={styles.resetButtonText}>Reset Position</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemovePosition(selectedPosition.id)}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Live Preview Note */}
      <View style={styles.liveNote}>
        <Text style={styles.liveNoteText}>
          🔴 Changes apply instantly to your live stream
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  visibilityButton: {
    padding: 8,
  },
  controlSection: {
    marginBottom: 20,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlValue: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionPreset: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activePreset: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  presetLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  rotationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  rotationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  liveNote: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  liveNoteText: {
    color: '#F44336',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});