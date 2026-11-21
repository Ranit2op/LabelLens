import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  NativeModules,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { analyzeIngredients } from './src/engine/analyzer';
import ScanReportView from './src/components/ScanReportView';
import CameraScanner from './src/components/CameraScanner';

const { LabelLensOcr } = NativeModules;

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Perform Analysis
  const performAnalysis = (text) => {
    try {
      const result = analyzeIngredients(text);
      if (!result) {
        Alert.alert('No Ingredients Found', 'Please take a clear photo of the ingredient list or enter valid text.');
        return;
      }

      setCurrentAnalysis(result);

      if (result.score < 50) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (err) {
      console.warn('Analysis error:', err);
      Alert.alert('Error', 'Failed to analyze ingredients.');
    }
  };

  // Handle Camera Capture with Google ML Kit
  const handleCameraCapture = async (captureData) => {
    setIsCameraActive(false);
    if (!captureData || !captureData.uri) return;

    try {
      setIsProcessingOcr(true);
      if (LabelLensOcr && LabelLensOcr.recognizeText) {
        const ocrText = await LabelLensOcr.recognizeText(captureData.uri);
        setIsProcessingOcr(false);
        if (ocrText && ocrText.trim().length > 0) {
          performAnalysis(ocrText);
          return;
        } else {
          Alert.alert(
            'Text Recognition Failed',
            'Could not detect clear text. Please align the label in good lighting and focus.'
          );
          return;
        }
      } else {
        setIsProcessingOcr(false);
        Alert.alert(
          'Notice',
          'Native Google ML Kit OCR is bundled in the installed app. Use manual paste to test in preview.'
        );
      }
    } catch (err) {
      setIsProcessingOcr(false);
      console.warn('OCR error:', err);
      Alert.alert('Scan Failed', 'Unable to extract text from the captured image.');
    }
  };

  // Handle Photo Picker from Gallery
  const handlePickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setIsProcessingOcr(true);

        if (LabelLensOcr && LabelLensOcr.recognizeText) {
          const ocrText = await LabelLensOcr.recognizeText(imageUri);
          setIsProcessingOcr(false);
          if (ocrText && ocrText.trim().length > 0) {
            performAnalysis(ocrText);
            return;
          } else {
            Alert.alert('No Text Detected', 'No readable ingredient text was found in the selected photo.');
            return;
          }
        } else {
          setIsProcessingOcr(false);
          Alert.alert(
            'Notice',
            'Native Google ML Kit OCR runs on the installed device build.'
          );
        }
      }
    } catch (err) {
      setIsProcessingOcr(false);
      console.warn('Gallery pick error:', err);
    }
  };

  // Render Full Screen Camera
  if (isCameraActive) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', width: '100%', height: '100%' }}>
        <CameraScanner
          onCaptureText={handleCameraCapture}
          onClose={() => setIsCameraActive(false)}
        />
      </View>
    );
  }

  // Render Simple Good/Bad Report
  if (currentAnalysis) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.reportNavHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentAnalysis(null)}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text style={styles.reportNavTitle}>Ingredient Analysis Report</Text>
              <Text style={styles.reportNavSubtitle}>Good vs Bad Ingredient Breakdown</Text>
            </View>
          </View>

          <ScanReportView
            analysis={currentAnalysis}
            onRescan={() => {
              setCurrentAnalysis(null);
              setIsCameraActive(true);
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Streamlined, Clean Main Screen
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="scan" size={22} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.brandTitle}>LabelLens</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>v1.0.1</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Food & Cosmetic Ingredient Safety Scanner</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isProcessingOcr && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.loadingText}>Extracting & analyzing ingredients...</Text>
            </View>
          )}

          {/* Action 1: Live Camera Scan */}
          <TouchableOpacity
            style={styles.mainCard}
            activeOpacity={0.8}
            onPress={() => setIsCameraActive(true)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="camera" size={36} color="#0284C7" />
            </View>
            <Text style={styles.cardTitle}>Scan with Camera</Text>
            <Text style={styles.cardDesc}>Point camera at any packaged item to instantly analyze safe vs harmful ingredients</Text>
            <View style={styles.actionBtnPrimary}>
              <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>Open Camera</Text>
            </View>
          </TouchableOpacity>

          {/* Action 2: Gallery Picker */}
          <TouchableOpacity
            style={styles.secondaryCard}
            activeOpacity={0.8}
            onPress={handlePickGallery}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="images" size={30} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.secondaryCardTitle}>Pick from Gallery</Text>
              <Text style={styles.secondaryCardDesc}>Select a saved product label photo from your device</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Action 3: Simple Manual Paste Option */}
          <View style={styles.manualSection}>
            <TouchableOpacity
              style={styles.toggleManualBtn}
              onPress={() => setShowManualInput(!showManualInput)}
            >
              <Ionicons name={showManualInput ? 'chevron-up' : 'create-outline'} size={18} color="#0284C7" />
              <Text style={styles.toggleManualText}>
                {showManualInput ? 'Close Text Box' : 'Or paste/type ingredient text manually?'}
              </Text>
            </TouchableOpacity>

            {showManualInput && (
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="Paste ingredients here... (e.g. Flour, Palm Oil, E621, Sugar, Maltodextrin)"
                  placeholderTextColor="#94A3B8"
                  value={manualText}
                  onChangeText={setManualText}
                />
                <TouchableOpacity
                  style={[styles.analyzeBtn, !manualText.trim() && { opacity: 0.5 }]}
                  disabled={!manualText.trim()}
                  onPress={() => performAnalysis(manualText)}
                >
                  <Text style={styles.analyzeBtnText}>Analyze Ingredients</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  versionBadgeText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  loadingText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  secondaryCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  manualSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  toggleManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  toggleManualText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    color: '#0F172A',
    fontSize: 13,
    height: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  analyzeBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reportNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportNavSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
});
