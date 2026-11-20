import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAMPLE_PRESETS } from '../database/samplePresets';

export default function PresetSelectorModal({ visible, onClose, onSelectPreset }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Test Real-World Labels</Text>
              <Text style={styles.sheetSubtitle}>Tap any product to test without a physical label</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* List of Presets */}
          <ScrollView contentContainerStyle={styles.scrollList}>
            {SAMPLE_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetCard}
                activeOpacity={0.7}
                onPress={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
              >
                <View style={styles.presetIconBox}>
                  <Ionicons name="fast-food-outline" size={20} color="#06B6D4" />
                </View>
                <View style={styles.presetInfo}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{preset.category}</Text>
                  </View>
                  <Text style={styles.presetTitle}>{preset.title}</Text>
                  <Text style={styles.presetSubtitle}>{preset.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollList: {
    paddingBottom: 16,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A29',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  presetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#06B6D41A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  presetInfo: {
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#06B6D4',
    fontWeight: '700',
  },
  presetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  presetSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
