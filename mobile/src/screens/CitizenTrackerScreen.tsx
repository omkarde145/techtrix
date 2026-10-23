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
import { MOCK_BENEFICIARIES } from '../data/mockBeneficiaries';
import { Beneficiary, StageType } from '../types';
import { StageBadge } from '../components/StageBadge';

const STAGE_ORDER: StageType[] = ['registration', 'foundation', 'plinth', 'lintel', 'roof', 'completed'];

export const CitizenTrackerScreen: React.FC = () => {
  const [query, setQuery] = useState('UP-2024-8841-A');
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(MOCK_BENEFICIARIES[0]);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceSent, setGrievanceSent] = useState(false);

  const handleSearch = () => {
    const found = MOCK_BENEFICIARIES.find(
      b =>
        b.id.toLowerCase() === query.trim().toLowerCase() ||
        b.phone.includes(query.trim())
    );
    if (found) {
      setSelectedBen(found);
    } else {
      Alert.alert('Not Found', 'No PMAY-G beneficiary matches this Sanction ID or Mobile Number.');
    }
  };

  const handleGrievanceSubmit = () => {
    if (!grievanceText.trim()) {
      Alert.alert('Empty', 'Please describe your grievance or delay issue.');
      return;
    }
    setGrievanceSent(true);
    setGrievanceText('');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search Hero Box */}
      <View style={styles.searchBox}>
        <Text style={styles.heroTitle}>🇮🇳 PMAY-G Public Tracking Portal</Text>
        <Text style={styles.heroSub}>
          Track your home construction progress, geo-inspections, and DBT installment releases directly with zero login.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter PMAY ID (e.g. UP-2024-8841-A)..."
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Track</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedBen && (
        <View style={styles.resultCard}>
          {/* Beneficiary Header */}
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.name}>{selectedBen.name}</Text>
              <Text style={styles.meta}>c/o {selectedBen.fatherHusbandName} • {selectedBen.village}</Text>
              <Text style={styles.subMeta}>Panchayat: {selectedBen.gramPanchayat}, Dist: {selectedBen.district}</Text>
            </View>
            <StageBadge stage={selectedBen.currentStage} />
          </View>

          {/* Direct Benefit Transfer (DBT) Financial Summary */}
          <View style={styles.finGrid}>
            <View style={styles.finBox}>
              <Text style={styles.finTitle}>TOTAL SANCTION</Text>
              <Text style={styles.finVal}>₹{selectedBen.sanctionAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.finBox}>
              <Text style={styles.finTitle}>DBT DISBURSED</Text>
              <Text style={[styles.finVal, { color: '#059669' }]}>
                ₹{selectedBen.disbursedAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.finBox}>
              <Text style={styles.finTitle}>REMAINING</Text>
              <Text style={[styles.finVal, { color: '#d97706' }]}>
                ₹{(selectedBen.sanctionAmount - selectedBen.disbursedAmount).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Milestone Step Timeline */}
          <Text style={styles.timelineTitle}>Construction Sequential Milestones</Text>
          <View style={styles.timeline}>
            {STAGE_ORDER.map((s, idx) => {
              const currentIdx = STAGE_ORDER.indexOf(selectedBen.currentStage);
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <View key={s} style={styles.timelineRow}>
                  <View style={[styles.stepDot, isPassed && styles.stepPassed, isCurrent && styles.stepCurrent]}>
                    <Text style={styles.stepNum}>{isPassed ? '✓' : idx + 1}</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepLabel, isPassed && styles.stepLabelPassed]}>
                      {s.toUpperCase()}
                    </Text>
                    <Text style={styles.stepSub}>
                      {isCurrent
                        ? 'Under Active Verification'
                        : isPassed
                        ? 'Inspected & Approved via Geotag'
                        : 'Pending Next Stage Completion'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* DBT Direct Credit Details */}
          <View style={styles.bankCard}>
            <Text style={styles.bankTitle}>🏦 Bank Account Linked for DBT (PFMS)</Text>
            <Text style={styles.bankText}>Account: {selectedBen.bankAccountMasked} ({selectedBen.ifscCode})</Text>
            <Text style={styles.bankText}>Ration Card: {selectedBen.rationCardNumber} (Aadhaar Seeded)</Text>
          </View>

          {/* Citizen Grievance Redressal Form */}
          <View style={styles.grievanceBox}>
            <Text style={styles.grievanceTitle}>📢 Submit Grievance / Discrepancy</Text>
            <Text style={styles.grievanceSub}>
              Have an issue with installment delay or geotag inspection? Directly notify District Officers.
            </Text>

            {grievanceSent ? (
              <View style={styles.sentBox}>
                <Text style={styles.sentText}>✅ Grievance Ticket #GRV-2024-912 created successfully!</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.grievanceInput}
                  placeholder="Describe your issue or delay here..."
                  multiline
                  numberOfLines={3}
                  value={grievanceText}
                  onChangeText={setGrievanceText}
                />
                <TouchableOpacity style={styles.grievanceBtn} onPress={handleGrievanceSubmit}>
                  <Text style={styles.grievanceBtnText}>Send Grievance to Block Office</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  searchBox: {
    backgroundColor: '#064e3b',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    color: '#a7f3d0',
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    margin: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#475569',
  },
  subMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  finGrid: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  finBox: {
    flex: 1,
    alignItems: 'center',
  },
  finTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  finVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  timeline: {
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepPassed: {
    backgroundColor: '#10b981',
  },
  stepCurrent: {
    backgroundColor: '#3b82f6',
  },
  stepNum: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  stepLabelPassed: {
    color: '#0f172a',
  },
  stepSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  bankCard: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 2,
  },
  bankText: {
    fontSize: 11,
    color: '#3b82f6',
  },
  grievanceBox: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  grievanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  grievanceSub: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  grievanceInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  grievanceBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  grievanceBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sentBox: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sentText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
});
