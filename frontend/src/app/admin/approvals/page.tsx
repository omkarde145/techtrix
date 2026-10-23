'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { StageApprovalModal } from '@/components/admin/StageApprovalModal';
import { PfmsBatchExportModal } from '@/components/admin/PfmsBatchExportModal';
import { DigitalRupeeCbdcModal } from '@/components/admin/DigitalRupeeCbdcModal';
import { MonsoonRiskBanner } from '@/components/admin/MonsoonRiskBanner';
import { calculateMonsoonRisk } from '@/lib/engines/monsoonRiskEngine';
import { StageType, Beneficiary, PfmsFtoBatch } from '@/types';
import { generatePfmsFtoBatch } from '@/lib/engines/pfmsEngine';
import { 
  CheckSquare, 
  MapPin, 
  IndianRupee, 
  Camera, 
  ArrowRight,
  Filter,
  Sparkles,
  Zap,
  FileCode 
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export default function AdminApprovalsPage() {
  const { beneficiaries, selectedPanchayat, approveStage } = useApp();

  const [activeModalData, setActiveModalData] = useState<{
    beneficiary: Beneficiary;
    stage: StageType;
  } | null>(null);

  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [latestPfmsBatch, setLatestPfmsBatch] = useState<PfmsFtoBatch | null>(null);
  const [isPfmsModalOpen, setIsPfmsModalOpen] = useState(false);
  const [cbdcModalData, setCbdcModalData] = useState<{ beneficiary: Beneficiary; stage: StageType; amount: number } | null>(null);
  const [fastTrackTriggered, setFastTrackTriggered] = useState(false);

  const monsoonRisk = useMemo(() => {
    return calculateMonsoonRisk(selectedPanchayat === 'ALL' ? 'Ranchi Sadar' : selectedPanchayat, beneficiaries);
  }, [selectedPanchayat, beneficiaries]);

  // Extract all pending/submitted stages across beneficiaries
  const pendingApprovals = useMemo(() => {
    const list: {
      beneficiary: Beneficiary;
      stage: StageType;
      submittedAt?: string;
      photoUrl?: string;
      watermarkedPhotoUrl?: string;
      officerRemarks?: string;
      isClean: boolean;
    }[] = [];

    beneficiaries.forEach((b) => {
      if (selectedPanchayat !== 'ALL' && b.gramPanchayat !== selectedPanchayat) {
        return;
      }

      const stages: StageType[] = ['foundation', 'plinth', 'lintel', 'completion'];
      stages.forEach((stg) => {
        const sData = b.stageHistory[stg];
        if (sData?.status === 'submitted') {
          if (stageFilter === 'ALL' || stageFilter === stg) {
            const hasUnresolvedFlags = b.flags && b.flags.some(f => !f.resolved);
            list.push({
              beneficiary: b,
              stage: stg,
              submittedAt: sData.submittedAt,
              photoUrl: sData.photoUrl,
              watermarkedPhotoUrl: sData.watermarkedPhotoUrl,
              officerRemarks: sData.officerRemarks,
              isClean: !hasUnresolvedFlags
            });
          }
        }
      });
    });

    return list;
  }, [beneficiaries, selectedPanchayat, stageFilter]);

  const cleanApprovals = useMemo(() => pendingApprovals.filter(p => p.isClean), [pendingApprovals]);
  const flaggedApprovals = useMemo(() => pendingApprovals.filter(p => !p.isClean), [pendingApprovals]);

  const handleBatchApproveCleanStream = async () => {
    if (cleanApprovals.length === 0) return;
    setIsBatchApproving(true);

    try {
      // 1. Approve each clean stage with BDO DSC and trigger DBT
      for (const item of cleanApprovals) {
        await approveStage(
          item.beneficiary.id,
          item.stage,
          'Batch approved under BDO DSC Class-3 mandate with zero compliance exceptions.',
          true
        );
      }

      // 2. Generate official PFMS FTO XML Batch
      const batch = generatePfmsFtoBatch(
        cleanApprovals.map(a => ({ beneficiary: a.beneficiary, stage: a.stage }))
      );

      setLatestPfmsBatch(batch);
      setIsPfmsModalOpen(true);
    } catch (err) {
      console.error('Batch approval error:', err);
    } finally {
      setIsBatchApproving(false);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="flex-1 flex flex-col bg-slate-50 pb-16">
        <AdminHeader />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                PFMS Integrated Stage Gate
              </span>
              <Badge size="sm" variant="pending">
                {pendingApprovals.length} Awaiting Verification
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Stage Approval &amp; Direct Benefit Transfer (DBT) Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review field inspector geotagged photographs, verify dimensional specs, and authorize central DBT subsidy credits.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-700" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="foundation">Stage 1: Foundation</option>
              <option value="plinth">Stage 2: Plinth</option>
              <option value="lintel">Stage 3: Lintel</option>
              <option value="completion">Stage 4: Completion</option>
            </select>
          </div>
        </div>

        {/* IMD Monsoon Hazard Weather Banner */}
        <MonsoonRiskBanner
          riskData={monsoonRisk}
          onTriggerFastTrack={() => setFastTrackTriggered(true)}
          fastTrackTriggered={fastTrackTriggered}
        />

        {/* Smart Batch Approval & PFMS FTO Generation Action Panel */}
        {cleanApprovals.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-blue-600 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <Sparkles className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Smart Batch Safe-Approval Mode</span>
                  <Badge size="sm" variant="verified">100% Trust Verified</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  <strong className="text-blue-700">{cleanApprovals.length} pending inspections</strong> have passed all automated integrity checks (zero geofence collisions, valid DPDP consent, and JE technical clearance).
                </p>
                {flaggedApprovals.length > 0 && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    ⚠️ {flaggedApprovals.length} flagged case(s) isolated for manual one-by-one verification.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {latestPfmsBatch && (
                <button
                  onClick={() => setIsPfmsModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileCode className="w-4 h-4 text-blue-700" />
                  <span>View PFMS FTO XML</span>
                </button>
              )}

              <button
                onClick={handleBatchApproveCleanStream}
                disabled={isBatchApproving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>
                  {isBatchApproving 
                    ? 'Signing with Class-3 DSC...' 
                    : `Batch Sign with BDO DSC & Release DBT (${cleanApprovals.length})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Approvals List */}
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">All Field Inspections Verified</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are no pending stage inspections awaiting approval in this Gram Panchayat. All records have been cleared.
                </p>
              </div>
            </div>
          ) : (
            pendingApprovals.map((item) => (
              <div
                key={`${item.beneficiary.id}-${item.stage}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative">
                    {item.watermarkedPhotoUrl || item.photoUrl ? (
                      <img
                        src={item.watermarkedPhotoUrl || item.photoUrl}
                        alt="Stage inspection"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-center font-bold text-white uppercase py-0.5">
                      {item.stage}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.beneficiary.name}
                      </h3>
                      <Badge size="sm" variant="slate">{item.beneficiary.pmayId}</Badge>
                      <Badge size="sm" variant={`stage-${item.stage}`}>
                        STAGE: {item.stage.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>{item.beneficiary.targetAddress}, {item.beneficiary.village}</p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        <span>GPS: {item.beneficiary.latitude.toFixed(5)}° N, {item.beneficiary.longitude.toFixed(5)}° E</span>
                      </p>
                    </div>

                    {item.officerRemarks && (
                      <p className="text-xs text-slate-700 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                        &ldquo;{item.officerRemarks}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: DBT Action Trigger */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Next DBT Grant</span>
                    <p className="text-base font-bold text-emerald-700">
                      ₹{item.stage === 'foundation' ? '40,000' : item.stage === 'plinth' ? '45,000' : item.stage === 'lintel' ? '30,000' : '15,000'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setCbdcModalData({
                        beneficiary: item.beneficiary,
                        stage: item.stage,
                        amount: item.stage === 'foundation' ? 40000 : item.stage === 'plinth' ? 45000 : item.stage === 'lintel' ? 30000 : 15000
                      })}
                      className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Issue e₹ Voucher</span>
                    </button>

                    <button
                      onClick={() => setActiveModalData({ beneficiary: item.beneficiary, stage: item.stage })}
                      className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Verify &amp; Release DBT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stage Approval & DBT Sanction Modal */}
      {activeModalData && (
        <StageApprovalModal
          isOpen={true}
          beneficiary={activeModalData.beneficiary}
          stage={activeModalData.stage}
          onClose={() => setActiveModalData(null)}
        />
      )}

      {/* Digital Rupee CBDC Voucher Modal */}
      {cbdcModalData && (
        <DigitalRupeeCbdcModal
          beneficiary={cbdcModalData.beneficiary}
          stage={cbdcModalData.stage}
          amount={cbdcModalData.amount}
          isOpen={true}
          onClose={() => setCbdcModalData(null)}
          onVoucherIssued={() => {}}
        />
      )}

      {/* PFMS FTO XML Batch Export Modal */}
      <PfmsBatchExportModal
        isOpen={isPfmsModalOpen}
        onClose={() => setIsPfmsModalOpen(false)}
        batch={latestPfmsBatch}
      />
      </div>
    </AdminAuthGuard>
  );
}
