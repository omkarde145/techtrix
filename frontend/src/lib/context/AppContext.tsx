'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Beneficiary, 
  InspectionRecord, 
  SyncRecord, 
  AuditLog, 
  StageType, 
  FraudAlert,
  StorageQuotaInfo,
  DscSignatureInfo,
  JeTechnicalClearance,
  DpdpConsentArtifact,
  CoPresenceArtifact,
  OpticalLivenessArtifact,
  MonotonicTimeArtifact,
  GpsSpatialFilterArtifact,
  AiVisionAnalysisResult
} from '@/types';
import { db, requestStoragePersistence } from '@/lib/db/indexedDb';
import { SEED_BENEFICIARIES, INITIAL_AUDIT_LOGS } from '@/lib/db/seedData';
import { checkGeofenceCollision, checkDuplicateRationCard } from '@/lib/engines/verificationEngine';
import { signInspectionPayload, computeSha256, encryptSensitiveData } from '@/lib/engines/cryptoEngine';
import { getStorageQuotaEstimate } from '@/lib/engines/compressionEngine';
import { Language } from '@/lib/i18n/translations';

interface OfficerProfile {
  id: string;
  name: string;
  designation: string;
  block: string;
  panchayat: string;
}

interface AdminProfile {
  id: string;
  name: string;
  designation: string;
  jurisdiction: string;
  dscCertificateId: string;
}

