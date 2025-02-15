import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ReceiptScannerProps {
  onScanComplete: (data: {
    amount?: number;
    date?: string;
    items?: { description: string; amount: number }[];
  }) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const processImage = async (uri: string) => {
    try {
      setIsScanning(true);
      setImageUri(uri);

      // Process the image to improve OCR accuracy
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1200 } },
          { grayscale: true },
          { contrast: 1.1 },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Save the processed image
      if (Platform.OS !== 'web') {
        await MediaLibrary.saveToLibraryAsync(processedImage.uri);
      }

      // Simulate OCR result for now
      const mockData = {
        amount: 42.99,
        date: new Date().toISOString(),
        items: [
          { description: 'Item 1', amount: 19.99 },
          { description: 'Item 2', amount: 23.00 },
        ],
      };

      onScanComplete(mockData);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#2A2D43" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Receipt</Text>
      </View>

      <View style={styles.content}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="receipt" size={64} color="#757575" />
            <Text style={styles.placeholderText}>No receipt scanned yet</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={takePicture}
            disabled={isScanning}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickImage}
            disabled={isScanning}
          >
            <MaterialCommunityIcons name="image" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Processing receipt...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2D43',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  preview: {
    width: '100%',
    height: width * 1.3,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  placeholder: {
    width: '100%',
    height: width * 1.3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A90E2',
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