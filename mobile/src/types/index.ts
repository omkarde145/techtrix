export type StageType = 'registration' | 'foundation' | 'plinth' | 'lintel' | 'roof' | 'completed';

export type StageStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  fatherHusbandName: string;
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  currentStage: StageType;
  sanctionAmount: number;
  disbursedAmount: number;
  targetCoordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  rationCardNumber: string;
  bankAccountMasked: string;
  ifscCode: string;
}

export interface InspectionPayload {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  stage: StageType;
  timestamp: string;
  coordinates: GeoCoordinates;
  spatialDistanceMeters: number;
  opticalLivenessPassed: boolean;
  deviceTiltAngle: number;
  aiClassification: {
    predictedStage: StageType;
    confidence: number;
    matchesExpected: boolean;
  };
  watermarkSignature: string;
  imageUri: string;
  notes?: string;
  synced: boolean;
}

export type UserRole = 'inspector' | 'admin' | 'citizen';
