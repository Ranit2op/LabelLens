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

      {/* 2. Harmful / Bad Ingredients (খারাপ উপাদান) */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
        <Text style={styles.sectionTitle}>
          খারাপ / ক্ষতিকর উপাদান ({badIngredients.length})
        </Text>
      </View>

      {badIngredients.length === 0 ? (
        <View style={styles.emptyGoodBox}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          <Text style={styles.emptyGoodTitle}>কোনো ক্ষতিকর কেমিক্যাল পাওয়া যায়নি!</Text>
          <Text style={styles.emptyGoodDesc}>এই প্যাকেটে ক্ষতিকর কোনো E-numbers বা লুকানো চিনি পাওয়া যায়নি।</Text>
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

      {/* 3. Good / Safe Ingredients (ভালো ও নিরাপদ উপাদান) */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.sectionTitle}>
          ভালো / নিরাপদ উপাদান ({goodIngredients.length})
        </Text>
      </View>

      {goodIngredients.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyDesc}>কোনো স্পষ্ট পুষ্টিকর উপাদান পাওয়া যায়নি।</Text>
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
        <Text style={styles.rescanBtnText}>আরেকটি প্রোডাক্ট স্ক্যান করুন</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  verdictCard: {
    backgroundColor: '#111726',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    marginBottom: 20,
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
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  itemCard: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
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
    color: '#F1F5F9',
    flex: 1,
    marginRight: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemReason: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  emptyGoodBox: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  emptyGoodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 6,
  },
  emptyGoodDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyBox: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  rescanBtn: {
    flexDirection: 'row',
    backgroundColor: '#06B6D4',
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  rescanBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 15,
  },
});
