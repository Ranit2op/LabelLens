import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HealthScoreBadge({ score = 100, grade = 'A', color = '#10B981', size = 96 }) {
  return (
    <View style={[styles.outerRing, { borderColor: color, width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.innerGlow, { backgroundColor: color + '18' }]}>
        <Text style={[styles.gradeText, { color }]}>{grade}</Text>
        <Text style={styles.scoreText}>{score}/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  innerGlow: {
    width: '88%',
    height: '88%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: -2,
  },
});
