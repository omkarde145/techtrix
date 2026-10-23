import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StageType } from '../types';

interface StageBadgeProps {
  stage: StageType;
}

const STAGE_CONFIG: Record<StageType, { label: string; color: string; bg: string }> = {
  registration: { label: 'Registration', color: '#64748b', bg: '#f1f5f9' },
  foundation: { label: 'Foundation Excavation', color: '#b45309', bg: '#fef3c7' },
  plinth: { label: 'Plinth Level', color: '#0369a1', bg: '#e0f2fe' },
  lintel: { label: 'Lintel & Masonry', color: '#6d28d9', bg: '#ede9fe' },
  roof: { label: 'Roof Slab Cast', color: '#c2410c', bg: '#ffedd5' },
  completed: { label: 'House Completed', color: '#15803d', bg: '#dcfce7' },
};

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const conf = STAGE_CONFIG[stage] || STAGE_CONFIG.registration;
  return (
    <View style={[styles.badge, { backgroundColor: conf.bg }]}>
      <Text style={[styles.text, { color: conf.color }]}>{conf.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
