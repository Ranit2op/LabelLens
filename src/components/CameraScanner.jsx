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
          LabelLens needs camera access to scan food and cosmetic labels.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Back</Text>
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

  // Launch phone's native camera
  const openSystemCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsProcessing(true);
        onCaptureText({
          uri: result.assets[0].uri,
          source: 'camera',
        });
      }
    } catch (err) {
      console.warn('System camera error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Full-screen Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        {...(torch ? { enableTorch: true } : {})}
      >
        {/* 2. Top Bar (Pinned to Top) */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Scan Label</Text>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={() => setTorch(!torch)}>
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={torch ? '#F59E0B' : '#FFF'} />
          </TouchableOpacity>
        </View>

        {/* 3. Center Target Viewfinder Frame */}
        <View style={styles.centerTargetFrame} pointerEvents="none">
          <View style={styles.frameBox}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>Align ingredient label within frame</Text>
            </View>
          </View>
        </View>

        {/* 4. Bottom Controls Bar (Strictly Pinned to Bottom) */}
        <View style={styles.bottomControlsBar}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.auxBtn} onPress={pickFromGallery}>
            <View style={styles.iconCircleBtn}>
              <Ionicons name="images-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.auxBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Big Center Shutter Button */}
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

          {/* Native HD Camera Option */}
          <TouchableOpacity style={styles.auxBtn} onPress={openSystemCamera}>
            <View style={styles.iconCircleBtn}>
              <Ionicons name="camera-reverse-outline" size={24} color="#06B6D4" />
            </View>
            <Text style={styles.auxBtnLabel}>HD Cam</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  iconCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerTargetFrame: {
    position: 'absolute',
    top: '25%',
    left: 24,
    right: 24,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  frameBox: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#0284C7',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0284C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  hintText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomControlsBar: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 30,
  },
  auxBtn: {
    alignItems: 'center',
    width: 58,
  },
  auxBtnLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  auxBtnSpacer: {
    width: 58,
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0284C7',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  permDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 14,
    padding: 10,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
