export type StageType = 'foundation' | 'plinth' | 'lintel' | 'completion';

export type StageStatus = 'not_started' | 'pending' | 'submitted' | 'approved' | 'rejected';

export type BeneficiaryStatus = 'eligible' | 'in_progress' | 'completed' | 'flagged' | 'rejected';

export type FraudSeverity = 'high' | 'medium' | 'low';

export type FraudType = 
  | 'geo_collision' 
  | 'duplicate_ration_card' 
  | 'ineligible_member' 
  | 'prior_scheme_disbursement'
  | 'exif_gps_mismatch'
  | 'dense_abadi_partition'
  | 'mock_gps_detected';

export interface PanchayatDevelopmentWork {
  id: string;
  workCode: string;
  title: string;
  category: 'Civic Infrastructure' | 'Water & Sanitation' | 'Rural Connectivity' | 'Anganwadi & Education';
  scheme: '15th Finance Commission' | 'MGNREGS Convergence' | 'District Mineral Foundation (DMFT)';
  village: string;
  gramPanchayat: string;
  sanctionedCost: number;
  fundsDisbursed: number;
  executingAgency: string;
  currentStage: 'Layout & Site Clearing' | 'Substructure & Foundation' | 'Superstructure Masonry' | 'Commissioned & Handed Over';
  physicalProgressPercent: number;
  financialProgressPercent: number;
  latitude: number;
  longitude: number;
  status: 'in_progress' | 'completed' | 'inspection_pending';
  lastInspectedAt: string;
  photoUrl: string;
}

export interface JeTechnicalClearance {
  verified: boolean;
  engineerName: string;
  engineerId: string;
  designation: string;
  clearedAt: string;
  structuralChecklist: {
    trenchDepthVerified: boolean;
    mixRatioCompliant: boolean;
    curingPeriodSatisfied: boolean;
    reinforcementInspected: boolean;
  };
  remarks: string;
  technicalScore: number;
}

export interface DscSignatureInfo {
  signed: boolean;
  certificateId: string;
  officerName: string;
  issuer: string;
  validUntil: string;
  algorithm: string;
  signedAt: string;
  thumbprint: string;
}

export interface DeviceCryptoSignature {
  signature: string;
  publicKey: string;
  algorithm: string;
  signedPayloadHash: string;
  imageHash: string;
  timestamp: string;
  deviceModel?: string;
}

export interface DpdpConsentArtifact {
  consented: boolean;
  citizenName: string;
  pmayId: string;
  timestamp: string;
  language: 'hi' | 'en';
  consentToken: string;
  purpose: string;
}

export interface CoPresenceArtifact {
  verified: boolean;
  faceDetected: boolean;
  stagePlaquePresent: boolean;
  evidenceConfidence: number;
  notes: string;
}

export interface OpticalLivenessArtifact {
  verified: boolean;
  score: number; // 0 - 100
  tiltDeltaDegrees: number;
  gyroMotionDetected: boolean;
  is2dScreenReplaySuspected: boolean;
  reason?: string;
}

export interface MonotonicTimeArtifact {
  monotonicElapsedMs: number;
  systemTimestamp: string;
  gpsEpochTimestamp?: string;
  driftSeconds: number;
  isClockTampered: boolean;
  hardwareTickSequence: number;
}

export interface GpsSpatialFilterArtifact {
  sampleCount: number;
  samples: Array<{ lat: number; lng: number; altitude?: number; accuracy: number; timestamp: number }>;
  centroid: { lat: number; lng: number; altitude?: number };
  stdDevMeters: number;
  hdop: number;
  cep50Meters: number;
  isStabilized: boolean;
}

export interface PfmsBeneficiaryEntry {
  pmayId: string;
  beneficiaryName: string;
  village: string;
  gramPanchayat: string;
  bankAccountMasked: string;
  bankIfsc: string;
  instalmentStage: StageType;
  instalmentAmount: number;
  apbsMandateToken: string;
  dscApprovalHash: string;
}

export interface PfmsFtoBatch {
  ftoNumber: string;
  financialYear: string;
  stateCode: string;
  districtCode: string;
  blockCode: string;
  panchayatCode: string;
  schemeCode: 'PMAYG-RURAL';
  generatedAt: string;
  generatedByOfficer: string;
  officerDesignation: string;
  totalBeneficiaries: number;
  totalDisbursementAmount: number;
  beneficiaries: PfmsBeneficiaryEntry[];
  dscSignatureDigest: string;
  batchXmlPayload: string;
  status: 'GENERATED' | 'TRANSMITTED_TO_PFMS' | 'SETTLED_BY_APBS';
}

