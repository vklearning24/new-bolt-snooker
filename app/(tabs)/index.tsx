import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, Video, Settings, Upload, Wifi, Folder, Image, Palette, LogOut } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import StreamQualitySelector from '@/components/StreamQualitySelector';
import LogoUploader from '@/components/LogoUploader';
import StreamSettings from '@/components/StreamSettings';
import TemplateManager from '@/components/TemplateManager';
import LogoManager from '@/components/LogoManager';
import StreamingPlatforms from '@/components/StreamingPlatforms';
import ColorSchemeSelector from '@/components/ColorSchemeSelector';
import { useAuth } from '@/contexts/AuthContext';

export default function LiveStreamSetup() {
  const { user, logout, isAdmin } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [selectedCamera, setSelectedCamera] = useState<'back' | 'front'>('back');
  const [streamQuality, setStreamQuality] = useState('1080p');
  const [logoPosition, setLogoPosition] = useState('top-right');
  const [streamKey, setStreamKey] = useState('demo-stream-key-12345'); // Default for demo
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [playerLogos, setPlayerLogos] = useState({ player1: false, player2: false });
  const [sponsorLogos, setSponsorLogos] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState('classic');
  const [setupProgress, setSetupProgress] = useState({
    camera: false,
    quality: true,
    platforms: false,
    logos: false
  });

  const setupComplete = cameraPermission?.granted && streamKey.length > 0 && setupProgress.quality;

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to use the streaming features.'
        );
      } else {
        setSetupProgress(prev => ({ ...prev, camera: true }));
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    // Update setup progress based on current state
    setSetupProgress(prev => ({
      ...prev,
      platforms: selectedPlatforms.length > 0,
      logos: playerLogos.player1 || playerLogos.player2 || sponsorLogos
    }));
  }, [selectedPlatforms, playerLogos, sponsorLogos]);
  const handleStartPreview = () => {
    console.log('Preview button clicked', { setupComplete, cameraPermission: cameraPermission?.granted, streamKey });
    
    if (!setupComplete) {
      const missingItems = [];
      if (!cameraPermission?.granted) missingItems.push('Camera permission');
      if (!streamKey) missingItems.push('Stream configuration');
      if (!setupProgress.quality) missingItems.push('Stream quality');
      
      Alert.alert(
        'Setup Incomplete', 
        `Please complete the following:\n• ${missingItems.join('\n• ')}`,
        [
          { text: 'Continue Setup', style: 'default' },
          { text: 'Preview Anyway', style: 'destructive', onPress: () => setIsPreviewMode(true) }
        ]
      );
      return;
    }
    setIsPreviewMode(true);
  };

  const currentSettings = {
    streamQuality,
    logoPosition,
    colorScheme,
    playerLogos,
    sponsorLogos,
    streamPlatforms: selectedPlatforms,
  };

  const loadTemplate = (template: any) => {
    setStreamQuality(template.settings.streamQuality);
    setLogoPosition(template.settings.logoPosition);
    setColorScheme(template.settings.colorScheme);
    setPlayerLogos(template.settings.playerLogos);
    setSponsorLogos(template.settings.sponsorLogos);
    setSelectedPlatforms(template.settings.streamPlatforms);
  };

  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.permissionContainer}>
          <Camera size={64} color="#F57F17" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to enable live streaming functionality
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Live Stream Setup</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.name} • {user?.role === 'admin' ? 'Admin Access' : 'Streaming Access'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LogOut size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Camera Preview */}
        <Animated.View entering={FadeInUp.delay(100)} style={[
          styles.section,
          activePanel && styles.minimizedSection
        ]}>
          <View style={styles.sectionHeader}>
            <Video size={24} color="#F57F17" />
            <Text style={styles.sectionTitle}>Camera Preview</Text>
          </View>
          
          {isPreviewMode ? (
            <View style={[
              styles.cameraContainer,
              activePanel && styles.minimizedCamera
            ]}>
              <CameraView style={styles.camera} facing={selectedCamera}>
                <View style={[styles.logoOverlay, { 
                  top: logoPosition.includes('top') ? 20 : undefined,
                  bottom: logoPosition.includes('bottom') ? 20 : undefined,
                  left: logoPosition.includes('left') ? 20 : undefined,
                  right: logoPosition.includes('right') ? 20 : undefined,
                }]}>
                  <Text style={styles.logoText}>LOGO</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.stopPreviewButton}
                  onPress={() => setIsPreviewMode(false)}
                >
                  <Text style={styles.stopPreviewText}>Stop Preview</Text>
                </TouchableOpacity>
              </CameraView>
            </View>
          ) : (
            <View style={[
              styles.previewPlaceholder,
              activePanel && styles.minimizedCamera
            ]}>
              <Camera size={48} color="#666" />
              <Text style={styles.previewText}>Camera preview will appear here</Text>
              <TouchableOpacity style={styles.previewButton} onPress={handleStartPreview}>
                <Text style={styles.previewButtonText}>Start Preview</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={[styles.controlButton, selectedCamera === 'back' && styles.activeControl]}
              onPress={() => setSelectedCamera('back')}
            >
              <Text style={styles.controlButtonText}>Rear Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, selectedCamera === 'front' && styles.activeControl]}
              onPress={() => setSelectedCamera('front')}
            >
              <Text style={styles.controlButtonText}>Front Camera</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Settings Navigation */}
        <View style={styles.settingsNavigation}>
          <TouchableOpacity
            style={[styles.navButton, activePanel === 'quality' && styles.activeNavButton]}
            onPress={() => togglePanel('quality')}
          >
            <Settings size={20} color={activePanel === 'quality' ? '#fff' : '#40E0D0'} />
            <Text style={[styles.navButtonText, activePanel === 'quality' && styles.activeNavText]}>
              Quality
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activePanel === 'logos' && styles.activeNavButton]}
            onPress={() => togglePanel('logos')}
          >
            <Image size={20} color={activePanel === 'logos' ? '#fff' : '#40E0D0'} />
            <Text style={[styles.navButtonText, activePanel === 'logos' && styles.activeNavText]}>
              Logos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activePanel === 'platforms' && styles.activeNavButton]}
            onPress={() => togglePanel('platforms')}
          >
            <Wifi size={20} color={activePanel === 'platforms' ? '#fff' : '#40E0D0'} />
            <Text style={[styles.navButtonText, activePanel === 'platforms' && styles.activeNavText]}>
              Platforms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activePanel === 'colors' && styles.activeNavButton]}
            onPress={() => togglePanel('colors')}
          >
            <Palette size={20} color={activePanel === 'colors' ? '#fff' : '#40E0D0'} />
            <Text style={[styles.navButtonText, activePanel === 'colors' && styles.activeNavText]}>
              Colors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activePanel === 'templates' && styles.activeNavButton]}
            onPress={() => togglePanel('templates')}
          >
            <Folder size={20} color={activePanel === 'templates' ? '#fff' : '#40E0D0'} />
            <Text style={[styles.navButtonText, activePanel === 'templates' && styles.activeNavText]}>
              Templates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Settings Panel */}
        {activePanel && (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.settingsPanel}>
            {activePanel === 'quality' && (
              <StreamQualitySelector 
                selectedQuality={streamQuality}
                onQualityChange={(quality) => {
                  setStreamQuality(quality);
                  setSetupProgress(prev => ({ ...prev, quality: true }));
                }}
              />
            )}
            
            {activePanel === 'logos' && (
              <LogoManager
                playerLogos={playerLogos}
                sponsorLogos={sponsorLogos}
                onPlayerLogoToggle={(player) => 
                  setPlayerLogos(prev => ({
                    ...prev,
                    [`player${player}`]: !prev[`player${player}` as keyof typeof prev]
                  }))
                }
                onSponsorLogoToggle={() => setSponsorLogos(!sponsorLogos)}
                onLogoPositionsChange={() => {}}
              />
            )}
            
            {activePanel === 'platforms' && (
              <StreamingPlatforms
                selectedPlatforms={selectedPlatforms}
                onPlatformToggle={(platformId) => {
                  setSelectedPlatforms(prev => 
                    prev.includes(platformId)
                      ? prev.filter(p => p !== platformId)
                      : [...prev, platformId]
                  );
                }}
              />
            )}
            
            {activePanel === 'colors' && (
              <ColorSchemeSelector
                selectedScheme={colorScheme}
                onSchemeChange={setColorScheme}
              />
            )}
            
            {activePanel === 'templates' && (
              <TemplateManager
                currentSettings={currentSettings}
                onLoadTemplate={loadTemplate}
              />
            )}
          </Animated.View>
        )}

        {/* Setup Status & Preview */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.statusSection}>
          <View style={[styles.statusCard, setupComplete && styles.statusComplete]}>
            <Wifi size={24} color={setupComplete ? '#4CAF50' : '#FF9800'} />
            <Text style={styles.statusTitle}>
              {setupComplete ? 'Ready to Stream' : 'Setup in Progress'}
            </Text>
            
            {/* Setup Progress Indicators */}
            <View style={styles.progressIndicators}>
              <View style={styles.progressItem}>
                <View style={[styles.progressDot, setupProgress.camera && styles.progressComplete]} />
                <Text style={styles.progressLabel}>Camera</Text>
              </View>
              <View style={styles.progressItem}>
                <View style={[styles.progressDot, setupProgress.quality && styles.progressComplete]} />
                <Text style={styles.progressLabel}>Quality</Text>
              </View>
              <View style={styles.progressItem}>
                <View style={[styles.progressDot, setupProgress.platforms && styles.progressComplete]} />
                <Text style={styles.progressLabel}>Platforms</Text>
              </View>
              <View style={styles.progressItem}>
                <View style={[styles.progressDot, setupProgress.logos && styles.progressComplete]} />
                <Text style={styles.progressLabel}>Logos</Text>
              </View>
            </View>
            
            <Text style={styles.statusText}>
              {setupComplete 
                ? 'All settings configured. Ready for live broadcast.'
                : 'Configure your streaming settings above to continue.'
              }
            </Text>
            
            {/* Preview Button */}
            <TouchableOpacity 
              style={[styles.previewButton, setupComplete && styles.previewButtonReady]} 
              onPress={handleStartPreview}
            >
              <Text style={styles.previewButtonText}>
                {setupComplete ? 'Start Preview' : 'Preview Setup'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 16,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    color: '#B0BEC5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#F57F17',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    padding: 8,
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
  cameraContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  camera: {
    flex: 1,
  },
  logoOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: '#F57F17',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stopPreviewButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 127, 23, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stopPreviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewPlaceholder: {
    height: 200,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3C3C3E',
    borderStyle: 'dashed',
  },
  previewText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  previewButton: {
    backgroundColor: '#F57F17',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  minimizedSection: {
    marginBottom: 8,
  },
  minimizedCamera: {
    height: 120,
  },
  settingsNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeNavButton: {
    backgroundColor: '#40E0D0',
  },
  navButtonText: {
    color: '#40E0D0',
    fontSize: 12,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#fff',
  },
  settingsPanel: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cameraControls: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: '#F57F17',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusSection: {
    marginBottom: 40,
  },
  statusCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  statusComplete: {
    borderColor: '#4CAF50',
  },
  statusTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  statusText: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 20,
  },
  progressItem: {
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#333',
  },
  progressComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  progressLabel: {
    color: '#B0BEC5',
    fontSize: 10,
    fontWeight: '500',
  },
  previewButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  previewButtonReady: {
    backgroundColor: '#006994',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});