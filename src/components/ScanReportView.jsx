import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanReportView({ analysis, onRescan }) {
  if (!analysis) return null;

  const { score, verdict, verdictColor, summary, badIngredients, goodIngredients } = analysis;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Score & Verdict Banner */}
      <View style={[styles.verdictCard, { borderColor: verdictColor + '50' }]}>
        <View style={[styles.scoreCircle, { borderColor: verdictColor, backgroundColor: verdictColor + '18' }]}>
          <Text style={[styles.scoreNumber, { color: verdictColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>

        <View style={styles.verdictInfo}>
          <Text style={[styles.verdictTitle, { color: verdictColor }]}>{verdict}</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      </View>

      {/* 2. Harmful / Bad Ingredients */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
        <Text style={styles.sectionTitle}>
          Harmful / Bad Ingredients ({badIngredients.length})
        </Text>
      </View>

      {badIngredients.length === 0 ? (
        <View style={styles.emptyGoodBox}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          <Text style={styles.emptyGoodTitle}>No Harmful Ingredients Detected!</Text>
          <Text style={styles.emptyGoodDesc}>No toxic E-numbers, hazardous additives, or disguised sugars were found.</Text>
        </View>
      ) : (
        badIngredients.map((item, idx) => (
          <View
            key={'bad-' + idx}
            style={[
              styles.itemCard,
              { borderLeftColor: item.severity === 'danger' ? '#EF4444' : '#F59E0B' },
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: (item.severity === 'danger' ? '#EF4444' : '#F59E0B') + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.severity === 'danger' ? '#EF4444' : '#F59E0B' },
                  ]}
                >
                  {item.code || item.riskLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.itemReason}>⚠️ {item.reason}</Text>
          </View>
        ))
      )}

      {/* 3. Good / Safe Ingredients */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.sectionTitle}>
          Good / Safe Ingredients ({goodIngredients.length})
        </Text>
      </View>

      {goodIngredients.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyDesc}>No standout wholesome ingredients identified.</Text>
        </View>
      ) : (
        goodIngredients.map((item, idx) => (
          <View key={'good-' + idx} style={[styles.itemCard, { borderLeftColor: '#10B981' }]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.badgePill, { backgroundColor: '#10B98120' }]}>
                <Text style={[styles.badgeText, { color: '#10B981' }]}>{item.code || 'Safe'}</Text>
              </View>
            </View>
            <Text style={[styles.itemReason, { color: '#94A3B8' }]}>✅ {item.benefit}</Text>
          </View>
        ))
      )}

      {/* 4. Large Action Button to Rescan */}
      <TouchableOpacity style={styles.rescanBtn} activeOpacity={0.8} onPress={onRescan}>
        <Ionicons name="scan-outline" size={22} color="#090D16" />
        <Text style={styles.rescanBtnText}>Scan Another Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  verdictCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: -2,
  },
  verdictInfo: {
    flex: 1,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemReason: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  emptyGoodBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emptyGoodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 6,
  },
  emptyGoodDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  rescanBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  rescanBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
