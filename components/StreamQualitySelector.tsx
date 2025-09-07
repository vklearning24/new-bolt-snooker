import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Settings } from 'lucide-react-native';

interface StreamQualitySelectorProps {
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
}

const qualityOptions = [
  { value: '720p', label: '720p HD', bitrate: '2.5 Mbps' },
  { value: '1080p', label: '1080p Full HD', bitrate: '5 Mbps' },
  { value: '4K', label: '4K Ultra HD', bitrate: '15 Mbps' },
];

export default function StreamQualitySelector({ 
  selectedQuality, 
  onQualityChange 
}: StreamQualitySelectorProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Settings size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Stream Quality</Text>
      </View>
      
      <View style={styles.qualityGrid}>
        {qualityOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.qualityOption,
              selectedQuality === option.value && styles.selectedQuality
            ]}
            onPress={() => onQualityChange(option.value)}
          >
            <Text style={[
              styles.qualityLabel,
              selectedQuality === option.value && styles.selectedQualityText
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.qualityBitrate,
              selectedQuality === option.value && styles.selectedQualityText
            ]}>
              {option.bitrate}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.qualityNote}>
        Higher quality requires more bandwidth. Choose based on your internet connection.
      </Text>
    </ScrollView>
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
  qualityGrid: {
    gap: 12,
  },
  qualityOption: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedQuality: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  qualityLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qualityBitrate: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4,
  },
  selectedQualityText: {
    color: '#fff',
  },
  qualityNote: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});