import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { StageBadge } from '../components/StageBadge';

export const AdminApprovalScreen: React.FC = () => {
  const { isDscVerified, verifyDscPin, logoutDsc } = useAuth();
  const { inspections } = useSync();
  const [pinInput, setPinInput] = useState('');
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  const handlePinSubmit = () => {
    if (verifyDscPin(pinInput)) {
      setPinInput('');
    } else {
      Alert.alert('Authentication Failed', 'Invalid DSC Cryptographic PIN. Please try again.');
    }
  };

  const handleApprove = (id: string, name: string) => {
    setApprovedIds([...approvedIds, id]);
    Alert.alert(
      'PFMS FTO Dispatched 🏛️',
      `Stage approval digitally signed for ${name}. Automated PFMS XML batch dispatched to State Treasury.`
    );
  };

  if (!isDscVerified) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={styles.authTitle}>BDO / JE Officer Sign-in</Text>
          <Text style={styles.authSub}>
            Enter your NIC Digital Signature Certificate (DSC) Hardware Token PIN to unlock financial approvals.
          </Text>

          <TextInput
            style={styles.pinInput}
            placeholder="Enter 4-digit DSC PIN (Demo: 2024)"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pinInput}
            onChangeText={setPinInput}
          />

          <TouchableOpacity style={styles.authBtn} onPress={handlePinSubmit}>
            <Text style={styles.authBtnText}>Verify DSC Cryptographic PIN</Text>
          </TouchableOpacity>

          <Text style={styles.tokenHint}>Demo Credentials: DSC Token PIN is 2024</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Officer Header */}
      <View style={styles.officerBar}>
        <View>
          <Text style={styles.officerName}>Dr. S. K. Awasthi, BDO</Text>
          <Text style={styles.officerRole}>Block Development Officer • DSC Validated (P-256)</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logoutDsc}>
          <Text style={styles.logoutText}>Lock DSC</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Inspections Pending Maker-Checker Sign-off ({inspections.length})
        </Text>

        {inspections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>All Current Inspections Approved</Text>
            <Text style={styles.emptySub}>
              New field inspections submitted from the Field Inspector tab will appear here for dual-signature clearance.
            </Text>
          </View>
        ) : (
          inspections.map(item => {
            const isDone = approvedIds.includes(item.id);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.benName}>{item.beneficiaryName}</Text>
                    <Text style={styles.benId}>ID: {item.beneficiaryId}</Text>
                  </View>
                  <StageBadge stage={item.stage} />
                </View>

                {/* Audit Checklist */}
                <View style={styles.auditGrid}>
                  <Text style={styles.auditItem}>
                    📍 Distance: {item.spatialDistanceMeters}m (Within 50m tolerance)
                  </Text>
                  <Text style={styles.auditItem}>
                    🛰️ Watermark: {item.watermarkSignature.slice(0, 24)}...
                  </Text>
                  <Text style={styles.auditItem}>
                    🤖 AI Confidence: {Math.round(item.aiClassification.confidence * 100)}% ({item.aiClassification.predictedStage})
                  </Text>
                  <Text style={styles.auditItem}>
                    🕒 Captured: {item.timestamp}
                  </Text>
                </View>

                {isDone ? (
                  <View style={styles.approvedPill}>
                    <Text style={styles.approvedText}>✓ Digitally Signed & PFMS FTO Released</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id, item.beneficiaryName)}
                  >
                    <Text style={styles.approveBtnText}>
                      ✍️ Sign Approval & Release DBT Installment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  authIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  authTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  authSub: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 16,
  },
  pinInput: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },
  authBtn: {
    width: '100%',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  authBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  tokenHint: {
    color: '#64748b',
    fontSize: 10,
  },
  officerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  officerName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  officerRole: {
    color: '#38bdf8',
    fontSize: 10,
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  benName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  benId: {
    fontSize: 11,
    color: '#64748b',
  },
  auditGrid: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 4,
  },
  auditItem: {
    fontSize: 11,
    color: '#334155',
    fontFamily: 'Courier',
  },
  approveBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  approvedPill: {
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approvedText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
});
