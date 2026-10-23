import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSync } from '../context/SyncContext';
import { StageBadge } from '../components/StageBadge';

interface OfflineQueueScreenProps {
  onClose: () => void;
}

export const OfflineQueueScreen: React.FC<OfflineQueueScreenProps> = ({ onClose }) => {
  const { inspections, syncAllPending, isOnline } = useSync();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'Cannot sync while network is offline. Please reconnect Wi-Fi/4G.');
      return;
    }
    setIsSyncing(true);
    const res = await syncAllPending();
    setIsSyncing(false);
    Alert.alert(
      'Synchronization Complete',
      `Successfully synced ${res.success} pending inspections to State Server.`
    );
  };

  const pending = inspections.filter(i => !i.synced);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚡ Offline Synchronization Queue</Text>
          <Text style={styles.sub}>
            {pending.length} pending • {isOnline ? 'Network Connected' : 'No Network Available'}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Button */}
      <View style={styles.syncBar}>
        <TouchableOpacity
          style={[styles.syncBtn, (!isOnline || pending.length === 0) && styles.syncBtnDisabled]}
          onPress={handleSync}
          disabled={!isOnline || pending.length === 0 || isSyncing}
        >
          <Text style={styles.syncBtnText}>
            {isSyncing ? '🔄 Syncing Payloads...' : `🚀 Push ${pending.length} Payloads to MoRD Server`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      <ScrollView style={styles.list}>
        {inspections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No inspection payloads currently queued.</Text>
          </View>
        ) : (
          inspections.map(item => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <View>
                  <Text style={styles.itemName}>{item.beneficiaryName}</Text>
                  <Text style={styles.itemId}>ID: {item.beneficiaryId}</Text>
                </View>
                <StageBadge stage={item.stage} />
              </View>

              <View style={styles.itemMeta}>
                <Text style={styles.metaText}>📍 {item.coordinates.latitude.toFixed(4)}°, {item.coordinates.longitude.toFixed(4)}°</Text>
                <Text style={styles.metaText}>🛡️ {item.watermarkSignature.slice(0, 18)}...</Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={[styles.statusPill, item.synced ? styles.synced : styles.pending]}>
                  {item.synced ? '✓ Synced to Cloud' : '⏳ Pending Local Cache'}
                </Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  sub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  syncBar: {
    padding: 12,
    backgroundColor: '#1e293b',
  },
  syncBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  empty: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  item: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  itemId: {
    color: '#94a3b8',
    fontSize: 11,
  },
  itemMeta: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 2,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Courier',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
  },
  synced: {
    backgroundColor: '#064e3b',
    color: '#6ee7b7',
  },
  pending: {
    backgroundColor: '#78350f',
    color: '#fde68a',
  },
  timeText: {
    color: '#64748b',
    fontSize: 9,
  },
});
