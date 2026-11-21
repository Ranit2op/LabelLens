import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScanner({ onCaptureText, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#06B6D4" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={54} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permDesc}>
          LabelLens needs camera permission to scan ingredient labels on food packets.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pick image from gallery
  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsProcessing(true);
        onCaptureText({
          uri: result.assets[0].uri,
          source: 'gallery',
        });
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture photo from camera
  const takeSnapshot = async () => {
    if (!cameraRef.current || isProcessing) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      if (photo && photo.uri) {
        onCaptureText({
          uri: photo.uri,
          source: 'camera',
        });
      }
    } catch (err) {
      console.warn('Camera capture error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Full-screen Camera Preview (Self-closing, fills entire screen) */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
      />

      {/* 2. Clean UI Overlay sitting properly on top of the camera */}
      <SafeAreaView style={styles.uiOverlay} pointerEvents="box-none">
        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Scan Label</Text>
          <TouchableOpacity style={styles.topBtn} onPress={() => setTorch(!torch)}>
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={torch ? '#F59E0B' : '#FFF'} />
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target Frame (Centered) */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>Align Ingredients Table Here</Text>
            </View>
          </View>
        </View>

        {/* Bottom Shutter Controls (Sitting at bottom) */}
        <View style={styles.bottomBar}>
          {/* Gallery Picker Button */}
          <TouchableOpacity style={styles.auxBtn} onPress={pickFromGallery}>
            <View style={styles.auxIconCircle}>
              <Ionicons name="images-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.auxBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Shutter Button in bottom center */}
          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={takeSnapshot}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <View style={styles.shutterInner}>
              {isProcessing ? (
                <ActivityIndicator color="#090D16" size="small" />
              ) : (
                <View style={styles.shutterCenter} />
              )}
            </View>
          </TouchableOpacity>

          {/* Spacer to keep shutter centered */}
          <View style={styles.auxBtnSpacer} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  targetFrame: {
    width: '100%',
    height: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#06B6D4',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  hintBadge: {
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  hintText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 32,
  },
  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#06B6D4',
  },
  auxBtn: {
    alignItems: 'center',
    width: 50,
  },
  auxIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auxBtnLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  auxBtnSpacer: {
    width: 50,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
  },
  permDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  permBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 14,
    padding: 10,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 14,
  },
});
