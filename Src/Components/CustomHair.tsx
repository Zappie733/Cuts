import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Buffer } from 'buffer';

interface HairCustomizationResponse {
  resultImage: string;
  status: string;
}

export const HairCustomization: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const { uri } = result.assets[0];
        
        // Read the file and convert to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            setSelectedImage(`data:image/jpeg;base64,${base64}`);
            setResultImage(null); // Clear previous result
          }
        };
        
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage || !prompt.trim()) {
      Alert.alert('Error', 'Please select an image and enter a description');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.0.133:8733/custom-hair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage.split(',')[1],
          prompt: prompt.trim(),
        }),
      });

      const data: HairCustomizationResponse = await response.json();
      if (data.status === 'success' && data.resultImage) {
        setResultImage(`data:image/jpeg;base64,${data.resultImage}`);
      } else {
        throw new Error('Failed to process image');
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Virtual Hair Studio</Text>
        <Text style={styles.subtitle}>
          Visualize your dream hairstyle before making the change
        </Text>

        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <Text style={styles.uploadText}>Select Selfie</Text>
            </TouchableOpacity>
          )}

          {selectedImage && !resultImage && (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={pickImage}
            >
              <Text style={styles.retakeText}>Retake Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Describe your desired hairstyle..."
          placeholderTextColor="#a0a0a0"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedImage || !prompt.trim() || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!selectedImage || !prompt.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Preview Hairstyle</Text>
          )}
        </TouchableOpacity>

        {resultImage && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Your New Look</Text>
            <Image source={{ uri: resultImage }} style={styles.resultImage} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27374D',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 50,
    marginBottom: 10,
  },
  uploadButton: {
    width: 250,
    height: 250,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  retakeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  retakeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
    opacity: 0.5,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  resultImage: {
    width: 250,
    height: 250,
    borderRadius: 50,
  },
});