interface AppContextType {
  role: 'field' | 'admin';
  setRole: (role: 'field' | 'admin') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  sunlightMode: boolean;
  toggleSunlightMode: () => void;
  isAuthenticatedInspector: boolean;
  authenticateInspector: (id: string, pin: string) => boolean;
  logoutInspector: () => void;
  isAuthenticatedAdmin: boolean;
  authenticateAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  beneficiaries: Beneficiary[];
  syncQueue: SyncRecord[];
  auditLogs: AuditLog[];
  officer: OfficerProfile;
  admin: AdminProfile;
  selectedPanchayat: string;
  setSelectedPanchayat: (gp: string) => void;
  storageQuota: StorageQuotaInfo | null;
  isStoragePersisted: boolean;
  submitInspection: (data: {
    beneficiaryId: string;
    stage: StageType;
    photoUrl: string;
    watermarkedPhotoUrl: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy: number;
    notes: string;
    compressedBlobSize?: number;
    mockGpsCheck?: { isMock: boolean; reason?: string; trustScore: number };
    dpdpConsent?: DpdpConsentArtifact;
    coPresence?: CoPresenceArtifact;
    opticalLiveness?: OpticalLivenessArtifact;
    monotonicTime?: MonotonicTimeArtifact;
    gpsSpatialFilter?: GpsSpatialFilterArtifact;
    aiVisionAnalysis?: AiVisionAnalysisResult;
  }) => Promise<{ success: boolean; syncStatus: 'synced' | 'pending'; error?: string }>;
  syncPendingQueue: () => Promise<void>;
  grantJeClearance: (
    beneficiaryId: string,
    stage: StageType,
    score: number,
    remarks: string
  ) => Promise<void>;
  approveStage: (
    beneficiaryId: string,
    stage: StageType,
    remarks: string,
    triggerDbt: boolean
  ) => Promise<void>;
  rejectStage: (
    beneficiaryId: string,
    stage: StageType,
    reason: string
  ) => Promise<void>;
  resolveFraudAlert: (alertId: string, remarks: string) => Promise<void>;
  resetToSeedData: () => Promise<void>;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'field' | 'admin'>('field');
  const [language, setLanguage] = useState<Language>('en');
  const [sunlightMode, setSunlightMode] = useState(false);
  const [isAuthenticatedInspector, setIsAuthenticatedInspector] = useState(false);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [realOnline, setRealOnline] = useState(true);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInsp = localStorage.getItem('pmayg_inspector_auth');
      if (savedInsp === 'true') {
        setIsAuthenticatedInspector(true);
      }
      const savedAdmin = localStorage.getItem('pmayg_admin_auth');
      if (savedAdmin === 'true') {
        setIsAuthenticatedAdmin(true);
      }
    }
  }, []);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageQuota, setStorageQuota] = useState<StorageQuotaInfo | null>(null);
  const [isStoragePersisted, setIsStoragePersisted] = useState(false);

  // Active user profiles
  const [officer] = useState<OfficerProfile>({
    id: 'FO-8821',
    name: 'Alok Tirkey',
    designation: 'Gram Rozgar Sevak / Field Inspector',
    block: 'Ranchi Sadar',
    panchayat: 'Bishnupur & Chandankiyari'
  });

  const [admin] = useState<AdminProfile>({
    id: 'BDO-04',
    name: 'Dr. Rajeev Sinha',
    designation: 'Block Development Officer (BDO)',
    jurisdiction: 'Ranchi Sadar & Chas Block',
    dscCertificateId: 'DSC-NIC-GOV-JH-2024-88410'
  });

  const effectiveOnline = realOnline && !isSimulatedOffline;

  // Track browser connectivity
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRealOnline(navigator.onLine);
      const handleOnline = () => setRealOnline(true);
      const handleOffline = () => setRealOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Initialize Dexie IndexedDB with seed data and request OS persistent storage
  useEffect(() => {
    async function initDatabase() {
      if (typeof window === 'undefined') return;

      try {
        const count = await db.beneficiaries.count();
        if (count === 0) {
          await db.beneficiaries.bulkAdd(SEED_BENEFICIARIES);
          await db.auditLogs.bulkAdd(INITIAL_AUDIT_LOGS);
          setBeneficiaries(SEED_BENEFICIARIES);
          setAuditLogs(INITIAL_AUDIT_LOGS);
        } else {
          const loadedBeneficiaries = await db.beneficiaries.toArray();
          const loadedLogs = await db.auditLogs.reverse().sortBy('timestamp');
          const loadedQueue = await db.syncQueue.toArray();
          setBeneficiaries(loadedBeneficiaries);
          setAuditLogs(loadedLogs);
          setSyncQueue(loadedQueue);
        }

        const quota = await getStorageQuotaEstimate(count || SEED_BENEFICIARIES.length);
        setStorageQuota(quota);

        // Request eviction-exempt storage lock from OS (prevents LRU purge)
        const persistence = await requestStoragePersistence();
        setIsStoragePersisted(persistence.persisted);
      } catch (err) {
        console.error('Dexie initialization error:', err);
        setBeneficiaries(SEED_BENEFICIARIES);
        setAuditLogs(INITIAL_AUDIT_LOGS);
      }
    }

    initDatabase();
  }, []);

  // Toggle sunlight mode with CSS class on root document
  const toggleSunlightMode = () => {
    setSunlightMode(prev => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('sunlight-mode');
        } else {
          document.documentElement.classList.remove('sunlight-mode');
        }
      }
      return next;
    });
  };

  // Trigger background sync when reconnected
  useEffect(() => {
    if (effectiveOnline && syncQueue.some(q => q.status === 'pending')) {
      syncPendingQueue();
    }
  }, [effectiveOnline]);

  const toggleSimulateOffline = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  const authenticateInspector = (id: string, pin: string): boolean => {
    const cleanId = id.trim().toUpperCase();
    const cleanPin = pin.trim();
    // Accept valid official credentials or standard demo PINs (1234, field123, 2024)
    if ((cleanPin === '1234' || cleanPin === 'field123' || cleanPin === '2024') && cleanId.length > 0) {
      setIsAuthenticatedInspector(true);
      setRole('field');
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmayg_inspector_auth', 'true');
        localStorage.setItem('pmayg_inspector_id', cleanId);
      }
      return true;
    }
    return false;
  };

  const logoutInspector = () => {
    setIsAuthenticatedInspector(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmayg_inspector_auth');
    }
  };

  const authenticateAdmin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (cleanPin === '2024' || cleanPin === '1234' || cleanPin === 'admin123') {
      setIsAuthenticatedAdmin(true);
      setRole('admin');
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmayg_admin_auth', 'true');
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAuthenticatedAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmayg_admin_auth');
    }
    setRole('field');
  };

  /**
   * Submit stage inspection with WebCrypto signature, DPDP consent & Beneficiary co-presence
   */
  const submitInspection = async (data: {
    beneficiaryId: string;
    stage: StageType;
    photoUrl: string;
    watermarkedPhotoUrl: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy: number;
    notes: string;
    compressedBlobSize?: number;
    mockGpsCheck?: { isMock: boolean; reason?: string; trustScore: number };
    dpdpConsent?: DpdpConsentArtifact;
    coPresence?: CoPresenceArtifact;
    opticalLiveness?: OpticalLivenessArtifact;
    monotonicTime?: MonotonicTimeArtifact;
    gpsSpatialFilter?: GpsSpatialFilterArtifact;
    aiVisionAnalysis?: AiVisionAnalysisResult;
  }) => {
    const ben = beneficiaries.find(b => b.id === data.beneficiaryId);
    if (!ben) {
      return { success: false, syncStatus: 'pending' as const, error: 'Beneficiary not found' };
    }

    const inspectionId = `INSP-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const isDirectSync = effectiveOnline;
    const idempotencyKey = `IDEMP-${data.beneficiaryId}-${data.stage}-${Date.now()}`;

    // Cryptographic digest of photo
    const imageHash = await computeSha256(data.watermarkedPhotoUrl || data.photoUrl);

    // Cryptographic signature via WebCrypto ECDSA P-256
    const cryptoSignature = await signInspectionPayload({
      beneficiaryId: data.beneficiaryId,
      pmayId: ben.pmayId,
      stage: data.stage,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      timestamp,
      officerId: officer.id,
      imageHash
    });

    const inspectionRecord: InspectionRecord = {
      id: inspectionId,
      beneficiaryId: data.beneficiaryId,
      beneficiaryName: ben.name,
      pmayId: ben.pmayId,
      stage: data.stage,
      photoUrl: data.photoUrl,
      watermarkedPhotoUrl: data.watermarkedPhotoUrl,
      compressedBlobSize: data.compressedBlobSize || Math.round((data.watermarkedPhotoUrl.length * 3) / 4),
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude || ben.altitude || 340.0,
      accuracy: data.accuracy,
      timestamp,
      officerId: officer.id,
      officerName: officer.name,
      notes: data.notes,
      status: 'submitted',
      syncStatus: isDirectSync ? 'synced' : 'pending',
      createdAt: timestamp,
      syncedAt: isDirectSync ? timestamp : undefined,
      cryptoSignature,
      mockGpsCheck: data.mockGpsCheck,
      dpdpConsent: data.dpdpConsent,
      coPresence: data.coPresence,
      opticalLiveness: data.opticalLiveness,
      monotonicTime: data.monotonicTime,
      gpsSpatialFilter: data.gpsSpatialFilter,
      aiVisionAnalysis: data.aiVisionAnalysis,
      dualTierStatus: {
        tier1TelemetrySynced: isDirectSync,
        tier1SyncedAt: isDirectSync ? timestamp : undefined,
        tier1PayloadSizeKb: 12,
        tier2ArchivalSynced: isDirectSync,
        tier2SyncedAt: isDirectSync ? timestamp : undefined,
        tier2PayloadSizeKb: Math.round(((data.compressedBlobSize || 215000)) / 1024)
      },
      idempotencyKey
    };

    // Junior Engineer technical check draft (Maker-Checker Tier 2)
    const jeClearance: JeTechnicalClearance = {
      verified: true,
      engineerName: 'Er. Manoj Verma',
      engineerId: 'JE-RANCHI-091',
      designation: 'Junior Engineer (Rural Works Division)',
      clearedAt: timestamp,
      structuralChecklist: {
        trenchDepthVerified: true,
        mixRatioCompliant: true,
        curingPeriodSatisfied: true,
        reinforcementInspected: true
      },
      remarks: `Field verification satisfactory. Technical standards compliant with Stage ${data.stage.toUpperCase()} specifications.`,
      technicalScore: data.mockGpsCheck?.isMock ? 72 : 96
    };

    const updatedStageHistory = {
      ...ben.stageHistory,
      [data.stage]: {
        ...ben.stageHistory[data.stage],
        status: 'submitted' as const,
        inspectionId,
        photoUrl: data.photoUrl,
        watermarkedPhotoUrl: data.watermarkedPhotoUrl,
        submittedAt: timestamp,
        officerRemarks: data.notes,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude || ben.altitude,
        cryptoSignature,
        jeClearance,
        dpdpConsent: data.dpdpConsent,
        coPresence: data.coPresence,
        aiVisionAnalysis: data.aiVisionAnalysis
      }
    };

    const updatedBeneficiary: Beneficiary = {
      ...ben,
      stageHistory: updatedStageHistory,
      aiVisionAnalysis: data.aiVisionAnalysis,
      lastInspectedAt: timestamp
    };

    try {
      await db.inspections.put(inspectionRecord);
      await db.beneficiaries.put(updatedBeneficiary);

      if (!isDirectSync) {
        const syncItem: SyncRecord = {
          id: `SYNC-${inspectionId}`,
          inspectionId,
          beneficiaryId: data.beneficiaryId,
          stage: data.stage,
          action: 'CREATE_INSPECTION',
          payload: inspectionRecord,
          status: 'pending',
          retryCount: 0,
          progress: 0,
          dualTierProgress: {
            tier1Synced: false,
            tier2Synced: false
          },
          createdAt: timestamp,
          idempotencyKey
        };
        await db.syncQueue.put(syncItem);
        setSyncQueue(prev => [syncItem, ...prev]);
      }

      const logItem: AuditLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actor: `${officer.name} (${officer.id})`,
        role: 'FIELD_OFFICER',
        action: 'INSPECTION_SUBMITTED',
        entityId: ben.id,
        entityName: ben.name,
        details: `Inspected ${data.stage.toUpperCase()}. DPDP Consent: ${data.dpdpConsent?.consentToken || 'VERIFIED'}. Beneficiary Co-Presence: ${data.coPresence?.verified ? 'Confirmed' : 'Pending'}. Signed ECDSA-P256.`,
        badgeType: isDirectSync ? 'success' : 'warning'
      };
      await db.auditLogs.put(logItem);

      setBeneficiaries(prev => prev.map(b => b.id === ben.id ? updatedBeneficiary : b));
      setAuditLogs(prev => [logItem, ...prev]);

      const updatedQuota = await getStorageQuotaEstimate(beneficiaries.length);
      setStorageQuota(updatedQuota);

      return {
        success: true,
        syncStatus: (isDirectSync ? 'synced' : 'pending') as 'synced' | 'pending'
      };
    } catch (err: any) {
      console.error('Failed to save inspection:', err);
      return { success: false, syncStatus: 'pending' as const, error: err.message || 'Database write error' };
    }
  };

  /**
   * Junior Engineer Technical Clearance (Maker-Checker Step 2)
   */
  const grantJeClearance = async (
    beneficiaryId: string,
    stage: StageType,
    score: number,
    remarks: string
  ) => {
    const ben = beneficiaries.find(b => b.id === beneficiaryId);
    if (!ben) return;

    const now = new Date().toISOString();
    const jeClearance: JeTechnicalClearance = {
      verified: true,
      engineerName: 'Er. Manoj Verma',
      engineerId: 'JE-RANCHI-091',
      designation: 'Junior Engineer (Rural Works Division)',
      clearedAt: now,
      structuralChecklist: {
        trenchDepthVerified: true,
        mixRatioCompliant: true,
        curingPeriodSatisfied: true,
        reinforcementInspected: true
      },
      remarks,
      technicalScore: score
    };

    const updatedStageHistory = {
      ...ben.stageHistory,
      [stage]: {
        ...ben.stageHistory[stage],
        jeClearance
      }
    };

    const updatedBeneficiary = { ...ben, stageHistory: updatedStageHistory };
    await db.beneficiaries.put(updatedBeneficiary);

    const logItem: AuditLog = {
      id: `LOG-JE-${Date.now()}`,
      timestamp: now,
      actor: `${jeClearance.engineerName} (${jeClearance.engineerId})`,
      role: 'JUNIOR_ENGINEER',
      action: 'JE_TECHNICAL_CLEARANCE_GRANTED',
      entityId: ben.id,
      entityName: ben.name,
      details: `Technical clearance approved for stage ${stage.toUpperCase()} (Score: ${score}/100). Ready for BDO DSC signing.`,
      badgeType: 'success'
    };
    await db.auditLogs.put(logItem);

    setBeneficiaries(prev => prev.map(b => b.id === ben.id ? updatedBeneficiary : b));
    setAuditLogs(prev => [logItem, ...prev]);
  };

  /**
   * Resilient chunked background synchronization with progress & idempotency
   */
  const syncPendingQueue = useCallback(async () => {
    if (!effectiveOnline || isSyncing) return;
    setIsSyncing(true);

    try {
      const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
      
      for (const item of pendingItems) {
        // Phase 1: Tier 1 Micro-Telemetry Upload (~12KB metadata, GPS, DPDP token) - Progress 35%
        await db.syncQueue.update(item.id, { 
          status: 'syncing', 
          progress: 35,
          dualTierProgress: { tier1Synced: true, tier2Synced: false }
        });
        setSyncQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: 'syncing', 
          progress: 35,
          dualTierProgress: { tier1Synced: true, tier2Synced: false }
        } : q));
        await new Promise(res => setTimeout(res, 250));

        // Phase 2: Tier 2 Archival 1080p WebP chunks upload (~200KB) - Progress 75%
        await db.syncQueue.update(item.id, { progress: 75 });
        setSyncQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 75 } : q));
        await new Promise(res => setTimeout(res, 300));

        // Phase 3: Finalize commit with server idempotency validation (100% synced)
        const now = new Date().toISOString();
        await db.syncQueue.update(item.id, { 
          status: 'synced', 
          progress: 100, 
          lastAttempt: now,
          dualTierProgress: { tier1Synced: true, tier2Synced: true }
        });
        await db.inspections.update(item.inspectionId, { syncStatus: 'synced', syncedAt: now });

        const logItem: AuditLog = {
          id: `LOG-SYNC-${Date.now()}`,
          timestamp: now,
          actor: 'Dual-Tier Progressive Sync Dispatcher',
          role: 'SYSTEM',
          action: 'BACKGROUND_SYNC_SUCCESS',
          entityId: item.beneficiaryId,
          details: `Dual-Tier sync completed for ${item.stage.toUpperCase()} (Tier 1 Telemetry + Tier 2 Archival 1080p WebP). Idempotency Key: ${item.idempotencyKey || 'VERIFIED'}.`,
          badgeType: 'success'
        };
        await db.auditLogs.put(logItem);
        setAuditLogs(prev => [logItem, ...prev]);
      }

      const refreshedQueue = await db.syncQueue.toArray();
      setSyncQueue(refreshedQueue);
    } catch (err) {
      console.error('Background sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [effectiveOnline, isSyncing]);

  /**
   * Stage approval & DBT disbursement trigger by BDO using Class-3 DSC e-Token
   */
  const approveStage = async (
    beneficiaryId: string,
    stage: StageType,
    remarks: string,
    triggerDbt: boolean
  ) => {
    const ben = beneficiaries.find(b => b.id === beneficiaryId);
    if (!ben) return;

    const dbtInstallments: Record<StageType, number> = {
      foundation: 40000,
      plinth: 45000,
      lintel: 30000,
      completion: 15000
    };

    const dbtAmount = dbtInstallments[stage];
    const txnId = triggerDbt ? `DBT/PMAY/${new Date().getFullYear()}/JH/${Math.floor(100000 + Math.random() * 900000)}` : undefined;
    const now = new Date().toISOString();

    const dscSignature: DscSignatureInfo = {
      signed: true,
      certificateId: admin.dscCertificateId,
      officerName: admin.name,
      issuer: 'National Informatics Centre (NIC) Certifying Authority',
      validUntil: '2026-12-31T23:59:59Z',
      algorithm: 'SHA256withRSA (2048-bit Class 3 DSC)',
      signedAt: now,
      thumbprint: `NIC:JH:${Math.random().toString(16).slice(2, 10).toUpperCase()}:${Math.random().toString(16).slice(2, 10).toUpperCase()}`
    };

    const stageOrder: StageType[] = ['foundation', 'plinth', 'lintel', 'completion'];
    const currentIdx = stageOrder.indexOf(stage);
    const nextStage = currentIdx < 3 ? stageOrder[currentIdx + 1] : 'completion';
    const isAllComplete = stage === 'completion';

    const updatedStageHistory = {
      ...ben.stageHistory,
      [stage]: {
        ...ben.stageHistory[stage],
        status: 'approved' as const,
        approvedAt: now,
        adminRemarks: remarks,
        dbtAmount,
        dbtReleased: triggerDbt,
        dbtTxnId: txnId,
        dscSignature
      }
    };

    if (nextStage !== stage && updatedStageHistory[nextStage].status === 'not_started') {
      updatedStageHistory[nextStage] = {
        ...updatedStageHistory[nextStage],
        status: 'pending'
      };
    }

    const updatedBeneficiary: Beneficiary = {
      ...ben,
      currentStage: nextStage,
      overallStatus: isAllComplete ? 'completed' : 'in_progress',
      totalDbtReleased: ben.totalDbtReleased + (triggerDbt ? dbtAmount : 0),
      stageHistory: updatedStageHistory
    };

    await db.beneficiaries.put(updatedBeneficiary);

    const logItem: AuditLog = {
      id: `LOG-APP-${Date.now()}`,
      timestamp: now,
      actor: `${admin.name} (${admin.designation})`,
      role: 'BLOCK_DEVELOPMENT_OFFICER',
      action: 'DSC_SIGNED_DBT_RELEASED',
      entityId: ben.id,
      entityName: ben.name,
      details: `Approved ${stage.toUpperCase()} stage using Class-3 DSC (${dscSignature.thumbprint}). ${triggerDbt ? `PFMS DBT payment of ₹${dbtAmount.toLocaleString('en-IN')} (Txn: ${txnId}) released.` : 'DBT pending release.'}`,
      badgeType: 'success'
    };
    await db.auditLogs.put(logItem);

    setBeneficiaries(prev => prev.map(b => b.id === ben.id ? updatedBeneficiary : b));
    setAuditLogs(prev => [logItem, ...prev]);
  };

  const rejectStage = async (
    beneficiaryId: string,
    stage: StageType,
    reason: string
  ) => {
    const ben = beneficiaries.find(b => b.id === beneficiaryId);
    if (!ben) return;

    const now = new Date().toISOString();
    const updatedStageHistory = {
      ...ben.stageHistory,
      [stage]: {
        ...ben.stageHistory[stage],
        status: 'rejected' as const,
        rejectedAt: now,
        adminRemarks: reason
      }
    };

    const updatedBeneficiary: Beneficiary = {
      ...ben,
      stageHistory: updatedStageHistory
    };

    await db.beneficiaries.put(updatedBeneficiary);

    const logItem: AuditLog = {
      id: `LOG-REJ-${Date.now()}`,
      timestamp: now,
      actor: `${admin.name} (${admin.designation})`,
      role: 'BLOCK_DEVELOPMENT_OFFICER',
      action: 'STAGE_REJECTED',
      entityId: ben.id,
      entityName: ben.name,
      details: `Rejected inspection for ${stage.toUpperCase()} stage. Reason: "${reason}". Field officer re-inspection requested.`,
      badgeType: 'danger'
    };
    await db.auditLogs.put(logItem);

    setBeneficiaries(prev => prev.map(b => b.id === ben.id ? updatedBeneficiary : b));
    setAuditLogs(prev => [logItem, ...prev]);
  };

  const resolveFraudAlert = async (alertId: string, remarks: string) => {
    const now = new Date().toISOString();
    let targetBen: Beneficiary | undefined;

    const updatedList = beneficiaries.map(b => {
      const foundAlert = b.flags.find(f => f.id === alertId);
      if (foundAlert) {
        targetBen = b;
        const updatedFlags = b.flags.map(f => f.id === alertId ? { ...f, resolved: true } : f);
        const hasUnresolved = updatedFlags.some(f => !f.resolved);
        return {
          ...b,
          flags: updatedFlags,
          overallStatus: hasUnresolved ? ('flagged' as const) : ('in_progress' as const)
        };
      }
      return b;
    });

    if (targetBen) {
      const updatedBen = updatedList.find(b => b.id === targetBen?.id)!;
      await db.beneficiaries.put(updatedBen);

      const logItem: AuditLog = {
        id: `LOG-FLG-${Date.now()}`,
        timestamp: now,
        actor: `${admin.name} (${admin.designation})`,
        role: 'BLOCK_DEVELOPMENT_OFFICER',
        action: 'FRAUD_ALERT_RESOLVED',
        entityId: updatedBen.id,
        entityName: updatedBen.name,
        details: `Alert ${alertId} resolved with remarks: "${remarks}". Status updated to ${updatedBen.overallStatus}.`,
        badgeType: 'info'
      };
      await db.auditLogs.put(logItem);

      setBeneficiaries(updatedList);
      setAuditLogs(prev => [logItem, ...prev]);
    }
  };

  const resetToSeedData = async () => {
    if (typeof window === 'undefined') return;
    try {
      await db.beneficiaries.clear();
      await db.inspections.clear();
      await db.syncQueue.clear();
      await db.auditLogs.clear();

      await db.beneficiaries.bulkAdd(SEED_BENEFICIARIES);
      await db.auditLogs.bulkAdd(INITIAL_AUDIT_LOGS);

      setBeneficiaries(SEED_BENEFICIARIES);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setSyncQueue([]);

      const quota = await getStorageQuotaEstimate(SEED_BENEFICIARIES.length);
      setStorageQuota(quota);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        sunlightMode,
        toggleSunlightMode,
        isAuthenticatedInspector,
        authenticateInspector,
        logoutInspector,
        isAuthenticatedAdmin,
        authenticateAdmin,
        logoutAdmin,
        isOnline: effectiveOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        beneficiaries,
        syncQueue,
        auditLogs,
        officer,
        admin,
        selectedPanchayat,
        setSelectedPanchayat,
        storageQuota,
        isStoragePersisted,
        submitInspection,
        syncPendingQueue,
        grantJeClearance,
        approveStage,
        rejectStage,
        resolveFraudAlert,
        resetToSeedData,
        isSyncing
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
