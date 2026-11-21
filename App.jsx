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
        Alert.alert('কোনো উপাদান পাওয়া যায়নি', 'অনুগ্রহ করে প্যাকেটের লেখার স্পষ্ট ছবি তুলুন বা সঠিক টেক্সট দিন।');
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
      Alert.alert('ত্রুটি', 'উপাদান বিশ্লেষণ করতে ব্যর্থ হয়েছে।');
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
            'লেখা শনাক্ত করা যায়নি',
            'ক্যামেরা ছবিতে কোনো স্পষ্ট লেখা পড়তে পারেনি। দয়া করে পর্যাপ্ত আলোতে প্যাকেটের ওপর ফোকাস করে ছবি তুলুন।'
          );
          return;
        }
      } else {
        setIsProcessingOcr(false);
        Alert.alert(
          'Notice',
          'নেটিভ Google ML Kit OCR শুধুমাত্র ইনস্টল করা APK ফাইলে কাজ করে। Expo Go প্রিভিউতে টেস্ট টেক্সট ব্যবহার করুন।'
        );
      }
    } catch (err) {
      setIsProcessingOcr(false);
      console.warn('OCR error:', err);
      Alert.alert('স্ক্যান ব্যর্থ হয়েছে', 'ছবি থেকে লেখা পড়তে সমস্যা হয়েছে।');
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
            Alert.alert('কোনো লেখা নেই', 'সিলেক্ট করা ছবিতে কোনো স্পষ্ট লেখা পাওয়া যায়নি।');
            return;
          }
        } else {
          setIsProcessingOcr(false);
          Alert.alert(
            'Notice',
            'নেটিভ Google ML Kit OCR ইনস্টল করা APK ফাইলে কাজ করে।'
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
      <CameraScanner
        onCaptureText={handleCameraCapture}
        onClose={() => setIsCameraActive(false)}
      />
    );
  }

  // Render Simple Good/Bad Report
  if (currentAnalysis) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#090D16" />
          <View style={styles.reportNavHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentAnalysis(null)}>
              <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
            </TouchableOpacity>
            <View>
              <Text style={styles.reportNavTitle}>উপাদান বিশ্লেষণ রিপোর্ট</Text>
              <Text style={styles.reportNavSubtitle}>ভালো ও ক্ষতিকর উপাদানের ফলাফল</Text>
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
        <StatusBar barStyle="light-content" backgroundColor="#090D16" />

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="scan" size={22} color="#06B6D4" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.brandTitle}>LabelLens</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>v1.0.1</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>খাবারের ভালো ও ক্ষতিকর উপাদান স্ক্যানার</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isProcessingOcr && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#06B6D4" />
              <Text style={styles.loadingText}>ছবি থেকে উপাদান রিড ও অ্যানালাইজ করা হচ্ছে...</Text>
            </View>
          )}

          {/* Action 1: Live Camera Scan */}
          <TouchableOpacity
            style={styles.mainCard}
            activeOpacity={0.8}
            onPress={() => setIsCameraActive(true)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#06B6D420' }]}>
              <Ionicons name="camera" size={36} color="#06B6D4" />
            </View>
            <Text style={styles.cardTitle}>ক্যামেরা দিয়ে ছবি তুলুন</Text>
            <Text style={styles.cardDesc}>যেকোনো প্যাকেটজাত খাবারের ইনগ্রেডিয়েন্টসের ছবি তুলে সাথে সাথে ভালো ও খারাপ উপাদান দেখুন</Text>
            <View style={styles.actionBtnPrimary}>
              <Ionicons name="scan-outline" size={18} color="#090D16" />
              <Text style={styles.actionBtnPrimaryText}>ক্যামেরা ওপেন করুন</Text>
            </View>
          </TouchableOpacity>

          {/* Action 2: Gallery Picker */}
          <TouchableOpacity
            style={styles.secondaryCard}
            activeOpacity={0.8}
            onPress={handlePickGallery}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="images" size={32} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.secondaryCardTitle}>গ্যালারি থেকে ছবি দিন</Text>
              <Text style={styles.secondaryCardDesc}>ফোনে আগে থেকে থাকা প্যাকেটের ছবি সিলেক্ট করে স্ক্যান করুন</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Action 3: Simple Manual Paste Option */}
          <View style={styles.manualSection}>
            <TouchableOpacity
              style={styles.toggleManualBtn}
              onPress={() => setShowManualInput(!showManualInput)}
            >
              <Ionicons name={showManualInput ? 'chevron-up' : 'create-outline'} size={18} color="#06B6D4" />
              <Text style={styles.toggleManualText}>
                {showManualInput ? 'টাইপ বক্স বন্ধ করুন' : 'লেখা টাইপ বা পেস্ট করে টেস্ট করবেন?'}
              </Text>
            </TouchableOpacity>

            {showManualInput && (
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="উপাদানের নাম পেস্ট করুন... (যেমন: Flour, Palm Oil, E621, Sugar, Maltodextrin)"
                  placeholderTextColor="#64748B"
                  value={manualText}
                  onChangeText={setManualText}
                />
                <TouchableOpacity
                  style={[styles.analyzeBtn, !manualText.trim() && { opacity: 0.5 }]}
                  disabled={!manualText.trim()}
                  onPress={() => performAnalysis(manualText)}
                >
                  <Text style={styles.analyzeBtnText}>উপাদান যাচাই করুন</Text>
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
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#06B6D41A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06B6D440',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: '#06B6D420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06B6D450',
  },
  versionBadgeText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingCard: {
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  loadingText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  mainCard: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06B6D450',
    marginBottom: 16,
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
    color: '#F1F5F9',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionBtnPrimaryText: {
    color: '#090D16',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryCard: {
    backgroundColor: '#111726',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  secondaryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  secondaryCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  manualSection: {
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toggleManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  toggleManualText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  textInput: {
    backgroundColor: '#0F1523',
    borderRadius: 10,
    padding: 12,
    color: '#F1F5F9',
    fontSize: 13,
    height: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  analyzeBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reportNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#131A29',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  reportNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  reportNavSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
});
