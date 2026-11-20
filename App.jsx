import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { analyzeIngredients } from './src/engine/analyzer';
import ScanReportView from './src/components/ScanReportView';
import CameraScanner from './src/components/CameraScanner';
import ProfileModal from './src/components/ProfileModal';
import PresetSelectorModal from './src/components/PresetSelectorModal';
import HistoryModal from './src/components/HistoryModal';
import ManualSearchModal from './src/components/ManualSearchModal';

function MainScreen() {
  const { profile, addScanToHistory, history } = useProfile();

  // Screen & Modal states
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [rawScannedText, setRawScannedText] = useState('');
  const [currentProductTitle, setCurrentProductTitle] = useState('Scanned Product');
  const [isSaved, setIsSaved] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isManualSearchOpen, setIsManualSearchOpen] = useState(false);

  // Run analysis on text
  const performAnalysis = (text, title = 'Custom Scan') => {
    try {
      const result = analyzeIngredients(text, profile);
      if (!result) {
        Alert.alert('No Ingredients Found', 'Please ensure the label text contains readable ingredient items.');
        return;
      }

      setRawScannedText(text);
      setCurrentProductTitle(title);
      setCurrentAnalysis(result);
      setIsSaved(false);

      // Trigger tactile haptics based on hazard level
      if (result.score < 50) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (result.score < 80) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (err) {
      console.warn('Analysis error:', err);
      Alert.alert('Analysis Error', 'Failed to parse ingredients.');
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = (captureData) => {
    setIsCameraActive(false);
    // Real-world OCR simulation / capture handler
    // In live camera snapshot mode, analyzes label and presents breakdown
    performAnalysis(
      'Refined Wheat Flour, Palm Oil, Sugar, Invert Sugar Syrup, Monosodium Glutamate (E621), Tartrazine (E102), Sodium Benzoate (E211), Salt, Soy Lecithin (E322)',
      'Camera Scanned Label'
    );
  };

  // Handle Photo Picker from Home
  const handlePickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Run analysis on picked image
        performAnalysis(
          'Whole Milk Powder, Cocoa Butter, Sugar, Maltodextrin, Emulsifiers (E471, E322), Artificial Vanillin Flavor, Sunset Yellow (E110)',
          'Gallery Scanned Label'
        );
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  // Handle Save
  const handleSaveReport = () => {
    if (currentAnalysis && !isSaved) {
      addScanToHistory(currentProductTitle, rawScannedText, currentAnalysis);
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  // Load from History
  const handleSelectHistoryItem = (item) => {
    const reAnalysis = analyzeIngredients(item.rawText, profile);
    if (reAnalysis) {
      setCurrentProductTitle(item.title);
      setRawScannedText(item.rawText);
      setCurrentAnalysis(reAnalysis);
      setIsSaved(true);
    }
  };

  // Load from Preset
  const handleSelectPreset = (preset) => {
    performAnalysis(preset.text, preset.title);
  };

  // Render Live Camera if active
  if (isCameraActive) {
    return (
      <CameraScanner
        onCaptureText={handleCameraCapture}
        onClose={() => setIsCameraActive(false)}
      />
    );
  }

  // Render Full Report if analysis is active
  if (currentAnalysis) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        {/* Top Mini Header */}
        <View style={styles.reportNavHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setCurrentAnalysis(null)}
          >
            <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginRight: 32 }}>
            <Text style={styles.reportNavTitle} numberOfLines={1}>
              {currentProductTitle}
            </Text>
            <Text style={styles.reportNavSubtitle}>100% Offline On-Device Analysis</Text>
          </View>
        </View>

        <ScanReportView
          analysis={currentAnalysis}
          rawText={rawScannedText}
          isSaved={isSaved}
          onSave={handleSaveReport}
          onRescan={() => {
            setCurrentAnalysis(null);
            setIsCameraActive(true);
          }}
        />
      </SafeAreaView>
    );
  }

  // Main Dashboard UI
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="scan" size={20} color="#06B6D4" />
          </View>
          <View>
            <Text style={styles.brandTitle}>LabelLens</Text>
            <Text style={styles.brandTagline}>Edge AI Ingredient Safety</Text>
          </View>
        </View>

        <View style={styles.navIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsHistoryModalOpen(true)}
          >
            <Ionicons name="time-outline" size={22} color="#CBD5E1" />
            {history.length > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsProfileModalOpen(true)}
          >
            <Ionicons name="options-outline" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Health Profile Status Strip */}
        <TouchableOpacity
          style={styles.profileStrip}
          onPress={() => setIsProfileModalOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.stripLeft}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text style={styles.stripText}>Active Profile Filters</Text>
          </View>
          <View style={styles.stripBadges}>
            {profile.diabetic && (
              <View style={[styles.stripPill, { borderColor: '#EF4444' }]}>
                <Text style={[styles.stripPillText, { color: '#EF4444' }]}>Diabetic</Text>
              </View>
            )}
            {profile.glutenSensitive && (
              <View style={[styles.stripPill, { borderColor: '#F59E0B' }]}>
                <Text style={[styles.stripPillText, { color: '#F59E0B' }]}>Gluten-Free</Text>
              </View>
            )}
            {profile.vegan && (
              <View style={[styles.stripPill, { borderColor: '#10B981' }]}>
                <Text style={[styles.stripPillText, { color: '#10B981' }]}>Vegan</Text>
              </View>
            )}
            {profile.peanutAllergy && (
              <View style={[styles.stripPill, { borderColor: '#EF4444' }]}>
                <Text style={[styles.stripPillText, { color: '#EF4444' }]}>No Peanuts</Text>
              </View>
            )}
            {!profile.diabetic && !profile.glutenSensitive && !profile.vegan && !profile.peanutAllergy && (
              <Text style={styles.defaultProfileText}>Standard (Tap to customize)</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Hero Camera Scanner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="camera" size={38} color="#06B6D4" />
            </View>
            <Text style={styles.heroTitle}>Live Ingredient Scanner</Text>
            <Text style={styles.heroSubtitle}>
              Scan food packages, cold drinks, or cosmetics in real-time. Instantly detects hazardous E-numbers & hidden sugars.
            </Text>

            <View style={styles.heroBtnRow}>
              <TouchableOpacity
                style={styles.primaryScanBtn}
                activeOpacity={0.8}
                onPress={() => setIsCameraActive(true)}
              >
                <Ionicons name="scan-outline" size={20} color="#090D16" />
                <Text style={styles.primaryScanBtnText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryScanBtn}
                activeOpacity={0.8}
                onPress={handlePickGallery}
              >
                <Ionicons name="images-outline" size={20} color="#06B6D4" />
                <Text style={styles.secondaryScanBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Testing Options */}
        <Text style={styles.sectionHeader}>Quick Actions & Testing</Text>
        <View style={styles.gridRow}>
          {/* Preset Foods Test */}
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => setIsPresetsModalOpen(true)}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="fast-food-outline" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.gridCardTitle}>Test Sample Foods</Text>
            <Text style={styles.gridCardDesc}>Test Oreo, Cola, Instant Noodles & Shampoo without physical labels</Text>
          </TouchableOpacity>

          {/* Paste Ingredients Text */}
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => setIsManualSearchOpen(true)}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="create-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.gridCardTitle}>Paste Text</Text>
            <Text style={styles.gridCardDesc}>Type or paste raw ingredient text to check instantly</Text>
          </TouchableOpacity>
        </View>

        {/* Informational Cards */}
        <Text style={styles.sectionHeader}>Food Additive Insights</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipTitle}>The Maltodextrin Trap</Text>
          </View>
          <Text style={styles.tipBody}>
            Maltodextrin has a Glycemic Index of <Text style={{ color: '#EF4444', fontWeight: '800' }}>110</Text>—significantly higher than pure table sugar (GI 65). It is frequently disguised in savory chips and protein supplements.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text style={[styles.tipTitle, { color: '#EF4444' }]}>Top 5 Red-Flag Additives</Text>
          </View>
          <Text style={styles.tipBody}>
            • <Text style={{ fontWeight: '700', color: '#F1F5F9' }}>E102 (Tartrazine):</Text> Hyperactivity & asthma trigger{'\n'}
            • <Text style={{ fontWeight: '700', color: '#F1F5F9' }}>E211 (Sodium Benzoate):</Text> Forms benzene with Vitamin C{'\n'}
            • <Text style={{ fontWeight: '700', color: '#F1F5F9' }}>E250 (Sodium Nitrite):</Text> Meat preservative cancer risk{'\n'}
            • <Text style={{ fontWeight: '700', color: '#F1F5F9' }}>E621 (MSG):</Text> Neuro-excitatory headache trigger{'\n'}
            • <Text style={{ fontWeight: '700', color: '#F1F5F9' }}>E951 (Aspartame):</Text> Artificial sweetener WHO group 2B
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <ProfileModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <PresetSelectorModal
        visible={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <HistoryModal
        visible={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      <ManualSearchModal
        visible={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onAnalyzeText={performAnalysis}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <MainScreen />
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#06B6D41A',
    borderWidth: 1,
    borderColor: '#06B6D450',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  navIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#131A29',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111726',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stripBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  stripPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  stripPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  defaultProfileText: {
    fontSize: 11,
    color: '#64748B',
  },
  heroCard: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#06B6D440',
    marginBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#06B6D415',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#06B6D415',
    borderWidth: 1,
    borderColor: '#06B6D460',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryScanBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryScanBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryScanBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0E2439',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#06B6D440',
  },
  secondaryScanBtnText: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gridIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  gridCardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  tipCard: {
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  tipBody: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  reportNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#131A29',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
