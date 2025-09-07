import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Camera, Video, Settings, Wifi, Image, Folder, RotateCcw, Zap, Target } from 'lucide-react-native';
import { CameraView } from 'expo-camera';
import Animated, { FadeInUp, SlideInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import BroadcastScoreboard from '@/components/BroadcastScoreboard';
import StreamControls from '@/components/StreamControls';
import ViewerCountSidebar from '@/components/ViewerCountSidebar';
import StreamQualitySelector from '@/components/StreamQualitySelector';
import LogoManager from '@/components/LogoManager';
import StreamingPlatforms from '@/components/StreamingPlatforms';
import ColorSchemeSelector from '@/components/ColorSchemeSelector';
import TemplateManager from '@/components/TemplateManager';
import LiveLogoOverlay from '@/components/LiveLogoOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function LiveStreamControl() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const isLandscape = width > height;
  const [showViewerSidebar, setShowViewerSidebar] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>(null);
  const [streamQuality, setStreamQuality] = useState('1080p');
  const [logoPosition, setLogoPosition] = useState('top-right');
  const [colorScheme, setColorScheme] = useState('classic');
  const [draggableScoreboardPosition, setDraggableScoreboardPosition] = useState({ x: 50, y: 50 }); // Percentage-based position
  const [matchData, setMatchData] = useState({
    player1: { name: 'Player 1', currentScore: 0, frameScore: 0 },
    player2: { name: 'Player 2', currentScore: 0, frameScore: 0 },
    currentFrame: 1,
    currentPlayer: 1,
  });
  const [playerLogos, setPlayerLogos] = useState({ player1: false, player2: false });
  const [sponsorLogos, setSponsorLogos] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [logoPositions, setLogoPositions] = useState<LogoPosition[]>([]);
  const [selectedLogoPositionId, setSelectedLogoPositionId] = useState<string | null>(null);
  const [isScoreboardDraggable, setIsScoreboardDraggable] = useState(false);
  
  const settingsOpacity = useSharedValue(0);
  const settingsTranslateY = useSharedValue(50);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
        setViewerCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Animated styles
  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    transform: [{ translateY: settingsTranslateY.value }],
  }));

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    setIsScoreboardDraggable(!isStreaming);
    if (!isStreaming) {
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    } else {
      setStreamDuration(0);
      setViewerCount(0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const showSettings = () => {
    if (!showSettingsPopup) {
      setShowSettingsPopup(true);
    }
    settingsOpacity.value = withTiming(1, { duration: 300 });
    settingsTranslateY.value = withTiming(0, { duration: 300 });
  };

  const hideSettings = () => {
    settingsOpacity.value = withTiming(0, { duration: 200 });
    settingsTranslateY.value = withTiming(50, { duration: 200 });
    setTimeout(() => {
      setShowSettingsPopup(false);
      setActiveSettingsPanel(null);
    }, 200);
  };

  const toggleSettingsPanel = (panelName: string) => {
    setActiveSettingsPanel(activeSettingsPanel === panelName ? null : panelName);
  };

  const resetScoreboard = () => {
    setMatchData(prev => ({
      ...prev,
      player1: { ...prev.player1, currentScore: 0 },
      player2: { ...prev.player2, currentScore: 0 },
      currentPlayer: 1,
    }));
  };

  const resetFrames = () => {
    setMatchData(prev => ({
      ...prev,
      player1: { ...prev.player1, frameScore: 0, currentScore: 0 },
      player2: { ...prev.player2, frameScore: 0, currentScore: 0 },
      currentFrame: 1,
      currentPlayer: 1,
    }));
  };

  const handleScoreboardPositionChange = (x: number, y: number) => {
    setDraggableScoreboardPosition({ x, y });
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStreaming) {
    return (
      <View style={styles.setupContainer}>
        <LinearGradient colors={['#1B1B1B', '#2C2C2C']} style={styles.setupHeader}>
          <Text style={styles.setupTitle}>Ready to Stream</Text>
          <Text style={styles.setupSubtitle}>Professional snooker broadcast</Text>
        </LinearGradient>
        
        <View style={styles.setupContent}>
          <View style={styles.setupCard}>
            <Video size={64} color="#F57F17" />
            <Text style={styles.setupCardTitle}>Stream Configuration Complete</Text>
            <Text style={styles.setupCardText}>
              Camera, quality, and stream settings are configured. Ready to begin live broadcast.
            </Text>
            
            <TouchableOpacity style={styles.startStreamButton} onPress={toggleStream}>
              <Text style={styles.startStreamText}>Start Live Stream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      {/* Camera Feed */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back">
          {/* Live Logo Overlay */}
          <LiveLogoOverlay
            logos={[]} // This would come from your logo state
            logoPositions={logoPositions}
            onUpdatePosition={(id, updates) => {
              setLogoPositions(prev => prev.map(pos =>
                pos.id === id ? { ...pos, ...updates } : pos
              ));
            }}
            onSelectPosition={setSelectedLogoPositionId}
            initialPosition={draggableScoreboardPosition}
            containerWidth={width}
            containerHeight={height}
            isLive={isStreaming}
          />

          {/* Scoreboard */}
          <BroadcastScoreboard
            matchData={matchData}
            isLandscape={isLandscape}
            onPositionChange={handleScoreboardPositionChange}
            initialPosition={draggableScoreboardPosition}
            containerWidth={width}
            containerHeight={height}
            isDraggable={isScoreboardDraggable}
          />

          {/* Live Indicator */}
          <Animated.View entering={FadeInUp} style={[styles.liveIndicator, isLandscape && styles.landscapeLiveIndicator]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
            <Text style={styles.duration}>{formatDuration(streamDuration)}</Text>
          </Animated.View>

          {/* Viewer Count Sidebar */}
          <ViewerCountSidebar
            viewerCount={viewerCount}
            isVisible={showViewerSidebar}
            onToggle={() => setShowViewerSidebar(!showViewerSidebar)}
          />

          {/* Live Button with Hover Settings */}
          <View style={styles.liveButtonContainer}>
            <TouchableOpacity
              style={styles.liveButton}
              onPress={showSettings}
            >
              <View style={styles.liveDotLarge} />
              <Text style={styles.liveButtonText}>LIVE</Text>
            </TouchableOpacity>

            {/* Settings Popup */}
            {showSettingsPopup && (
              <TouchableOpacity 
                style={styles.settingsOverlay} 
                activeOpacity={1}
                onPress={hideSettings}
              >
                <TouchableOpacity 
                  style={[styles.settingsPopup, settingsAnimatedStyle]}
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                <View style={styles.settingsHeader}>
                  <Settings size={20} color="#40E0D0" />
                  <Text style={styles.settingsTitle}>Live Controls</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickAction} onPress={resetScoreboard}>
                    <RotateCcw size={16} color="#fff" />
                    <Text style={styles.quickActionText}>Reset Scores</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction} onPress={resetFrames}>
                    <Target size={16} color="#fff" />
                    <Text style={styles.quickActionText}>Reset Frames</Text>
                  </TouchableOpacity>
                </View>

                {/* Scoreboard Position */}
                <View style={styles.positionSection}>
                  <Text style={styles.positionTitle}>Scoreboard Position</Text>
                  <View style={styles.positionGrid}>
                    {[
                      { label: 'Top', x: 50, y: 10 },
                      { label: 'Bottom', x: 50, y: 90 },
                      { label: 'Left', x: 10, y: 50 },
                      { label: 'Right', x: 90, y: 50 }
                    ].map((position) => (
                      <TouchableOpacity
                        key={position.label}
                        style={[
                          styles.positionButton,
                        ]}
                        onPress={() => setDraggableScoreboardPosition({ x: position.x, y: position.y })}
                      >
                        <Text style={[
                          styles.positionText,
                        ]}>
                          {position.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Settings Navigation */}
                <View style={styles.settingsNavigation}>
                  <TouchableOpacity
                    style={[styles.navButton, activeSettingsPanel === 'quality' && styles.activeNavButton]}
                    onPress={() => toggleSettingsPanel('quality')}
                  >
                    <Settings size={16} color={activeSettingsPanel === 'quality' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.navButtonText, activeSettingsPanel === 'quality' && styles.activeNavText]}>
                      Quality
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, activeSettingsPanel === 'logos' && styles.activeNavButton]}
                    onPress={() => toggleSettingsPanel('logos')}
                  >
                    <Image size={16} color={activeSettingsPanel === 'logos' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.navButtonText, activeSettingsPanel === 'logos' && styles.activeNavText]}>
                      Logos
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, activeSettingsPanel === 'platforms' && styles.activeNavButton]}
                    onPress={() => toggleSettingsPanel('platforms')}
                  >
                    <Wifi size={16} color={activeSettingsPanel === 'platforms' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.navButtonText, activeSettingsPanel === 'platforms' && styles.activeNavText]}>
                      Platforms
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, activeSettingsPanel === 'colors' && styles.activeNavButton]}
                    onPress={() => toggleSettingsPanel('colors')}
                  >
                    <Settings size={16} color={activeSettingsPanel === 'colors' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.navButtonText, activeSettingsPanel === 'colors' && styles.activeNavText]}>
                      Colors
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, activeSettingsPanel === 'templates' && styles.activeNavButton]}
                    onPress={() => toggleSettingsPanel('templates')}
                  >
                    <Folder size={16} color={activeSettingsPanel === 'templates' ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.navButtonText, activeSettingsPanel === 'templates' && styles.activeNavText]}>
                      Templates
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Dynamic Settings Content */}
                {activeSettingsPanel && (
                  <ScrollView 
                    style={styles.settingsContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {activeSettingsPanel === 'quality' && (
                      <StreamQualitySelector 
                        selectedQuality={streamQuality}
                        onQualityChange={setStreamQuality}
                      />
                    )}
                    
                    {activeSettingsPanel === 'logos' && (
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
                        onLogoPositionsChange={setLogoPositions}
                      />
                    )}
                    
                    {activeSettingsPanel === 'platforms' && (
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
                    
                    {activeSettingsPanel === 'colors' && (
                      <ColorSchemeSelector
                        selectedScheme={colorScheme}
                        onSchemeChange={setColorScheme}
                      />
                    )}
                    
                    {activeSettingsPanel === 'templates' && (
                      <TemplateManager
                        currentSettings={currentSettings}
                        onLoadTemplate={loadTemplate}
                      />
                    )}
                  </ScrollView>
                )}
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>

          {/* Stream Controls - Always visible */}
          <View style={[styles.controlsContainer, isLandscape && styles.landscapeControlsContainer]}>
            <StreamControls
              isStreaming={isStreaming}
              isMuted={isMuted}
              onToggleStream={toggleStream}
              onToggleMute={toggleMute}
              onSettings={showSettings}
              isLandscape={isLandscape}
            />
          </View>
        </CameraView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  setupHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  setupTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  setupSubtitle: {
    color: '#B0BEC5',
    fontSize: 16,
    marginTop: 4,
  },
  setupContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  setupCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  setupCardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  setupCardText: {
    color: '#B0BEC5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  startStreamButton: {
    backgroundColor: '#006994',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 24,
  },
  startStreamText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  landscapeContainer: {
    // Add landscape-specific styles if needed
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  liveIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 105, 148, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  landscapeLiveIndicator: {
    top: 20,
    left: 40,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  duration: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreboardContainer: {
    position: 'absolute',
    zIndex: 15,
  },
  liveButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 20,
  },
  settingsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: -400,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  liveDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  liveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsPopup: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    width: 320,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    maxHeight: 400,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  positionSection: {
    marginBottom: 16,
  },
  positionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionButton: {
    width: '48%',
    backgroundColor: '#3C3C3E',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  positionText: {
    color: '#B0BEC5',
    fontSize: 11,
    fontWeight: '600',
  },
  dragHint: {
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.3)',
  },
  dragHintText: {
    color: '#40E0D0',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  settingsNavigation: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  activeNavButton: {
    backgroundColor: '#40E0D0',
  },
  navButtonText: {
    color: '#40E0D0',
    fontSize: 10,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#fff',
  },
  settingsContent: {
    maxHeight: 180,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 12,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  landscapeControlsContainer: {
    bottom: 20,
    right: 40,
  },
});