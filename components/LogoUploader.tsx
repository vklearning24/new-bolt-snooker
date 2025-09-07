import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Upload, Image } from 'lucide-react-native';

interface LogoUploaderProps {
  logoPosition: string;
  onPositionChange: (position: string) => void;
}

const positions = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export default function LogoUploader({ logoPosition, onPositionChange }: LogoUploaderProps) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Image size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Logo & Branding</Text>
      </View>
      
      <TouchableOpacity style={styles.uploadButton}>
        <Upload size={24} color="#F57F17" />
        <Text style={styles.uploadText}>Upload Logo</Text>
        <Text style={styles.uploadSubtext}>PNG or SVG recommended</Text>
      </TouchableOpacity>
      
      <Text style={styles.positionTitle}>Logo Position</Text>
      <View style={styles.positionGrid}>
        {positions.map((position) => (
          <TouchableOpacity
            key={position.value}
            style={[
              styles.positionOption,
              logoPosition === position.value && styles.selectedPosition
            ]}
            onPress={() => onPositionChange(position.value)}
          >
            <Text style={[
              styles.positionLabel,
              logoPosition === position.value && styles.selectedPositionText
            ]}>
              {position.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  uploadButton: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40E0D0',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    color: '#40E0D0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadSubtext: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 4,
  },
  positionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionOption: {
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPosition: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  positionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPositionText: {
    color: '#fff',
  },
});