import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Wifi, Key, Eye, EyeOff } from 'lucide-react-native';

interface StreamSettingsProps {
  streamKey: string;
  onStreamKeyChange: (key: string) => void;
}

export default function StreamSettings({ streamKey, onStreamKeyChange }: StreamSettingsProps) {
  const [showStreamKey, setShowStreamKey] = React.useState(false);
  
  const handleTestConnection = () => {
    if (!streamKey) {
      Alert.alert('Stream Key Required', 'Please enter your stream key first.');
      return;
    }
    
    // Simulate connection test
    Alert.alert('Connection Test', 'Stream connection test successful!');
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Wifi size={24} color="#40E0D0" />
        <Text style={styles.sectionTitle}>Stream Configuration</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Stream Key</Text>
        <View style={styles.streamKeyContainer}>
          <TextInput
            style={styles.streamKeyInput}
            value={streamKey}
            onChangeText={onStreamKeyChange}
            placeholder="Enter your stream key"
            placeholderTextColor="#666"
            secureTextEntry={!showStreamKey}
          />
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => setShowStreamKey(!showStreamKey)}
          >
            {showStreamKey ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHelp}>
          Get your stream key from your streaming platform (YouTube, Twitch, etc.)
        </Text>
      </View>
      
      <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
        <Key size={20} color="#fff" />
        <Text style={styles.testButtonText}>Test Connection</Text>
      </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  streamKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  streamKeyInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  visibilityButton: {
    padding: 12,
  },
  inputHelp: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006994',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});