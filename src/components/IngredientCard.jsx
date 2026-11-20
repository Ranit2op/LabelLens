import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IngredientCard({ item, type = 'additive' }) {
  const [expanded, setExpanded] = useState(false);

  // Type: additive | sugar | allergen
  const isDanger = item.risk === 'danger' || item.dangerLevel === 'extreme' || item.isProfileViolation;
  const isCaution = item.risk === 'caution' || item.dangerLevel === 'high' || item.dangerLevel === 'moderate';

  const badgeColor = isDanger ? '#EF4444' : isCaution ? '#F59E0B' : '#10B981';
  const badgeLabel = isDanger ? 'HAZARD' : isCaution ? 'CAUTION' : 'SAFE';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={[styles.card, { borderLeftColor: badgeColor }]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.nameRow}>
            {item.code && (
              <View style={[styles.codeBadge, { backgroundColor: badgeColor + '25' }]}>
                <Text style={[styles.codeText, { color: badgeColor }]}>{item.code}</Text>
              </View>
            )}
            <Text style={styles.nameText} numberOfLines={expanded ? undefined : 1}>
              {item.name}
            </Text>
          </View>
          <Text style={styles.categoryText}>
            {item.category || (type === 'sugar' ? `Sugar (GI: ${item.glycemicIndex})` : 'Allergen / Constraint')}
          </Text>
        </View>

        <View style={styles.rightAction}>
          <View style={[styles.statusPill, { backgroundColor: badgeColor + '20' }]}>
            <Text style={[styles.statusText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748B"
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>

      {/* Description / Summary */}
      {item.description && (
        <Text style={styles.descText} numberOfLines={expanded ? undefined : 2}>
          {item.description}
        </Text>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedSection}>
          {item.sideEffects && item.sideEffects.length > 0 && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailTitle}>Known Side Effects & Risks:</Text>
              {item.sideEffects.map((effect, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={[styles.bullet, { color: badgeColor }]}>•</Text>
                  <Text style={styles.bulletText}>{effect}</Text>
                </View>
              ))}
            </View>
          )}

          {item.bannedIn && item.bannedIn.length > 0 && (
            <View style={styles.detailBlock}>
              <Text style={[styles.detailTitle, { color: '#EF4444' }]}>Banned / Restricted In:</Text>
              <Text style={styles.bulletText}>{item.bannedIn.join(', ')}</Text>
            </View>
          )}

          {item.matchedKeywords && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailTitle}>Matched Trigger Words:</Text>
              <Text style={styles.bulletText}>{item.matchedKeywords.join(', ')}</Text>
            </View>
          )}

          {item.foundIn && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailTitle}>Commonly Found In:</Text>
              <Text style={styles.bulletText}>{item.foundIn.join(', ')}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131A29',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 18,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  detailBlock: {
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    flex: 1,
  },
});
