import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Settings, Circle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface ColorSchemeSelectorProps {
  selectedScheme: string;
  onSchemeChange: (schemeId: string) => void;
}

const colorSchemes: ColorScheme[] = [
  {
    id: 'classic',
    name: 'Classic Green',
    primary: '#1B5E20',
    secondary: '#2E7D32',
    accent: '#40E0D0',
    background: 'rgba(27, 94, 32, 0.9)',
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    primary: '#0D47A1',
    secondary: '#1565C0',
    accent: '#40E0D0',
    background: 'rgba(13, 71, 161, 0.9)',
  },
  {
    id: 'elegant',
    name: 'Elegant Purple',
    primary: '#4A148C',
    secondary: '#6A1B9A',
    accent: '#40E0D0',
    background: 'rgba(74, 20, 140, 0.9)',
  },
  {
    id: 'professional',
    name: 'Professional Gray',
    primary: '#263238',
    secondary: '#37474F',
    accent: '#40E0D0',
    background: 'rgba(38, 50, 56, 0.9)',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Orange',
    primary: '#E65100',
    secondary: '#FF6F00',
    accent: '#40E0D0',
    background: 'rgba(230, 81, 0, 0.9)',
  },
];

export default function ColorSchemeSelector({ selectedScheme, onSchemeChange }: ColorSchemeSelectorProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <View style={styles.sectionHeader}>
          <Settings size={24} color="#40E0D0" />
          <Text style={styles.sectionTitle}>Scoreboard Color Schemes</Text>
        </View>

        <Text style={styles.description}>
          Choose a color scheme for your scoreboard. Changes apply instantly during live streaming.
        </Text>

        <View style={styles.schemesGrid}>
          {colorSchemes.map((scheme, index) => (
            <Animated.View key={scheme.id} entering={FadeInUp.delay(index * 100)}>
              <TouchableOpacity
                style={[
                  styles.schemeCard,
                  selectedScheme === scheme.id && styles.selectedScheme,
                  { borderColor: scheme.accent }
                ]}
                onPress={() => onSchemeChange(scheme.id)}
              >
                <View style={styles.schemePreview}>
                  <View style={[styles.colorSwatch, { backgroundColor: scheme.primary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: scheme.secondary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: scheme.accent }]} />
                </View>
                
                <Text style={[
                  styles.schemeName,
                  selectedScheme === scheme.id && styles.selectedSchemeName
                ]}>
                  {scheme.name}
                </Text>
                
                {selectedScheme === scheme.id && (
                  <View style={styles.activeIndicator}>
                    <Circle size={8} color="#40E0D0" fill="#40E0D0" />
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.liveUpdateNote}>
          <Text style={styles.noteText}>
            ⚡ Color changes apply instantly without interrupting your live stream
          </Text>
        </View>
      </View>
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
  description: {
    color: '#B0BEC5',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  schemesGrid: {
    gap: 12,
  },
  schemeCard: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedScheme: {
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
  },
  schemePreview: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  schemeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSchemeName: {
    color: '#40E0D0',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  activeText: {
    color: '#40E0D0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveUpdateNote: {
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.3)',
  },
  noteText: {
    color: '#40E0D0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});