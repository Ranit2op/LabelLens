import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

export default function HistoryModal({ visible, onClose, onSelectHistoryItem }) {
  const { history, clearHistory } = useProfile();

  const handleClear = () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to delete all saved scan reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Scan History</Text>
              <Text style={styles.sheetSubtitle}>{history.length} saved reports</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {history.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={styles.scrollList}>
            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#334155" />
                <Text style={styles.emptyTitle}>No Scans Yet</Text>
                <Text style={styles.emptyDesc}>Scan an ingredient label to save your first report here.</Text>
              </View>
            ) : (
              history.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                >
                  <View
                    style={[
                      styles.scoreCircle,
                      { borderColor: item.verdictColor || '#10B981', backgroundColor: (item.verdictColor || '#10B981') + '1A' },
                    ]}
                  >
                    <Text style={[styles.scoreText, { color: item.verdictColor || '#10B981' }]}>
                      {item.score}
                    </Text>
                  </View>

                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleDateString()} • {item.verdictTitle}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </TouchableOpacity>
              ))
            )}
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
    maxHeight: '80%',
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
  clearBtn: {
    padding: 4,
  },
  scrollList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A29',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '900',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  historyDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