export interface DualTierUploadStatus {
  tier1TelemetrySynced: boolean;
  tier1SyncedAt?: string;
  tier1PayloadSizeKb: number;
  tier2ArchivalSynced: boolean;
  tier2SyncedAt?: string;
  tier2PayloadSizeKb: number;
}

export interface StageData {
  status: StageStatus;
  inspectionId?: string;
  photoUrl?: string;
  watermarkedPhotoUrl?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  dbtAmount?: number;
  dbtReleased?: boolean;
  dbtTxnId?: string;
  officerRemarks?: string;
  adminRemarks?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  jeClearance?: JeTechnicalClearance;
  dscSignature?: DscSignatureInfo;
  cryptoSignature?: DeviceCryptoSignature;
  dpdpConsent?: DpdpConsentArtifact;
  coPresence?: CoPresenceArtifact;
}

export interface FraudAlert {
  id: string;
  type: FraudType;
  severity: FraudSeverity;
  title: string;
  description: string;
  beneficiaryId: string;
  beneficiaryName: string;
  collidingBeneficiaryId?: string;
  collidingBeneficiaryName?: string;
  coordinates?: { lat: number; lng: number; altitude?: number };
  distanceMeters?: number;
  horizontalDistance?: number;
  elevationDeltaMeters?: number;
  rationCardNo?: string;
  khasraNo?: string;
  resolved: boolean;
  timestamp: string;
  evidence?: {
    claimedCoords?: { lat: number; lng: number; altitude?: number };
    collidingCoords?: { lat: number; lng: number; altitude?: number };
    photoExifCoords?: { lat: number; lng: number };
    deviceCoords?: { lat: number; lng: number };
    isDenseBastiPartition?: boolean;
    partitionNotes?: string;
  };
}

export interface Beneficiary {
  id: string;
  pmayId: string;
  name: string;
  guardianName: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'SC' | 'ST' | 'OBC' | 'General' | 'Minority';
  rationCardNo: string;
  familyMemberId: string;
  annualIncome: number;
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  sanctionedDate: string;
  sanctionedAmount: number;
  totalDbtReleased: number;
  currentStage: StageType;
  overallStatus: BeneficiaryStatus;
  latitude: number;
  longitude: number;
  altitude?: number;
  khasraNo?: string;
  ulpin?: string;
  targetAddress: string;
  contactNumber: string;
  bankAccountMasked: string;
  bankIfsc: string;
  stageHistory: Record<StageType, StageData>;
  flags: FraudAlert[];
  lastInspectedAt?: string;
  convergence?: ConvergenceMatrix;
  satelliteVerification?: SatelliteMacroVerification;
  aiVisionAnalysis?: AiVisionAnalysisResult;
  monsoonRisk?: MonsoonRiskAssessment;
  cbdcVouchers?: DigitalRupeeCbdcBatch[];
}

export interface InspectionRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  pmayId: string;
  stage: StageType;
  photoUrl: string;
  watermarkedPhotoUrl: string;
  compressedBlobSize?: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: string;
  officerId: string;
  officerName: string;
  notes: string;
  status: StageStatus;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  rejectionReason?: string;
  dbtReleased?: boolean;
  dbtAmount?: number;
  dbtTransactionId?: string;
  createdAt: string;
  syncedAt?: string;
  retryCount?: number;
  deviceInfo?: string;
  cryptoSignature?: DeviceCryptoSignature;
  mockGpsCheck?: {
    isMock: boolean;
    reason?: string;
    trustScore: number;
  };
  dpdpConsent?: DpdpConsentArtifact;
  coPresence?: CoPresenceArtifact;
  opticalLiveness?: OpticalLivenessArtifact;
  monotonicTime?: MonotonicTimeArtifact;
  gpsSpatialFilter?: GpsSpatialFilterArtifact;
  dualTierStatus?: DualTierUploadStatus;
  idempotencyKey?: string;
}

export interface SyncRecord {
  id: string;
  inspectionId: string;
  beneficiaryId: string;
  stage: StageType;
  action: 'CREATE_INSPECTION' | 'UPDATE_STAGE' | 'DBT_DISBURSEMENT';
  payload: InspectionRecord;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  progress?: number; // 0 to 100 for chunked sync
  dualTierProgress?: {
    tier1Synced: boolean;
    tier2Synced: boolean;
  };
  lastAttempt?: string;
  errorMessage?: string;
  createdAt: string;
  idempotencyKey?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: 'FIELD_OFFICER' | 'JUNIOR_ENGINEER' | 'BLOCK_DEVELOPMENT_OFFICER' | 'GRAM_PANCHAYAT_SECRETARY' | 'SYSTEM';
  action: string;
  entityId: string;
  entityName?: string;
  details: string;
  badgeType?: 'info' | 'success' | 'warning' | 'danger';
}

