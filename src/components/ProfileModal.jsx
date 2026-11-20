import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

export default function ProfileModal({ visible, onClose }) {
  const { profile, toggleRestriction } = useProfile();

  const RESTRICTION_ITEMS = [
    {
      key: 'diabetic',
      title: 'Diabetic / Sugar Watch',
      desc: 'Penalizes Maltodextrin, Dextrose, and hidden high-glycemic index sweeteners.',
      icon: 'fitness-outline',
      color: '#EF4444',
    },
    {
      key: 'glutenSensitive',
      title: 'Gluten Free / Celiac',
      desc: 'Flags wheat flour, maida, barley, rye, and malt extract.',
      icon: 'nutrition-outline',
      color: '#F59E0B',
    },
    {
      key: 'lactoseIntolerant',
      title: 'Lactose Intolerant',
      desc: 'Flags milk solids, whey protein, casein, and dairy derivatives.',
      icon: 'water-outline',
      color: '#3B82F6',
    },
    {
      key: 'peanutAllergy',
      title: 'Peanut / Groundnut Allergy',
      desc: 'Zero tolerance for peanuts, groundnut oil, and arachis extracts.',
      icon: 'alert-circle-outline',
      color: '#EF4444',
    },
    {
      key: 'nutAllergy',
      title: 'Tree Nut Allergy',
      desc: 'Flags almonds, cashews, walnuts, pistachios, and hazelnuts.',
      icon: 'warning-outline',
      color: '#F97316',
    },
    {
      key: 'vegan',
      title: '100% Vegan Only',
      desc: 'Flags dairy, whey, gelatin, carmine (E120), shellac (E904), and eggs.',
      icon: 'leaf-outline',
      color: '#10B981',
    },
    {
      key: 'heartHealthy',
      title: 'Heart Healthy (No Trans Fats)',
      desc: 'Strict warning against partially hydrogenated vegetable oils & vanaspati.',
      icon: 'heart-outline',
      color: '#EC4899',
    },
    {
      key: 'palmOilFree',
      title: 'Palm Oil Free',
      desc: 'Warns against fractionated palm oil, palmitate, and palmolein.',
      icon: 'earth-outline',
      color: '#14B8A6',
    },
    {
      key: 'childSafe',
      title: 'Child Safe (No Azo Dyes)',
      desc: 'Warns against hyperactivity synthetic dyes (Tartrazine E102, Sunset Yellow E110).',
      icon: 'shield-checkmark-outline',
      color: '#8B5CF6',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Health & Allergy Profile</Text>
              <Text style={styles.sheetSubtitle}>Personalize real-time hazard flags</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* List of Toggles */}
          <ScrollView contentContainerStyle={styles.scrollList}>
            {RESTRICTION_ITEMS.map(item => (
              <View key={item.key} style={styles.toggleRow}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>{item.title}</Text>
                  <Text style={styles.toggleDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={!!profile[item.key]}
                  onValueChange={() => toggleRestriction(item.key)}
                  thumbColor={profile[item.key] ? item.color : '#475569'}
                  trackColor={{ false: '#1E293B', true: item.color + '60' }}
                />
              </View>
            ))}
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Save Profile Settings</Text>
          </TouchableOpacity>
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
    maxHeight: '85%',
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A29',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
