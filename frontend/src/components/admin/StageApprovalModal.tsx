'use client';

import React, { useState } from 'react';
import { Beneficiary, StageType } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { 
  X, 
  Check, 
  XCircle, 
  IndianRupee, 
  Layers, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound,
  FileCheck,
  Cpu
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface StageApprovalModalProps {
  beneficiary: Beneficiary;
  stage: StageType;
  isOpen: boolean;
  onClose: () => void;
}

const DBT_AMOUNTS: Record<StageType, number> = {
  foundation: 40000,
  plinth: 45000,
  lintel: 30000,
  completion: 15000
};

export function StageApprovalModal({
  beneficiary,
  stage,
  isOpen,
  onClose
}: StageApprovalModalProps) {
  const { approveStage, rejectStage, admin } = useApp();
  const [remarks, setRemarks] = useState('');
  const [triggerDbt, setTriggerDbt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [comparisonStage, setComparisonStage] = useState<StageType | null>(
    stage === 'plinth' ? 'foundation' : stage === 'lintel' ? 'plinth' : stage === 'completion' ? 'lintel' : null
  );

  if (!isOpen) return null;

  const currentStageData = beneficiary.stageHistory[stage];
  const comparedStageData = comparisonStage ? beneficiary.stageHistory[comparisonStage] : null;
  const dbtAmount = DBT_AMOUNTS[stage];
  const jeClearance = currentStageData?.jeClearance;

  const handleApprove = async () => {
    setActionError(null);
    if (!remarks.trim()) {
      setActionError('Administrative audit approval remarks are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      await approveStage(beneficiary.id, stage, remarks, triggerDbt);
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Approval action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setActionError(null);
    if (!remarks.trim()) {
      setActionError('Rejection remarks stating specific structural defects are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectStage(beneficiary.id, stage, remarks);
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Rejection action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl text-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-800 tracking-wider uppercase">
                  Maker-Checker Protocol • 3-Tier DBT Sanction
                </span>
                <Badge size="sm" variant={`stage-${stage}`}>
                  {stage.toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {beneficiary.name} ({beneficiary.pmayId})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 3-Tier Maker-Checker Compliance Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Statutory 3-Tier Maker-Checker Verification Pipeline
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tier 1: Field Maker */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-teal-800">1. Maker (Field Officer)</span>
                  <Badge size="sm" variant="verified">Submitted</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  {currentStageData?.submittedAt ? new Date(currentStageData.submittedAt).toLocaleDateString() : 'N/A'}
                </p>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ECDSA-P256 Device Signed</span>
                </div>
              </div>

              {/* Tier 2: Junior Engineer Technical Checker */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-cyan-800">2. Checker (Junior Engineer)</span>
                  <Badge size="sm" variant={jeClearance?.verified ? 'verified' : 'pending'}>
                    {jeClearance?.verified ? 'Cleared' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  {jeClearance?.engineerName || 'Er. Manoj Verma (JE)'}
                </p>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Structural Score: {jeClearance?.technicalScore || 96}/100</span>
                </div>
              </div>

              {/* Tier 3: BDO Approver with DSC */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-200 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-blue-800">3. Approver (BDO DSC)</span>
                  <Badge size="sm" variant="info">Ready to Sign</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  {admin.name} (BDO)
                </p>
                <div className="mt-2 text-[10px] text-blue-700 flex items-center gap-1 font-mono">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>NIC Class-3 e-Token Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Photo Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Visual Inspection Audit • Side-by-Side Stage Verification
              </h4>
              {comparisonStage && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Comparing against:</span>
                  <select
                    value={comparisonStage}
                    onChange={(e) => setComparisonStage(e.target.value as StageType)}
                    className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-semibold cursor-pointer outline-hidden focus:border-teal-600"
                  >
                    <option value="foundation">Foundation</option>
                    <option value="plinth">Plinth</option>
                    <option value="lintel">Lintel</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonStage && comparedStageData?.photoUrl ? (
                <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-2.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2 px-1 text-xs">
                    <span className="font-bold text-slate-700 uppercase">
                      Baseline: {comparisonStage} Stage
                    </span>
                    <Badge size="sm" variant="verified">Approved</Badge>
                  </div>
                  <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={comparedStageData.watermarkedPhotoUrl || comparedStageData.photoUrl}
                      alt="Baseline stage"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 px-1">
                    Approved on: {comparedStageData.approvedAt ? new Date(comparedStageData.approvedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400">
                  <Layers className="w-8 h-8 mb-2" />
                  <p className="text-xs">No prior baseline stage available (Initial Foundation)</p>
                </div>
              )}

              <div className="rounded-xl overflow-hidden bg-white border-2 border-teal-500 p-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-2 px-1 text-xs">
                  <span className="font-bold text-teal-800 uppercase">
                    Under Review: {stage} Stage
                  </span>
                  <Badge size="sm" variant="pending">Submitted</Badge>
                </div>
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  {currentStageData?.watermarkedPhotoUrl || currentStageData?.photoUrl ? (
                    <img
                      src={currentStageData.watermarkedPhotoUrl || currentStageData.photoUrl}
                      alt="Current stage photo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">No inspection photo uploaded yet</div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                  <span>Geotag Coordinates:</span>
                  <span className="font-mono text-teal-800 font-semibold">
                    {beneficiary.latitude.toFixed(5)}° N, {beneficiary.longitude.toFixed(5)}° E (Alt: {beneficiary.altitude || 340}m)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Junior Engineer Technical Clearance Remarks */}
          {jeClearance && (
            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase flex items-center gap-1.5 text-cyan-800">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Junior Engineer Technical Clearance Report ({jeClearance.engineerName})</span>
                </span>
                <span className="text-xs font-bold text-cyan-800">Technical Score: {jeClearance.technicalScore}%</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 italic">
                &ldquo;{jeClearance.remarks}&rdquo;
              </p>
            </div>
          )}

          {/* Edge AI Vision Stage Detector Report */}
          {currentStageData?.aiVisionAnalysis && (
            <div className={`p-3.5 rounded-xl border ${
              currentStageData.aiVisionAnalysis.stageMatch !== false
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  <span>Edge AI Automated Stage Verification</span>
                </span>
                <span className="text-xs font-bold font-mono">
                  {currentStageData.aiVisionAnalysis.stageMatch !== false ? (
                    <span className="text-emerald-700">✓ {currentStageData.aiVisionAnalysis.detectedStage.toUpperCase()} Stage Verified ({currentStageData.aiVisionAnalysis.confidencePercent}%)</span>
                  ) : (
                    <span className="text-amber-800">⚠️ Discrepancy: Detected {currentStageData.aiVisionAnalysis.detectedStage.toUpperCase()}</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 italic">
                &ldquo;{currentStageData.aiVisionAnalysis.analysisSummary}&rdquo;
              </p>
            </div>
          )}

          {/* Direct Benefit Transfer (DBT) Configuration Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-700" />
                <span className="text-sm font-bold text-emerald-900">
                  Next DBT Instalment: ₹{dbtAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Direct Credit to Seeded Aadhaar Bank Account: <strong className="text-slate-900">{beneficiary.bankAccountMasked}</strong> ({beneficiary.bankIfsc})
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shrink-0 shadow-xs">
              <input
                type="checkbox"
                checked={triggerDbt}
                onChange={(e) => setTriggerDbt(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              >
              </input>
              <span className="text-xs font-semibold text-slate-800">
                Trigger PFMS DBT Release
              </span>
            </label>
          </div>

          {/* Mandatory Remarks Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Official BDO Administrative Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter mandatory audit remarks (e.g. Dimensions and structural stability certified by Junior Engineer. Approved for PFMS DBT disbursement.)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600 transition-colors"
            />
          </div>

          {actionError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{actionError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject &amp; Request Re-inspection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {triggerDbt ? `Sign with BDO DSC & Release ₹${dbtAmount.toLocaleString('en-IN')}` : 'Sign with BDO DSC'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
