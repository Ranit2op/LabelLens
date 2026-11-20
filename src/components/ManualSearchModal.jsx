import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManualSearchModal({ visible, onClose, onAnalyzeText }) {
  const [inputText, setInputText] = useState('');

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    onAnalyzeText(inputText);
    setInputText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Paste or Type Ingredients</Text>
              <Text style={styles.sheetSubtitle}>Analyze any product text instantly offline</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Text Input Area */}
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Paste ingredient text here... e.g.: Wheat flour, Sugar, Palm oil, E621, Sodium Benzoate, Invert syrup..."
            placeholderTextColor="#475569"
            value={inputText}
            onChangeText={setInputText}
            autoFocus
          />

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setInputText('')}
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.analyzeBtn, !inputText.trim() && styles.analyzeBtnDisabled]}
              disabled={!inputText.trim()}
              onPress={handleAnalyze}
            >
              <Ionicons name="search" size={18} color="#090D16" />
              <Text style={styles.analyzeBtnText}>Analyze Ingredients</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 4,
  },
  textArea: {
    backgroundColor: '#131A29',
    borderRadius: 14,
    padding: 14,
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
    height: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  analyzeBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 14,
  },
});
