import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Save, Folder, CreditCard as Edit, Trash2, Plus } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Template {
  id: string;
  name: string;
  settings: {
    streamQuality: string;
    logoPosition: string;
    colorScheme: string;
    playerLogos: { player1: boolean; player2: boolean };
    sponsorLogos: boolean;
    streamPlatforms: string[];
  };
  createdAt: Date;
}

interface TemplateManagerProps {
  currentSettings: any;
  onLoadTemplate: (template: Template) => void;
}

export default function TemplateManager({ currentSettings, onLoadTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Professional Tournament',
      settings: {
        streamQuality: '1080p',
        logoPosition: 'top-right',
        colorScheme: 'classic',
        playerLogos: { player1: true, player2: true },
        sponsorLogos: true,
        streamPlatforms: ['YouTube', 'Twitch'],
      },
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Casual Match',
      settings: {
        streamQuality: '720p',
        logoPosition: 'bottom-left',
        colorScheme: 'modern',
        playerLogos: { player1: false, player2: false },
        sponsorLogos: false,
        streamPlatforms: ['Facebook'],
      },
      createdAt: new Date('2024-01-10'),
    },
  ]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const saveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) {
      Alert.alert('Template Name Required', 'Please enter a name for your template.');
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      settings: currentSettings,
      createdAt: new Date(),
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setNewTemplateName('');
    Alert.alert('Template Saved', `"${newTemplate.name}" has been saved successfully.`);
  };

  const loadTemplate = (template: Template) => {
    Alert.alert(
      'Load Template',
      `Load "${template.name}" configuration? This will replace your current settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            onLoadTemplate(template);
            Alert.alert('Template Loaded', `"${template.name}" configuration has been applied.`);
          },
        },
      ]
    );
  };

  const deleteTemplate = (templateId: string, templateName: string) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
          },
        },
      ]
    );
  };

  const renameTemplate = (templateId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, name: newName.trim() } : t
    ));
    setEditingTemplate(null);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <View style={styles.sectionHeader}>
          <Folder size={24} color="#40E0D0" />
          <Text style={styles.sectionTitle}>Template Manager</Text>
        </View>

        {/* Save Current Settings */}
        <View style={styles.saveSection}>
          <Text style={styles.saveTitle}>Save Current Configuration</Text>
          <View style={styles.saveContainer}>
            <TextInput
              style={styles.templateNameInput}
              value={newTemplateName}
              onChangeText={setNewTemplateName}
              placeholder="Enter template name"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveCurrentAsTemplate}>
              <Save size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Templates */}
        <Text style={styles.templatesTitle}>Saved Templates ({templates.length})</Text>
        <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
          {templates.map((template, index) => (
            <Animated.View key={template.id} entering={FadeInUp.delay(index * 100)}>
              <View style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  {editingTemplate === template.id ? (
                    <TextInput
                      style={styles.editNameInput}
                      defaultValue={template.name}
                      onSubmitEditing={(e) => renameTemplate(template.id, e.nativeEvent.text)}
                      onBlur={(e) => renameTemplate(template.id, e.nativeEvent.text)}
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity onPress={() => loadTemplate(template)}>
                      <Text style={styles.templateName}>{template.name}</Text>
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setEditingTemplate(editingTemplate === template.id ? null : template.id)}
                    >
                      <Edit size={16} color="#40E0D0" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteTemplate(template.id, template.name)}
                    >
                      <Trash2 size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.templateDetails}>
                  <Text style={styles.templateDetail}>Quality: {template.settings.streamQuality}</Text>
                  <Text style={styles.templateDetail}>Scheme: {template.settings.colorScheme}</Text>
                  <Text style={styles.templateDetail}>
                    Platforms: {template.settings.streamPlatforms.join(', ')}
                  </Text>
                </View>
                
                <Text style={styles.templateDate}>
                  Created: {template.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {templates.length === 0 && (
          <View style={styles.emptyState}>
            <Plus size={48} color="#666" />
            <Text style={styles.emptyText}>No templates saved yet</Text>
            <Text style={styles.emptySubtext}>Save your current configuration to create your first template</Text>
          </View>
        )}
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