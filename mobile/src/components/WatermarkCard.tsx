import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GeoCoordinates } from '../types';

interface WatermarkCardProps {
  beneficiaryId: string;
  stage: string;
  coords: GeoCoordinates;
  watermark: string;
  timestamp: string;
}

export const WatermarkCard: React.FC<WatermarkCardProps> = ({
  beneficiaryId,
  stage,
  coords,
  watermark,
  timestamp,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badgeText}>🛡️ ECDSA CRYPTOGRAPHIC WATERMARK</Text>
        <Text style={styles.liveText}>● MONOTONIC CLOCK</Text>
      </View>

      <Text style={styles.sigCode}>{watermark}</Text>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>BENEFICIARY</Text>
          <Text style={styles.metaValue}>{beneficiaryId}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>STAGE</Text>
          <Text style={styles.metaValue}>{stage.toUpperCase()}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>GPS LAT / LNG</Text>
          <Text style={styles.metaValue}>
            {coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>ELEV / ACCURACY</Text>
          <Text style={styles.metaValue}>
            {coords.altitude}m MSL (±{coords.accuracy}m)
          </Text>
        </View>
      </View>

      <Text style={styles.timestamp}>Timestamp: {timestamp} IST</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveText: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: '700',
  },
  sigCode: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
    padding: 4,
    borderRadius: 4,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  metaItem: {
    width: '47%',
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '700',
  },
  metaValue: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    color: '#64748b',
    fontSize: 8,
    marginTop: 2,
  },
});
