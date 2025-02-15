import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { createBackup, restoreBackup } from '../utils/backup';

interface BackupRestoreModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function BackupRestoreModal({
  visible,
  onClose,
  onComplete,
}: BackupRestoreModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await createBackup();
      onComplete();
    } catch (err) {
      setError('Failed to create backup. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        // For web, use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const content = event.target?.result as string;
              await restoreBackup(content);
              onComplete();
            } catch (err) {
              setError('Failed to restore backup. Invalid file format.');
              console.error(err);
            } finally {
              setIsLoading(false);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      } else {
        // For mobile, use DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
        });

        if (result.assets && result.assets[0]) {
          const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
          await restoreBackup(content);
          onComplete();
        }
      }
    } catch (err) {
      setError('Failed to restore backup. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
            <Text style={styles.title}>Backup & Restore</Text>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Backup Data</Text>
              <Text style={styles.sectionDescription}>
                Create a backup of all your expenses, categories, and settings.
                You can use this backup to restore your data later.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleBackup}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="cloud-upload"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Create Backup</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restore Data</Text>
              <Text style={styles.sectionDescription}>
                Restore your data from a previous backup file. This will replace
                all current data with the backup data.
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.restoreButton]}
                onPress={handleRestore}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="cloud-download"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Restore from Backup</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#FF6B6B"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>
                Please wait while we process your request...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2D43',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
  },
  restoreButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2A2D43',
  },
});