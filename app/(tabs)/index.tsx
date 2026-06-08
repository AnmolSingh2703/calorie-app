import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  // Application State
  const [inputText, setInputText] = useState('');
  const [contextText, setContextText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Dashboard Stats Placeholder
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Launch Physical Camera
  const handleCameraLaunch = async () => {
    // Request permission from iOS
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    
    if (!cameraPermission.granted) {
      Alert.alert("Permission Denied", "NutriSight needs camera access to snap pictures of food.");
      return;
    }

    // Launch the system camera interface
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // lets you crop the image
      quality: 0.8, // compresses slightly so it transmits faster to AI
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // saves the image path to our state
    }
  };

  // Launch Photo Gallery (for screenshots and saved labels)
  const handleGalleryLaunch = async () => {
    // Request permission from iOS
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!galleryPermission.granted) {
      Alert.alert("Permission Denied", "NutriSight needs gallery access to upload label screenshots.");
      return;
    }

    // Open photo browser window
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
  };

  // Clear current picture queue
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleProcessLog = () => {
    if (!inputText && !selectedImage && !contextText) {
      Alert.alert("Empty Entry", "Please provide a description, take a photo, or provide context directions.");
      return;
    }
    Alert.alert(
      "AI Analysis", 
      `Sending entries to Thinking Engine:\n\nText: ${inputText || 'None'}\nImage Queued: ${selectedImage ? 'Yes' : 'No'}\nContext: ${contextText || 'None'}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* APP HEADER */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>NutriSight AI</Text>
          <Text style={styles.appSubtitle}>Universal iOS Engine Active</Text>
        </View>

        {/* NUTRITION METRICS DASHBOARD */}
        <View style={styles.dashboardCard}>
          <Text style={styles.cardTitle}>Daily Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{nutrition.calories}</Text>
              <Text style={styles.metricLabel}>Calories</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#FF6B6B' }]}>{nutrition.protein}g</Text>
              <Text style={styles.metricLabel}>Protein</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#4DABF7' }]}>{nutrition.carbs}g</Text>
              <Text style={styles.metricLabel}>Carbs</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#FCC419' }]}>{nutrition.fat}g</Text>
              <Text style={styles.metricLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* MULTI-MODAL INTAKE CONTROLS */}
        <View style={styles.inputCard}>
          <Text style={styles.cardTitle}>Log a Meal</Text>
          
          <TextInput
            style={styles.textArea}
            placeholder="What did you eat? (or take a photo below...)"
            placeholderTextColor="#868E96"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />

          {/* IMAGE PREVIEW FRAME (Only appears when an image is selected) */}
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBadge} onPress={handleRemoveImage}>
                <Text style={styles.removeImageText}>✕ Remove Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={handleCameraLaunch}>
              <Text style={styles.buttonIcon}>📸</Text>
              <Text style={styles.mediaButtonText}>Snap Food</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleGalleryLaunch}>
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.mediaButtonText}>Label / Gallery</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]} 
            onPress={toggleVoiceRecording}
          >
            <Text style={styles.voiceButtonText}>
              {isRecording ? "🛑 Recording Voice..." : "🎤 Hold to Speak Entry"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTEXT EXTENSION FIELD */}
        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>Context Field (Optional AI Directions)</Text>
          <TextInput
            style={styles.contextInput}
            placeholder="Add adjustments (e.g., 'Cooked in butter', 'Ate half')"
            placeholderTextColor="#A6AEC1"
            value={contextText}
            onChangeText={setContextText}
          />
        </View>

        {/* COMPUTE LOG ACTION */}
        <TouchableOpacity style={styles.submitButton} onPress={handleProcessLog}>
          <Text style={styles.submitButtonText}>Analyze & Calculate</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 25, marginTop: 10 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#212529' },
  appSubtitle: { fontSize: 14, color: '#868E96', marginTop: 4 },
  dashboardCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#343A40', marginBottom: 15 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 22, fontWeight: '700', color: '#212529' },
  metricLabel: { fontSize: 12, color: '#868E96', marginTop: 4 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  textArea: { backgroundColor: '#F1F3F5', borderRadius: 12, padding: 15, minHeight: 80, fontSize: 15, color: '#212529', marginBottom: 15 },
  previewContainer: { width: '100%', alignItems: 'center', marginBottom: 15, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#E9ECEF' },
  removeImageBadge: { position: 'absolute', bottom: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  removeImageText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  mediaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  mediaButton: { backgroundColor: '#F1F3F5', borderRadius: 12, padding: 15, alignItems: 'center', flex: 0.48 },
  buttonIcon: { fontSize: 22, marginBottom: 6 },
  mediaButtonText: { fontSize: 13, fontWeight: '500', color: '#495057' },
  voiceButton: { backgroundColor: '#E8F7FF', borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#A5D8FF' },
  voiceButtonActive: { backgroundColor: '#FFC9C9', borderColor: '#FFA8A8' },
  voiceButtonText: { color: '#1971C2', fontWeight: '600', fontSize: 14 },
  contextCard: { backgroundColor: '#EDF2FF', borderRadius: 16, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#D0BFFF' },
  contextTitle: { fontSize: 14, fontWeight: '600', color: '#4C6EF5', marginBottom: 10 },
  contextInput: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, fontSize: 14, color: '#212529', borderWidth: 1, borderColor: '#BAC8FF' },
  submitButton: { backgroundColor: '#228BE6', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 40 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});