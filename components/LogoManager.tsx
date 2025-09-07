import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { Image, Users, Building, Eye, EyeOff, ZoomIn, ZoomOut, Upload, Settings } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import LogoUploadManager from './LogoUploadManager';
import LogoPositionController from './LogoPositionController';

interface Logo {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadDate: Date;
}

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

interface LogoManagerProps {
  playerLogos: { player1: boolean; player2: boolean };
  sponsorLogos: boolean;
  onPlayerLogoToggle: (player: 1 | 2) => void;
  onSponsorLogoToggle: () => void;
  onLogoPositionsChange?: (positions: LogoPosition[]) => void;
}

export default function LogoManager({ 
  playerLogos, 
  sponsorLogos, 
  onPlayerLogoToggle, 
  onSponsorLogoToggle,
  onLogoPositionsChange
}: LogoManagerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'position' | 'legacy'>('upload');
  const [logoPositions, setLogoPositions] = useState<LogoPosition[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>();
  const [player1LogoSize, setPlayer1LogoSize] = useState(100);
  const [player2LogoSize, setPlayer2LogoSize] = useState(100);
  const [sponsorLogoSize, setSponsorLogoSize] = useState(80);
  const [showPlayerLogos, setShowPlayerLogos] = useState(true);
  const [showSponsorLogos, setShowSponsorLogos] = useState(true);

  const logoScale = useSharedValue(1);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const adjustLogoSize = (type: 'player1' | 'player2' | 'sponsor', delta: number) => {
    logoScale.value = withSpring(1.1, {}, () => {
      logoScale.value = withSpring(1);
    });

    switch (type) {
      case 'player1':
        setPlayer1LogoSize(prev => Math.max(50, Math.min(200, prev + delta)));
        break;
      case 'player2':
        setPlayer2LogoSize(prev => Math.max(50, Math.min(200, prev + delta)));
        break;
      case 'sponsor':
        setSponsorLogoSize(prev => Math.max(40, Math.min(150, prev + delta)));
        break;
    }
  };

  const handleLogoSelect = (logo: Logo) => {
    const newPosition: LogoPosition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      logoId: logo.id,
      x: 50,
      y: 50,
      scale: 1,
      opacity: 1,
      rotation: 0,
      visible: true,
    };
    
    const updatedPositions = [...logoPositions, newPosition];
    setLogoPositions(updatedPositions);
    setSelectedPositionId(newPosition.id);
    onLogoPositionsChange?.(updatedPositions);
  };

  const handleUpdatePosition = (id: string, updates: Partial<LogoPosition>) => {
    const updatedPositions = logoPositions.map(pos =>
      pos.id === id ? { ...pos, ...updates } : pos
    );
    setLogoPositions(updatedPositions);
    onLogoPositionsChange?.(updatedPositions);
  };

  const handleRemovePosition = (id: string) => {
    const updatedPositions = logoPositions.filter(pos => pos.id !== id);
    setLogoPositions(updatedPositions);
    if (selectedPositionId === id) {
      setSelectedPositionId(undefined);
    }
    onLogoPositionsChange?.(updatedPositions);
  };

  const selectedLogos = logoPositions.map(pos => ({ id: pos.logoId }));

  const toggleLogoVisibility = (type: 'player' | 'sponsor') => {
    if (type === 'player') {
      setShowPlayerLogos(!showPlayerLogos);
    } else {
      setShowSponsorLogos(!showSponsorLogos);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Image size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Logo Management</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Upload size={16} color={activeTab === 'upload' ? '#fff' : '#40E0D0'} />
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>Upload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'position' && styles.activeTab]}
          onPress={() => setActiveTab('position')}
        >
          <Settings size={16} color={activeTab === 'position' ? '#fff' : '#40E0D0'} />
          <Text style={[styles.tabText, activeTab === 'position' && styles.activeTabText]}>Position</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'legacy' && styles.activeTab]}
          onPress={() => setActiveTab('legacy')}
        >
          <Building size={16} color={activeTab === 'legacy' ? '#fff' : '#40E0D0'} />
          <Text style={[styles.tabText, activeTab === 'legacy' && styles.activeTabText]}>Legacy</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <LogoUploadManager
          onLogoSelect={handleLogoSelect}
          selectedLogos={selectedLogos}
          maxLogos={10}
        />
      )}

      {activeTab === 'position' && (
        <LogoPositionController
          logoPositions={logoPositions}
          onUpdatePosition={handleUpdatePosition}
          onRemovePosition={handleRemovePosition}
          selectedPositionId={selectedPositionId}
          onSelectPosition={setSelectedPositionId}
        />
      )}

      {activeTab === 'legacy' && (
        <View>
      {/* Logo Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.uploadSectionTitle}>Upload Logos</Text>
        <View style={styles.uploadGrid}>
          <TouchableOpacity style={styles.uploadCard}>
            <Upload size={24} color="#40E0D0" />
            <Text style={styles.uploadCardTitle}>Player 1 Logo</Text>
            <Text style={styles.uploadCardSubtitle}>PNG, JPG, SVG • Max 2MB</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadCard}>
            <Upload size={24} color="#40E0D0" />
            <Text style={styles.uploadCardTitle}>Player 2 Logo</Text>
            <Text style={styles.uploadCardSubtitle}>PNG, JPG, SVG • Max 2MB</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadCard}>
            <Upload size={24} color="#40E0D0" />
            <Text style={styles.uploadCardTitle}>Main Sponsor</Text>
            <Text style={styles.uploadCardSubtitle}>PNG, JPG, SVG • Max 2MB</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadCard}>
            <Upload size={24} color="#40E0D0" />
            <Text style={styles.uploadCardTitle}>Secondary Sponsor</Text>
            <Text style={styles.uploadCardSubtitle}>PNG, JPG, SVG • Max 2MB</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player Logos */}
      <View style={styles.logoSection}>
        <View style={styles.logoHeader}>
          <Users size={20} color="#F57F17" />
          <Text style={styles.logoSectionTitle}>Player Logos</Text>
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => toggleLogoVisibility('player')}
          >
            {showPlayerLogos ? (
              <Eye size={16} color="#40E0D0" />
            ) : (
              <EyeOff size={16} color="#666" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.playerLogosContainer}>
          {/* Player 1 Logo */}
          <View style={styles.logoControl}>
            <Text style={styles.logoLabel}>Player 1 Logo</Text>
            <View style={styles.logoSettings}>
              <Switch
                value={playerLogos.player1}
                onValueChange={() => onPlayerLogoToggle(1)}
                trackColor={{ false: '#3C3C3E', true: '#40E0D0' }}
                thumbColor={playerLogos.player1 ? '#fff' : '#666'}
              />
              <View style={styles.sizeControls}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => adjustLogoSize('player1', -10)}
                >
                  <ZoomOut size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sizeText}>{player1LogoSize}%</Text>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => adjustLogoSize('player1', 10)}
                >
                  <ZoomIn size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Player 2 Logo */}
          <View style={styles.logoControl}>
            <Text style={styles.logoLabel}>Player 2 Logo</Text>
            <View style={styles.logoSettings}>
              <Switch
                value={playerLogos.player2}
                onValueChange={() => onPlayerLogoToggle(2)}
                trackColor={{ false: '#3C3C3E', true: '#40E0D0' }}
                thumbColor={playerLogos.player2 ? '#fff' : '#666'}
              />
              <View style={styles.sizeControls}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => adjustLogoSize('player2', -10)}
                >
                  <ZoomOut size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sizeText}>{player2LogoSize}%</Text>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => adjustLogoSize('player2', 10)}
                >
                  <ZoomIn size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Sponsor Logos */}
      <View style={styles.logoSection}>
        <View style={styles.logoHeader}>
          <Building size={20} color="#F57F17" />
          <Text style={styles.logoSectionTitle}>Sponsor Logos</Text>
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => toggleLogoVisibility('sponsor')}
          >
            {showSponsorLogos ? (
              <Eye size={16} color="#40E0D0" />
            ) : (
              <EyeOff size={16} color="#666" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logoControl}>
          <Text style={styles.logoLabel}>Main Sponsor</Text>
          <View style={styles.logoSettings}>
            <Switch
              value={sponsorLogos}
              onValueChange={onSponsorLogoToggle}
              trackColor={{ false: '#3C3C3E', true: '#40E0D0' }}
              thumbColor={sponsorLogos ? '#fff' : '#666'}
            />
            <View style={styles.sizeControls}>
              <TouchableOpacity
                style={styles.sizeButton}
                onPress={() => adjustLogoSize('sponsor', -10)}
              >
                <ZoomOut size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.sizeText}>{sponsorLogoSize}%</Text>
              <TouchableOpacity
                style={styles.sizeButton}
                onPress={() => adjustLogoSize('sponsor', 10)}
              >
                <ZoomIn size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Live Controls Note */}
      <View style={styles.liveControlsNote}>
        <Text style={styles.noteText}>
          💡 All logo adjustments apply in real-time during live streaming
        </Text>
      </View>
        </View>
      )}
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#40E0D0',
  },
  tabText: {
    color: '#40E0D0',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  saveSection: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  saveTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  saveContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  templateNameInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  saveButton: {
    backgroundColor: '#40E0D0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  templatesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    color: '#40E0D0',
    fontSize: 16,
    fontWeight: '600',
  },
  editNameInput: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 150,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  templateDetails: {
    marginBottom: 8,
  },
  templateDetail: {
    color: '#B0BEC5',
    fontSize: 12,
    marginBottom: 2,
  },
  templateDate: {
    color: '#666',
    fontSize: 11,
    fontStyle: 'italic',
  },
  logoSection: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  visibilityButton: {
    padding: 8,
  },
  playerLogosContainer: {
    gap: 16,
  },
  logoControl: {
    marginBottom: 12,
  },
  logoLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  logoSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeButton: {
    backgroundColor: '#006994',
    borderRadius: 6,
    padding: 8,
  },
  sizeText: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  liveControlsNote: {
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.3)',
  },
  noteText: {
    color: '#40E0D0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  uploadSection: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  uploadSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  uploadCard: {
    width: '48%',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40E0D0',
    borderStyle: 'dashed',
  },
  uploadCardTitle: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadCardSubtitle: {
    color: '#B0BEC5',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});