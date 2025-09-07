import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ScrollView } from 'react-native';
import { Upload, X, Search, Eye, Trash2, Plus, Image as ImageIcon, Check } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';

interface Logo {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadDate: Date;
}

interface LogoUploadManagerProps {
  onLogoSelect: (logo: Logo) => void;
  selectedLogos: Logo[];
  maxLogos?: number;
}

export default function LogoUploadManager({ 
  onLogoSelect, 
  selectedLogos = [],
  maxLogos = 10 
}: LogoUploadManagerProps) {
  const [logos, setLogos] = useState<Logo[]>([
    {
      id: '1',
      name: 'Company Logo',
      url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=200',
      size: 1.2,
      type: 'image/jpeg',
      uploadDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Sponsor Badge',
      url: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=200',
      size: 0.8,
      type: 'image/jpeg',
      uploadDate: new Date('2024-01-10'),
    },
  ]);
  
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [previewLogo, setPreviewLogo] = useState<Logo | null>(null);
  const [draggedLogo, setDraggedLogo] = useState<Logo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLogos = logos.filter(logo =>
    logo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type);
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit
      
      if (!isValidType) {
        Alert.alert('Invalid File Type', `${file.name} is not a supported image format.`);
        return false;
      }
      
      if (!isValidSize) {
        Alert.alert('File Too Large', `${file.name} exceeds the 2MB size limit.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    if (logos.length + validFiles.length > maxLogos) {
      Alert.alert('Upload Limit', `You can only upload up to ${maxLogos} logos total.`);
      return;
    }

    validFiles.forEach(file => {
      const logoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [logoId]: 0 }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogo: Logo = {
          id: logoId,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          url: e.target?.result as string,
          size: file.size / (1024 * 1024), // Convert to MB
          type: file.type,
          uploadDate: new Date(),
        };

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[logoId];
              return newProgress;
            });
            setLogos(prev => [...prev, newLogo]);
          } else {
            setUploadProgress(prev => ({ ...prev, [logoId]: progress }));
          }
        }, 200);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const deleteLogo = (logoId: string) => {
    Alert.alert(
      'Delete Logo',
      'Are you sure you want to delete this logo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLogos(prev => prev.filter(logo => logo.id !== logoId));
          },
        },
      ]
    );
  };

  const isLogoSelected = (logo: Logo) => {
    return selectedLogos.some(selected => selected.id === logo.id);
  };

  const formatFileSize = (sizeInMB: number) => {
    return sizeInMB < 1 ? `${(sizeInMB * 1024).toFixed(0)} KB` : `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ImageIcon size={24} color="#40E0D0" />
        <Text style={styles.headerTitle}>Logo Library</Text>
        <Text style={styles.logoCount}>{logos.length}/{maxLogos}</Text>
      </View>

      {/* Upload Area */}
      <TouchableOpacity 
        style={styles.uploadArea}
        onPress={() => fileInputRef.current?.click()}
      >
        <Upload size={32} color="#40E0D0" />
        <Text style={styles.uploadTitle}>Upload Logos</Text>
        <Text style={styles.uploadSubtitle}>
          Drag & drop or click to select files
        </Text>
        <Text style={styles.uploadLimits}>
          PNG, JPG, SVG • Max 2MB each • Up to {maxLogos} logos
        </Text>
        
        {/* Hidden file input for web */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </TouchableOpacity>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Uploading...</Text>
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <View key={id} style={styles.progressItem}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search logos..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Logo Grid */}
      <ScrollView style={styles.logoGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {filteredLogos.map((logo, index) => (
            <Animated.View key={logo.id} entering={FadeInUp.delay(index * 100)}>
              <View style={[
                styles.logoCard,
                isLogoSelected(logo) && styles.selectedLogoCard
              ]}>
                <TouchableOpacity
                  style={styles.logoImageContainer}
                  onPress={() => onLogoSelect(logo)}
                >
                  <Image source={{ uri: logo.url }} style={styles.logoImage} />
                  {isLogoSelected(logo) && (
                    <View style={styles.selectedOverlay}>
                      <Check size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.logoInfo}>
                  <Text style={styles.logoName} numberOfLines={1}>
                    {logo.name}
                  </Text>
                  <Text style={styles.logoDetails}>
                    {formatFileSize(logo.size)} • {logo.uploadDate.toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.logoActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setPreviewLogo(logo)}
                  >
                    <Eye size={16} color="#40E0D0" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteLogo(logo.id)}
                  >
                    <Trash2 size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
        
        {filteredLogos.length === 0 && searchQuery && (
          <View style={styles.emptyState}>
            <Search size={48} color="#666" />
            <Text style={styles.emptyTitle}>No logos found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms
            </Text>
          </View>
        )}
        
        {logos.length === 0 && !searchQuery && (
          <View style={styles.emptyState}>
            <ImageIcon size={48} color="#666" />
            <Text style={styles.emptyTitle}>No logos uploaded</Text>
            <Text style={styles.emptySubtitle}>
              Upload your first logo to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Preview Modal */}
      {previewLogo && (
        <View style={styles.previewModal}>
          <TouchableOpacity 
            style={styles.previewOverlay}
            onPress={() => setPreviewLogo(null)}
          >
            <View style={styles.previewContent}>
              <TouchableOpacity
                style={styles.previewClose}
                onPress={() => setPreviewLogo(null)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
              
              <Image source={{ uri: previewLogo.url }} style={styles.previewImage} />
              
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{previewLogo.name}</Text>
                <Text style={styles.previewDetails}>
                  {formatFileSize(previewLogo.size)} • {previewLogo.type}
                </Text>
                <Text style={styles.previewDate}>
                  Uploaded: {previewLogo.uploadDate.toLocaleDateString()}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  onLogoSelect(previewLogo);
                  setPreviewLogo(null);
                }}
              >
                <Text style={styles.selectButtonText}>
                  {isLogoSelected(previewLogo) ? 'Selected' : 'Select Logo'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  logoCount: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadArea: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40E0D0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadTitle: {
    color: '#40E0D0',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtitle: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4,
  },
  uploadLimits: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  progressTitle: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#40E0D0',
    borderRadius: 2,
  },
  progressText: {
    color: '#B0BEC5',
    fontSize: 12,
    minWidth: 35,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  logoGrid: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  logoCard: {
    width: '48%',
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLogoCard: {
    borderColor: '#40E0D0',
    backgroundColor: 'rgba(64, 224, 208, 0.1)',
  },
  logoImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C2C2E',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#40E0D0',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInfo: {
    marginBottom: 8,
  },
  logoName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoDetails: {
    color: '#B0BEC5',
    fontSize: 11,
    marginTop: 2,
  },
  logoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 6,
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
  },
  previewModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewDetails: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4,
  },
  previewDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: '#40E0D0',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});