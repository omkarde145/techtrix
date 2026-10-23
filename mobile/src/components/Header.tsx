import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

interface HeaderProps {
  onOpenSyncQueue?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSyncQueue }) => {
  const { role, setRole, inspectorBadge } = useAuth();
  const { isOnline, setIsOnline, pendingCount } = useSync();

  return (
    <View style={styles.container}>
      {/* Top GovTech Banner */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <Text style={styles.flagIcon}>🇮🇳</Text>
          <View>
            <Text style={styles.title}>GraminVikas 360</Text>
            <Text style={styles.subtitle}>MoRD • PMAY-G Mobile Mission</Text>
          </View>
        </View>

        {/* Network & Offline Queue Pill */}
        <View style={styles.statusGroup}>
          <TouchableOpacity
            style={[styles.networkPill, { backgroundColor: isOnline ? '#ecfdf5' : '#fef2f2' }]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.dot, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
            <Text style={[styles.networkText, { color: isOnline ? '#065f46' : '#991b1b' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          {pendingCount > 0 && onOpenSyncQueue && (
            <TouchableOpacity style={styles.queuePill} onPress={onOpenSyncQueue}>
              <Text style={styles.queueText}>⚡ {pendingCount}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Navigation Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, role === 'inspector' && styles.segmentActive]}
          onPress={() => setRole('inspector')}
        >
          <Text style={[styles.segmentText, role === 'inspector' && styles.segmentTextActive]}>
            👷 Field ({inspectorBadge})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, role === 'citizen' && styles.segmentActive]}
          onPress={() => setRole('citizen')}
        >
          <Text style={[styles.segmentText, role === 'citizen' && styles.segmentTextActive]}>
            👥 Citizen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, role === 'admin' && styles.segmentActive]}
          onPress={() => setRole('admin')}
        >
          <Text style={[styles.segmentText, role === 'admin' && styles.segmentTextActive]}>
            🏛️ BDO Sign
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#064e3b',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#047857',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: '#a7f3d0',
    fontWeight: '500',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  queuePill: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  queueText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#022c22',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#059669',
  },
  segmentText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
