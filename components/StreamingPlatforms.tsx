import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { Wifi, Youtube, Twitch, Facebook, Instagram, Twitter } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  connected: boolean;
  streamKey?: string;
}

interface StreamingPlatformsProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
}

export default function StreamingPlatforms({ selectedPlatforms, onPlatformToggle }: StreamingPlatformsProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'youtube',
      name: 'YouTube Live',
      icon: Youtube,
      color: '#FF0000',
      connected: selectedPlatforms.includes('youtube'),
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: Twitch,
      color: '#9146FF',
      connected: selectedPlatforms.includes('twitch'),
    },
    {
      id: 'facebook',
      name: 'Facebook Live',
      icon: Facebook,
      color: '#1877F2',
      connected: selectedPlatforms.includes('facebook'),
    },
    {
      id: 'instagram',
      name: 'Instagram Live',
      icon: Instagram,
      color: '#E4405F',
      connected: false,
    },
    {
      id: 'twitter',
      name: 'Twitter Spaces',
      icon: Twitter,
      color: '#1DA1F2',
      connected: false,
    },
  ]);

  const [streamQuality, setStreamQuality] = useState({
    youtube: '1080p',
    twitch: '720p',
    facebook: '720p',
  });

  const togglePlatform = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    if (!platform.connected) {
      Alert.alert(
        `Connect to ${platform.name}`,
        'You need to authenticate and provide stream keys for this platform.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              setPlatforms(prev => prev.map(p => 
                p.id === platformId ? { ...p, connected: true } : p
              ));
              onPlatformToggle(platformId);
            },
          },
        ]
      );
    } else {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, connected: false } : p
      ));
      onPlatformToggle(platformId);
    }
  };

  const connectedPlatforms = platforms.filter(p => p.connected);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Wifi size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Streaming Platforms</Text>
      </View>

      {/* Connected Platforms Summary */}
      {connectedPlatforms.length > 0 && (
        <View style={styles.connectedSummary}>
          <Text style={styles.connectedTitle}>
            Streaming to {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.connectedList}>
            {connectedPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <View key={platform.id} style={[styles.connectedPlatform, { borderColor: platform.color }]}>
                  <IconComponent size={16} color={platform.color} />
                  <Text style={styles.connectedPlatformText}>{platform.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Platform List */}
      <View style={styles.platformsList}>
        {platforms.map((platform, index) => {
          const IconComponent = platform.icon;
          return (
            <Animated.View key={platform.id} entering={FadeInUp.delay(index * 100)}>
              <View style={[styles.platformCard, platform.connected && styles.connectedCard]}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                      <IconComponent size={20} color="#fff" />
                    </View>
                    <View style={styles.platformDetails}>
                      <Text style={styles.platformName}>{platform.name}</Text>
                      <Text style={styles.platformStatus}>
                        {platform.connected ? 'Connected' : 'Not connected'}
                      </Text>
                    </View>
                  </View>
                  
                  <Switch
                    value={platform.connected}
                    onValueChange={() => togglePlatform(platform.id)}
                    trackColor={{ false: '#3C3C3E', true: platform.color }}
                    thumbColor={platform.connected ? '#fff' : '#666'}
                  />
                </View>

                {platform.connected && (
                  <View style={styles.platformSettings}>
                    <Text style={styles.settingLabel}>Stream Quality</Text>
                    <View style={styles.qualityButtons}>
                      {['720p', '1080p', '4K'].map((quality) => (
                        <TouchableOpacity
                          key={quality}
                          style={[
                            styles.qualityButton,
                            streamQuality[platform.id as keyof typeof streamQuality] === quality && 
                            styles.selectedQuality
                          ]}
                          onPress={() => setStreamQuality(prev => ({
                            ...prev,
                            [platform.id]: quality
                          }))}
                        >
                          <Text style={styles.qualityText}>{quality}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.streamingNote}>
        <Text style={styles.noteText}>
          🔴 Multi-platform streaming maintains optimal quality for each platform automatically
        </Text>
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
  connectedSummary: {
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.3)',
  },
  connectedTitle: {
    color: '#40E0D0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  connectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectedPlatform: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 6,
  },
  connectedPlatformText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  platformsList: {
    gap: 12,
  },
  platformCard: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  connectedCard: {
    borderColor: '#40E0D0',
    backgroundColor: 'rgba(64, 224, 208, 0.05)',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  platformStatus: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 2,
  },
  platformSettings: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  selectedQuality: {
    backgroundColor: '#40E0D0',
    borderColor: '#40E0D0',
  },
  qualityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  streamingNote: {
    backgroundColor: 'rgba(245, 127, 23, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 127, 23, 0.3)',
  },
  noteText: {
    color: '#F57F17',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});