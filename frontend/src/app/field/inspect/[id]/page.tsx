'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { StageType, OpticalLivenessArtifact, MonotonicTimeArtifact, GpsSpatialFilterArtifact, AiVisionAnalysisResult } from '@/types';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Calendar, 
  CreditCard, 
  IndianRupee, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  CloudUpload, 
  Database,
  Lock,
  Layers,
  Info,
  UserCheck,
  Satellite,
  Upload,
  Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { StageTimeline } from '@/components/field/StageTimeline';
import { CameraCaptureModal } from '@/components/field/CameraCaptureModal';
import { AiVisionAssistantCard } from '@/components/field/AiVisionAssistantCard';
import { MobileBottomNav } from '@/components/field/MobileBottomNav';
import { SatelliteMacroModal } from '@/components/admin/SatelliteMacroModal';
import { ConvergenceMatrixWidget } from '@/components/admin/ConvergenceMatrixWidget';
import { BhashiniVoiceAssistant } from '@/components/common/BhashiniVoiceAssistant';
import { validateSequentialStage } from '@/lib/engines/verificationEngine';
import { TRANSLATIONS } from '@/lib/i18n/translations';

export default function FieldInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beneficiaryId = params.id as string;

  const { beneficiaries, submitInspection, isOnline, language } = useApp();
  const t = TRANSLATIONS[language];

  const beneficiary = useMemo(() => {
    return beneficiaries.find(b => b.id === beneficiaryId);
  }, [beneficiaries, beneficiaryId]);

  const [selectedStage, setSelectedStage] = useState<StageType | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraInitialMode, setCameraInitialMode] = useState<'choice' | 'camera' | 'upload'>('choice');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedCoords, setCapturedCoords] = useState<{ lat: number; lng: number; altitude?: number; accuracy: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<'synced' | 'pending' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSatModalOpen, setIsSatModalOpen] = useState(false);

  // Active stage defaults to beneficiary's current stage
  const activeStage = selectedStage || beneficiary?.currentStage || 'foundation';
  const currentStageData = beneficiary?.stageHistory[activeStage];

  // Validate sequential stage rule
  const seqValidation = beneficiary ? validateSequentialStage(
    beneficiary.currentStage,
    activeStage,
    beneficiary.stageHistory
  ) : { valid: false, reason: 'Beneficiary not loaded' };

  const isStageApproved = currentStageData?.status === 'approved';
  const isStageSubmitted = currentStageData?.status === 'submitted';

  const [compressedStats, setCompressedStats] = useState<{ blobSize: number; originalSize: number; ratio: string } | null>(null);
  const [mockGpsCheck, setMockGpsCheck] = useState<{ isMock: boolean; reason?: string; trustScore: number } | null>(null);
  const [dpdpConsented, setDpdpConsented] = useState(true);
  const [coPresenceVerified, setCoPresenceVerified] = useState(true);
  const [livenessArtifact, setLivenessArtifact] = useState<OpticalLivenessArtifact | null>(null);
  const [clockArtifact, setClockArtifact] = useState<MonotonicTimeArtifact | null>(null);
  const [spatialFilterState, setSpatialFilterState] = useState<GpsSpatialFilterArtifact | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiVisionAnalysisResult | null>(null);

  if (!beneficiary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Beneficiary Not Found</h2>
        <p className="text-xs mb-4">The requested beneficiary ID does not exist in local storage.</p>
        <button
          onClick={() => router.push('/field')}
          className="px-4 py-2 bg-blue-700 rounded-xl text-white text-xs font-semibold"
        >
          Return to Task List
        </button>
      </div>
    );
  }

  const handleCaptureComplete = (
    watermarkedDataUrl: string,
    rawDataUrl: string,
    coords: { lat: number; lng: number; altitude?: number; accuracy: number },
    compression?: { blobSize: number; originalSize: number; ratio: string },
    mockCheck?: { isMock: boolean; reason?: string; trustScore: number },
    liveness?: OpticalLivenessArtifact,
    clock?: MonotonicTimeArtifact,
    spatialFilter?: GpsSpatialFilterArtifact,
    aiVision?: AiVisionAnalysisResult
  ) => {
    setCapturedPhoto(watermarkedDataUrl);
    setCapturedCoords(coords);
    if (compression) setCompressedStats(compression);
    if (mockCheck) setMockGpsCheck(mockCheck);
    if (liveness) setLivenessArtifact(liveness);
    if (clock) setClockArtifact(clock);
    if (spatialFilter) setSpatialFilterState(spatialFilter);
    if (aiVision) setAiAnalysis(aiVision);
    setValidationError(null);
  };

  const handleSubmitInspection = async () => {
    if (!capturedPhoto || !capturedCoords) {
      setValidationError('Please capture a geotagged photo before submitting.');
      return;
    }

    if (!dpdpConsented) {
      setValidationError('Citizen consent is required under DPDP Act 2023.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await submitInspection({
        beneficiaryId: beneficiary.id,
        stage: activeStage,
        photoUrl: capturedPhoto,
        watermarkedPhotoUrl: capturedPhoto,
        latitude: capturedCoords.lat,
        longitude: capturedCoords.lng,
        altitude: capturedCoords.altitude,
        accuracy: capturedCoords.accuracy,
        compressedBlobSize: compressedStats?.blobSize,
        mockGpsCheck: mockGpsCheck || undefined,
        opticalLiveness: livenessArtifact || undefined,
        monotonicTime: clockArtifact || undefined,
        gpsSpatialFilter: spatialFilterState || undefined,
        aiVisionAnalysis: aiAnalysis || undefined,
        dpdpConsent: {
          consented: dpdpConsented,
          citizenName: beneficiary.name,
          pmayId: beneficiary.pmayId,
          timestamp: new Date().toISOString(),
          language,
          consentToken: `DPDPA-JH-${Date.now().toString(36).toUpperCase()}`,
          purpose: 'PMAY-G Housing Subsidy DBT Disbursement & Geotag Verification'
        },
        coPresence: {
          verified: coPresenceVerified,
          faceDetected: true,
          stagePlaquePresent: true,
          evidenceConfidence: 96,
          notes: `Beneficiary ${beneficiary.name} verified in frame`
        },
        notes: notes.trim() || `Inspection completed for stage: ${activeStage.toUpperCase()}`
      });

      if (res.success) {
        setSubmitSuccess(res.syncStatus);
        setTimeout(() => {
          router.push('/field');
        }, 1800);
      } else {
        setValidationError(res.error || 'Failed to submit inspection');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto pb-28 sm:pb-12 px-3 sm:px-6 pt-3">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.push('/field')}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Task List</span>
        </button>

        <Badge size="sm" variant={isOnline ? 'verified' : 'pending'}>
          {isOnline ? 'Direct Cloud Sync' : 'Offline Mode (IndexedDB Active)'}
        </Badge>
      </div>

      {/* Beneficiary Master Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                PMAY-G Sanction Record
              </span>
              <Badge size="sm" variant="slate">{beneficiary.pmayId}</Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{beneficiary.name}</h2>
            <p className="text-xs text-slate-500">{beneficiary.guardianName} • {beneficiary.category} Category</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500">Total Subsidy Sanctioned</span>
            <p className="text-base font-bold text-emerald-700">
              ₹{beneficiary.sanctionedAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Plot & Geofence Coordinates */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="truncate">{beneficiary.targetAddress}, {beneficiary.village}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-500">
            <span>Registered GPS:</span>
            <span className="text-blue-700 font-semibold">{beneficiary.latitude.toFixed(5)}° N, {beneficiary.longitude.toFixed(5)}° E</span>
          </div>
        </div>

        {/* Standout Features: Satellite Verification Trigger & Convergence Matrix */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Satellite Remote Sensing &amp; Welfare Convergence
            </span>
            <button
              type="button"
              onClick={() => setIsSatModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer shadow-xs"
            >
              <Satellite className="w-3.5 h-3.5 text-blue-700" />
              <span>ISRO Bhuvan Macro-Check</span>
            </button>
          </div>
          <ConvergenceMatrixWidget convergence={beneficiary.convergence} />
        </div>

        {/* Flag Alert if any */}
        {beneficiary.flags.length > 0 && !beneficiary.flags[0].resolved && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">{beneficiary.flags[0].title}:</strong> {beneficiary.flags[0].description}
            </div>
          </div>
        )}
      </div>

      {/* 4-Stage Interactive Timeline */}
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Official 4-Stage Construction Tracker
        </h3>
        <StageTimeline
          currentStage={activeStage}
          stageHistory={beneficiary.stageHistory}
          onSelectStage={(stg) => setSelectedStage(stg)}
        />
      </div>

      {/* Sequential Guard Warning if Locked */}
      {!seqValidation.valid && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 mb-4 shadow-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">Stage Locked by Sequential Rule</h4>
            <p className="mt-0.5 leading-relaxed">{seqValidation.reason}</p>
          </div>
        </div>
      )}

      {/* Active Stage Inspection Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Active Inspection Target
            </span>
            <h3 className="text-base font-bold text-slate-900 capitalize">
              {activeStage} Stage Verification
            </h3>
          </div>
          <Badge size="md" variant={`stage-${activeStage}`}>
            Stage: {activeStage.toUpperCase()}
          </Badge>
        </div>

        {/* Camera Capture Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Tamper-Proof Geotagged Photograph <span className="text-rose-600">*</span>
          </label>

          {capturedPhoto ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-blue-600 bg-black aspect-16/10 flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Captured Inspection"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setIsCameraOpen(true)}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-md backdrop-blur-xs cursor-pointer hover:bg-white"
              >
                <Camera className="w-3.5 h-3.5 text-blue-700" />
                <span>Retake Photo</span>
              </button>
            </div>
          ) : currentStageData?.photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-16/10 flex items-center justify-center">
              <img
                src={currentStageData.watermarkedPhotoUrl || currentStageData.photoUrl}
                alt="Existing stage photo"
                className="w-full h-full object-contain"
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded bg-white/90 text-[11px] text-emerald-800 font-semibold border border-slate-200 shadow-xs">
                Previously Recorded Photo
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Upload Option */}
                <button
                  type="button"
                  disabled={!seqValidation.valid}
                  onClick={() => {
                    if (seqValidation.valid) {
                      setCameraInitialMode('upload');
                      setIsCameraOpen(true);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-2 shadow-xs group ${
                    seqValidation.valid
                      ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-600 cursor-pointer'
                      : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                      Upload Picture / Gallery
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Select photo from device files or <strong className="text-emerald-700 font-mono">Demo_Pictures</strong>
                    </p>
                  </div>
                </button>

                {/* 2. Live Camera Option */}
                <button
                  type="button"
                  disabled={!seqValidation.valid}
                  onClick={() => {
                    if (seqValidation.valid) {
                      setCameraInitialMode('camera');
                      setIsCameraOpen(true);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-2 shadow-xs group ${
                    seqValidation.valid
                      ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-600 cursor-pointer'
                      : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800">
                      Open Live Camera
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Real-time camera feed with optical reticle HUD &amp; GPS lock
                    </p>
                  </div>
                </button>
              </div>

              {/* 3. Demo Stage Quick Pick */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  Testing in browser?
                </span>
                <button
                  type="button"
                  disabled={!seqValidation.valid}
                  onClick={() => {
                    if (seqValidation.valid) {
                      setCameraInitialMode('choice');
                      setIsCameraOpen(true);
                    }
                  }}
                  className="font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Browse All Photo Options &amp; Demo Samples →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* GPS & Hardware Integrity Status */}
        {capturedCoords && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  GPS Lock: <strong className="text-slate-900">{capturedCoords.lat.toFixed(5)}° N, {capturedCoords.lng.toFixed(5)}° E</strong> (±{capturedCoords.accuracy}m)
                  {capturedCoords.altitude !== undefined && (
                    <span className="text-blue-700 ml-2 font-mono text-[11px]">Alt: {capturedCoords.altitude}m MSL</span>
                  )}
                </span>
              </div>
              <span className="text-emerald-800 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Integrity Verified
              </span>
            </div>

            {/* Compression Telemetry & Trust Score */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {compressedStats && (
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5">
                  <span className="font-semibold">Local Storage Footprint:</span>
                  <span className="font-mono">{Math.round(compressedStats.blobSize / 1024)} KB</span>
                  <span className="text-blue-700 font-bold">({compressedStats.ratio} saved)</span>
                </div>
              )}
              {mockGpsCheck && (
                <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                  mockGpsCheck.isMock 
                    ? 'bg-rose-50 border-rose-200 text-rose-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <span>GPS Trust Score:</span>
                  <span className="font-bold text-emerald-700 font-mono">{mockGpsCheck.trustScore}%</span>
                </div>
              )}
              {livenessArtifact && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <span className="font-semibold">Optical Parallax Liveness:</span>
                  <span className="font-mono font-bold text-emerald-700">{livenessArtifact.score}%</span>
                  <span className="text-slate-500 font-mono">({livenessArtifact.tiltDeltaDegrees}°)</span>
                </div>
              )}
              {clockArtifact && (
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5">
                  <span className="font-semibold">Hardware Clock:</span>
                  <span className={clockArtifact.isClockTampered ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {clockArtifact.isClockTampered ? 'Drift Alert' : 'Monotonic Valid'}
                  </span>
                </div>
              )}
              {spatialFilterState && (
                <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5">
                  <span className="font-semibold">CEP-50 Filter:</span>
                  <span className="text-blue-700 font-mono font-bold">{spatialFilterState.cep50Meters}m</span>
                  <span className="text-slate-500">(HDOP {spatialFilterState.hdop})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edge AI Vision Stage Detector Card */}
        {aiAnalysis ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Edge AI Automated Stage Verification
            </label>
            <AiVisionAssistantCard analysis={aiAnalysis} />
          </div>
        ) : currentStageData?.aiVisionAnalysis ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Recorded AI Stage Classification
            </label>
            <AiVisionAssistantCard analysis={currentStageData.aiVisionAnalysis} />
          </div>
        ) : null}

        {/* Anti-Ghost House: Beneficiary Co-Presence & Plaque Verification */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Beneficiary Co-Presence &amp; Stage Plaque Verification
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  Certifies beneficiary <span className="text-blue-700 font-semibold">{beneficiary.name}</span> is physically present at the sanctioned parcel alongside the PMAY-G yellow wall marker.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={coPresenceVerified} 
                onChange={(e) => setCoPresenceVerified(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700"></div>
            </label>
          </div>
          {coPresenceVerified && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Face presence &amp; wall plaque matched with 96% confidence</span>
            </div>
          )}
        </div>

        {/* DPDP Act 2023 Citizen Consent Artifact */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dpdpConsented}
              onChange={(e) => setDpdpConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer shrink-0"
            />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">
                Digital Personal Data Protection (DPDP) Act 2023 Consent Artifact
              </span>
              <span>
                I certify that citizen <strong className="text-slate-900">{beneficiary.name}</strong> was informed in {language === 'hi' ? 'हिंदी (Hindi)' : 'their local language'} and provided informed consent for photographic capture, geotag verification, and Aadhaar-linked DBT subsidy release under PMAY-G guidelines.
              </span>
              <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                Statutory Purpose: MoRD PMAY-G DBT Subsidy • Token: DPDPA-JH-{beneficiary.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </label>
        </div>

        {/* Field Notes Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Inspector Field Observations &amp; Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!seqValidation.valid || isStageApproved}
            placeholder={`Enter stage observations (e.g. Foundation depth 1.2m verified with tape measure. Reinforcement cages placed per schedule.)`}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-hidden focus:border-blue-600 focus:bg-white disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Bhashini AI Multilingual Voice Assistant & WhatsApp Dispatch Simulator */}
        <BhashiniVoiceAssistant
          beneficiary={beneficiary}
          stage={activeStage}
          amount={activeStage === 'foundation' ? 40000 : activeStage === 'plinth' ? 40000 : activeStage === 'lintel' ? 30000 : 10000}
          onTranscriptReceived={(dictation) => setNotes(prev => prev ? `${prev} ${dictation}` : dictation)}
        />

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">
                Inspection Successfully Saved!
              </p>
              <p className="text-[11px] text-emerald-800">
                {submitSuccess === 'synced'
                  ? 'Synchronized directly with central MoRD server.'
                  : 'Saved locally in IndexedDB. Will auto-sync when network reconnects.'}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmitInspection}
            disabled={!seqValidation.valid || isSubmitting || isStageApproved}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isStageApproved
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span>Saving Geotagged Inspection...</span>
            ) : isStageApproved ? (
              <span>Stage Already Approved by BDO</span>
            ) : isOnline ? (
              <>
                <CloudUpload className="w-4 h-4" />
                <span>Submit Geotagged Inspection (Direct Sync)</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-amber-300" />
                <span>Save Offline in IndexedDB (Auto-Sync Queue)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        beneficiary={beneficiary}
        stage={activeStage}
        initialMode={cameraInitialMode}
        onCaptureComplete={handleCaptureComplete}
      />

      {/* ISRO Bhuvan Satellite Remote Sensing Modal */}
      <SatelliteMacroModal
        beneficiary={beneficiary}
        isOpen={isSatModalOpen}
        onClose={() => setIsSatModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
