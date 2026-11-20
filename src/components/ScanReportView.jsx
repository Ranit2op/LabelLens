import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HealthScoreBadge from './HealthScoreBadge';
import IngredientCard from './IngredientCard';

export default function ScanReportView({ analysis, rawText, onRescan, onSave, isSaved }) {
  const [activeTab, setActiveTab] = useState('all'); // all | hazards | sugars | safe

  if (!analysis) return null;

  const {
    score,
    grade,
    verdictColor,
    verdictTitle,
    summary,
    stats,
    dangerAdditives,
    cautionAdditives,
    safeAdditives,
    hiddenSugars,
    profileViolations,
    allergens,
    deductions,
  } = analysis;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Card */}
      <View style={[styles.headerCard, { borderColor: verdictColor + '40' }]}>
        <View style={styles.topRow}>
          <HealthScoreBadge score={score} grade={grade} color={verdictColor} size={90} />
          <View style={styles.verdictInfo}>
            <View style={[styles.verdictTag, { backgroundColor: verdictColor + '20' }]}>
              <Text style={[styles.verdictTagText, { color: verdictColor }]}>GRADE {grade}</Text>
            </View>
            <Text style={[styles.verdictTitle, { color: verdictColor }]}>{verdictTitle}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        </View>

        {/* Quick Stat Counter Badges */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>{stats.dangerCount}</Text>
            <Text style={styles.statLabel}>Hazards</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#F97316' }]}>{stats.sugarCount}</Text>
            <Text style={styles.statLabel}>Sugars</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]}>{stats.cautionCount}</Text>
            <Text style={styles.statLabel}>Caution</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{stats.safeCount}</Text>
            <Text style={styles.statLabel}>Clean</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: Save & Rescan */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.saveBtn, isSaved && styles.savedBtnDisabled]}
          disabled={isSaved}
          onPress={onSave}
        >
          <Ionicons name={isSaved ? 'checkmark-circle' : 'bookmark-outline'} size={18} color="#FFF" />
          <Text style={styles.actionBtnText}>{isSaved ? 'Saved to History' : 'Save Report'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.rescanBtn]} onPress={onRescan}>
          <Ionicons name="camera-reverse-outline" size={18} color="#06B6D4" />
          <Text style={[styles.actionBtnText, { color: '#06B6D4' }]}>Scan Another</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Violation Banner */}
      {profileViolations.length > 0 && (
        <View style={styles.violationBanner}>
          <Ionicons name="warning" size={24} color="#EF4444" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.violationTitle}>Profile Alert Triggered!</Text>
            <Text style={styles.violationDesc}>
              This item conflicts with your personal health restrictions:{' '}
              {profileViolations.map(p => p.name).join(', ')}.
            </Text>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({dangerAdditives.length + cautionAdditives.length + hiddenSugars.length + safeAdditives.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabPill, activeTab === 'hazards' && styles.tabPillActive]}
          onPress={() => setActiveTab('hazards')}
        >
          <Text style={[styles.tabText, activeTab === 'hazards' && styles.tabTextActive]}>
            Hazards ({dangerAdditives.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabPill, activeTab === 'sugars' && styles.tabPillActive]}
          onPress={() => setActiveTab('sugars')}
        >
          <Text style={[styles.tabText, activeTab === 'sugars' && styles.tabTextActive]}>
            Sugars ({hiddenSugars.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabPill, activeTab === 'safe' && styles.tabPillActive]}
          onPress={() => setActiveTab('safe')}
        >
          <Text style={[styles.tabText, activeTab === 'safe' && styles.tabTextActive]}>
            Clean ({safeAdditives.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ingredient Items List */}
      <View style={styles.itemsList}>
        {/* Hazards */}
        {(activeTab === 'all' || activeTab === 'hazards') &&
          dangerAdditives.map((item, idx) => (
            <IngredientCard key={'danger-' + idx} item={item} type="additive" />
          ))}

        {/* Hidden Sugars */}
        {(activeTab === 'all' || activeTab === 'sugars') &&
          hiddenSugars.map((item, idx) => (
            <IngredientCard key={'sugar-' + idx} item={item} type="sugar" />
          ))}

        {/* Caution */}
        {activeTab === 'all' &&
          cautionAdditives.map((item, idx) => (
            <IngredientCard key={'caution-' + idx} item={item} type="additive" />
          ))}

        {/* Clean / Safe */}
        {(activeTab === 'all' || activeTab === 'safe') &&
          safeAdditives.map((item, idx) => (
            <IngredientCard key={'safe-' + idx} item={item} type="additive" />
          ))}

        {/* Empty State */}
        {stats.totalAdditives === 0 && stats.sugarCount === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="sparkles" size={32} color="#10B981" />
            <Text style={styles.emptyTitle}>Zero Hazardous Additives Found</Text>
            <Text style={styles.emptyDesc}>No controversial E-numbers or hidden sugars were identified.</Text>
          </View>
        )}
      </View>

      {/* Scientific Transparency: Score Breakdown */}
      {deductions.length > 0 && (
        <View style={styles.deductionSection}>
          <Text style={styles.deductionTitle}>Score Deduction Breakdown:</Text>
          {deductions.map((d, i) => (
            <Text key={i} style={styles.deductionItem}>
              {d}
            </Text>
          ))}
        </View>
      )}

      {/* Raw Ingredients Text Accordion */}
      {rawText ? (
        <View style={styles.rawTextCard}>
          <Text style={styles.rawTextHeader}>Extracted Raw Text:</Text>
          <Text style={styles.rawTextBody}>{rawText}</Text>
        </View>
      ) : null}
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
  headerCard: {
    backgroundColor: '#111726',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  verdictInfo: {
    flex: 1,
  },
  verdictTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  verdictTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E293B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
  },
  savedBtnDisabled: {
    backgroundColor: '#1E293B',
  },
  rescanBtn: {
    backgroundColor: '#0E2439',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  violationBanner: {
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  violationTitle: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 14,
  },
  violationDesc: {
    color: '#FECACA',
    fontSize: 12,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#131A29',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#06B6D4',
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#F1F5F9',
  },
  itemsList: {
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyTitle: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 15,
    marginTop: 10,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  deductionSection: {
    backgroundColor: '#111726',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  deductionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 6,
  },
  deductionItem: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 3,
  },
  rawTextCard: {
    backgroundColor: '#0F1523',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rawTextHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  rawTextBody: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
