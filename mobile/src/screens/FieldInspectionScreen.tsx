import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MOCK_BENEFICIARIES } from '../data/mockBeneficiaries';
import { Beneficiary, InspectionPayload } from '../types';
import { StageBadge } from '../components/StageBadge';
import { WatermarkCard } from '../components/WatermarkCard';
import { GeoService } from '../services/geoService';
import { AiClassifierService, AiVisionResult } from '../services/aiClassifier';
import { useSync } from '../context/SyncContext';

export const FieldInspectionScreen: React.FC = () => {
  const { addInspection } = useSync();
  const [search, setSearch] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeStep, setActiveStep] = useState<'camera' | 'review' | 'success'>('camera');

  // Inspection form state
  const [currentCoords, setCurrentCoords] = useState<any>(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [aiResult, setAiResult] = useState<AiVisionResult | null>(null);
  const [watermark, setWatermark] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [opticalTilt, setOpticalTilt] = useState(14.2);

  const filtered = MOCK_BENEFICIARIES.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.village.toLowerCase().includes(search.toLowerCase())
  );

  const startInspection = (b: Beneficiary) => {
    setSelectedBeneficiary(b);
    const coords = GeoService.getSimulatedFieldCoordinates(
      b.targetCoordinates.latitude,
      b.targetCoordinates.longitude
    );
    const dist = GeoService.calculateDistance(
      coords.latitude,
      coords.longitude,
      b.targetCoordinates.latitude,
      b.targetCoordinates.longitude
    );
    const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const mark = GeoService.generateWatermark(b.id, b.currentStage, coords, timeStr);
    const ai = AiClassifierService.classifyImage(b.currentStage, true);

    setCurrentCoords(coords);
    setDistanceMeters(dist);
    setTimestamp(timeStr);
    setWatermark(mark);
    setAiResult(ai);
    setInspectorNotes(`Physical site verified at ${b.village}. Construction aligns with ${b.currentStage} guidelines.`);
    setActiveStep('camera');
    setIsInspecting(true);
  };

  const handleCapture = () => {
    setActiveStep('review');
  };

  const handleFinalSubmit = async () => {
    if (!selectedBeneficiary || !currentCoords) return;

    const payload: InspectionPayload = {
      id: `INSP-${Date.now().toString().slice(-6)}`,
      beneficiaryId: selectedBeneficiary.id,
      beneficiaryName: selectedBeneficiary.name,
      stage: selectedBeneficiary.currentStage,
      timestamp,
      coordinates: currentCoords,
      spatialDistanceMeters: distanceMeters,
      opticalLivenessPassed: true,
      deviceTiltAngle: opticalTilt,
      aiClassification: {
        predictedStage: aiResult?.predictedStage || selectedBeneficiary.currentStage,
        confidence: aiResult?.confidence || 0.94,
        matchesExpected: aiResult?.matchesExpected ?? true,
      },
      watermarkSignature: watermark,
      imageUri: 'demo_inspection_photo.jpg',
      notes: inspectorNotes,
      synced: false,
    };

    await addInspection(payload);
    setActiveStep('success');
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search Beneficiary by ID, Name or Village..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Beneficiaries Inspection Queue */}
      <ScrollView style={styles.list}>
        <Text style={styles.sectionHeader}>
          Assigned PMAY-G Beneficiaries ({filtered.length})
        </Text>

        {filtered.map(b => (
          <View key={b.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.benName}>{b.name}</Text>
                <Text style={styles.benRelation}>c/o {b.fatherHusbandName}</Text>
              </View>
              <StageBadge stage={b.currentStage} />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>📍 {b.village}, {b.gramPanchayat}</Text>
              <Text style={styles.detailText}>🆔 {b.id}</Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.finLabel}>Sanction: ₹{b.sanctionAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.finDisbursed}>
                Paid: ₹{b.disbursedAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.inspectBtn}
              onPress={() => startInspection(b)}
            >
              <Text style={styles.inspectBtnText}>📷 Start Geotagged Inspection</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Geotagged Camera & Review Modal */}
      <Modal visible={isInspecting} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeStep === 'camera' && '📷 Geotagged Viewfinder'}
              {activeStep === 'review' && '📋 Inspection Verification'}
              {activeStep === 'success' && '✅ Inspection Queued'}
            </Text>
            <TouchableOpacity onPress={() => setIsInspecting(false)}>
              <Text style={styles.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {activeStep === 'camera' && (
            <ScrollView style={styles.modalBody}>
              {/* Live Viewfinder Simulation HUD */}
              <View style={styles.viewfinder}>
                <View style={styles.reticleTopLeft} />
                <View style={styles.reticleTopRight} />
                <View style={styles.reticleBottomLeft} />
                <View style={styles.reticleBottomRight} />

                {/* HUD Live Metadata */}
                <View style={styles.hudOverlay}>
                  <Text style={styles.hudText}>
                    GPS: {currentCoords?.latitude.toFixed(5)}°, {currentCoords?.longitude.toFixed(5)}°
                  </Text>
                  <Text style={styles.hudText}>
                    ACCURACY: ±{currentCoords?.accuracy}m (CEP-50) | ELEV: {currentCoords?.altitude}m
                  </Text>
                  <Text style={styles.hudText}>
                    GEOFENCE DISTANCE: {distanceMeters}m {distanceMeters <= 50 ? '🟢 WITHIN BOUNDS' : '🔴 OUTSIDE'}
                  </Text>
                  <Text style={styles.hudText}>
                    OPTICAL TILT: {opticalTilt}° (3D Liveness Active)
                  </Text>
                </View>

                <View style={styles.watermarkBurn}>
                  <Text style={styles.burnText}>🛡️ {watermark}</Text>
                  <Text style={styles.burnText}>{selectedBeneficiary?.id} | {selectedBeneficiary?.currentStage.toUpperCase()}</Text>
                </View>
              </View>

              {/* Edge AI Vision Assistant Card */}
              <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <Text style={styles.aiTitle}>🤖 Edge AI Stage Detector</Text>
                  <Text style={styles.aiConfidence}>
                    {Math.round((aiResult?.confidence || 0.94) * 100)}% Confidence
                  </Text>
                </View>
                <Text style={styles.aiDesc}>
                  Detected Features: {aiResult?.detectedFeatures.join(' • ')}
                </Text>
                <Text style={[styles.aiStatus, aiResult?.matchesExpected ? styles.aiSuccess : styles.aiWarning]}>
                  {aiResult?.matchesExpected
                    ? '✅ Visual proof matches expected milestone!'
                    : '⚠️ Warning: Potential stage mismatch detected!'}
                </Text>
              </View>

              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <Text style={styles.captureBtnText}>📸 Capture & Verify Milestone</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {activeStep === 'review' && (
            <ScrollView style={styles.modalBody}>
              {currentCoords && (
                <WatermarkCard
                  beneficiaryId={selectedBeneficiary?.id || ''}
                  stage={selectedBeneficiary?.currentStage || ''}
                  coords={currentCoords}
                  watermark={watermark}
                  timestamp={timestamp}
                />
              )}

              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Inspector Notes & Remarks</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={3}
                  value={inspectorNotes}
                  onChangeText={setInspectorNotes}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleFinalSubmit}>
                <Text style={styles.submitBtnText}>🔒 Sign & Save to Offline Queue</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {activeStep === 'success' && (
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successHeading}>Inspection Successfully Recorded!</Text>
              <Text style={styles.successSub}>
                ECDSA signature generated and encrypted into local storage. When network connects, payload will sync to MoRD state portal.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setIsInspecting(false)}
              >
                <Text style={styles.doneBtnText}>Return to Beneficiary List</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchSection: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  benName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  benRelation: {
    fontSize: 11,
    color: '#64748b',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 11,
    color: '#475569',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  finLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  finDisbursed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  inspectBtn: {
    backgroundColor: '#064e3b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  inspectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 14,
  },
  viewfinder: {
    height: 280,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38bdf8',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 12,
  },
  reticleTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#22c55e',
  },
  reticleTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#22c55e',
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#22c55e',
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#22c55e',
  },
  hudOverlay: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 8,
    borderRadius: 6,
  },
  hudText: {
    color: '#22c55e',
    fontSize: 9,
    fontFamily: 'Courier',
    fontWeight: '700',
    marginVertical: 1,
  },
  watermarkBurn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  burnText: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  aiCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  aiConfidence: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  aiDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 4,
  },
  aiStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiSuccess: {
    color: '#22c55e',
  },
  aiWarning: {
    color: '#f59e0b',
  },
  captureBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  reviewTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  successHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