export interface WatermarkOptions {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: string;
  stage: StageType;
  officerId: string;
  officerName: string;
  pmayId: string;
  beneficiaryName: string;
  gramPanchayat: string;
  cryptoHash?: string;
  ulpin?: string;
  beneficiaryCoPresenceVerified?: boolean;
}

export interface GeofenceResult {
  hasConflict: boolean;
  isDenseBastiPartition?: boolean;
  collidingBeneficiary?: Beneficiary;
  distanceMeters?: number;
  horizontalDistance?: number;
  elevationDeltaMeters?: number;
  warningMessage?: string;
}

export interface DuplicateRationResult {
  hasDuplicate: boolean;
  collidingBeneficiary?: Beneficiary;
  rationCardNo?: string;
}

export interface StorageQuotaInfo {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  inspectionCount: number;
  formattedUsage: string;
  formattedQuota: string;
}

// ==========================================
// 8 STANDOUT GOVTECH ADVANCED CAPABILITIES
// ==========================================

// 1. Edge AI Stage & Structural Vision Analysis
export interface AiVisionAnalysisResult {
  detectedStage: StageType;
  confidencePercent: number;
  structuralChecklist: {
    rebarDetected: boolean;
    brickMasonryDetected: boolean;
    curedConcreteBeamDetected: boolean;
    roofSlabDetected: boolean;
  };
  clarityScore: number; // 0 to 100
  isBlurry: boolean;
  glareDetected: boolean;
  analysisSummary: string;
}

// 2. ISRO Bhuvan / Sentinel-2 Satellite Remote Sensing
export interface SatelliteMacroVerification {
  parcelId: string;
  satelliteProvider: 'ISRO Bhuvan' | 'Sentinel-2 SAR';
  preSanctionNdvi: number; // e.g. 0.58 (vegetation)
  postSanctionNdvi: number; // e.g. 0.18 (built-up clearance)
  radarBackscatterDeltaDb: number; // e.g. +4.2 dB (hard surface reflection)
  physicalStructureDetected: boolean;
  confidenceScore: number; // 0 to 100
  lastOverpassDate: string;
  imageryUrl: string;
}

// 3. Bhashini Multilingual Speech & Voice Dispatch
export interface BhashiniVoiceDispatch {
  beneficiaryId: string;
  language: 'hi' | 'bho' | 'or' | 'bn' | 'te' | 'mr' | 'en';
  audioNotificationText: string;
  audioDispatchUrl?: string;
  sentTimestamp: string;
  status: 'SENT' | 'DELIVERED' | 'PLAYED';
}

// 4. Beneficiary Co-Presence & Plaque OCR
export interface PlaqueOcrResult {
  plaqueDetected: boolean;
  extractedPmayId?: string;
  extractedName?: string;
  matchScore: number;
  beneficiaryFaceDetected: boolean;
  coPresenceScore: number;
  verificationPassed: boolean;
  notes: string;
}

// 5. IMD Monsoon Hazard Early-Warning
export interface MonsoonRiskAssessment {
  blockName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  daysUntilMonsoonArrival: number;
  expectedRainfallMm: number;
  vulnerableHousesCount: number;
  urgentActionRequired: string;
  fastTrackDbtEligible: boolean;
}

// 6. Jan Soochna Public Social Audit Report
export interface SocialAuditReport {
  id: string;
  pmayId: string;
  beneficiaryName: string;
  village: string;
  gramPanchayat: string;
  stageReported: StageType;
  citizenName: string;
  citizenMobile: string;
  complaintCategory: 'GHOST_BENEFICIARY' | 'QUALITY_DEFECT' | 'BRIBE_DEMAND' | 'STAGE_MISMATCH' | 'GENERAL_FEEDBACK';
  complaintDescription: string;
  evidencePhotoUrl?: string;
  submittedAt: string;
  status: 'PENDING_INVESTIGATION' | 'VERIFIED_FRAUD' | 'DISMISSED';
}

// 7. Single-Window Scheme Convergence Matrix
export interface ConvergenceMatrix {
  sbmGToiletGeotagged: boolean;
  sbmGIncentiveAmount: number; // ₹12,000
  jalJeevanTapConnected: boolean;
  saubhagyaElectricityMeter: boolean;
  pmSuryaGharSolarEligible: boolean;
  allConvergencesMet: boolean;
}

// 8. Digital Rupee (e₹) Programmable Material DBT
export interface DigitalRupeeCbdcBatch {
  voucherId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  purpose: 'BUILDING_MATERIALS_CEMENT_STEEL';
  designatedVendorList: Array<{ vendorId: string; vendorName: string; category: string; location: string }>;
  qrTokenPayload: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}
