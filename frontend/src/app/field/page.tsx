'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Camera, 
  Lock,
  LogOut,
  QrCode,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { MobileBottomNav } from '@/components/field/MobileBottomNav';
import { SanctionQrScannerModal } from '@/components/field/SanctionQrScannerModal';
import { StageType } from '@/types';

export default function FieldTaskListPage() {
  const router = useRouter();
  const { 
    beneficiaries, 
    officer, 
    isAuthenticatedInspector, 
    logoutInspector 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGp, setSelectedGp] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.pmayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.rationCardNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGp = selectedGp === 'ALL' || b.gramPanchayat === selectedGp;
      const matchesStage = selectedStage === 'ALL' || b.currentStage === selectedStage;

      return matchesSearch && matchesGp && matchesStage;
    });
  }, [beneficiaries, searchQuery, selectedGp, selectedStage]);

  const stagesList: StageType[] = ['foundation', 'plinth', 'lintel', 'completion'];

  if (!isAuthenticatedInspector) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto min-h-[70vh]">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Inspector Authentication Required</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Access to AwaasApp inspection tasks, real-time geotagging, and camera verification requires an authenticated Field Inspector session.
        </p>
        <div className="w-full space-y-2.5">
          <button
            onClick={() => router.push('/login?role=inspector')}
            className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Sign In with Inspector Credentials
          </button>
          <Link
            href="/citizen"
            className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 text-center transition-colors"
          >
            Go to Public Citizen Tracker (Read-Only)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto pb-24 sm:pb-12 px-3 sm:px-6 pt-4">
      {/* Officer Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Field Duty Console
                </span>
                <Badge size="sm" variant="slate">ID: {officer.id}</Badge>
              </div>
              <h2 className="text-base font-bold text-slate-900">{officer.name}</h2>
              <p className="text-xs text-slate-500">Jurisdiction: {officer.panchayat}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500">Assigned Plots</span>
              <p className="text-lg font-bold text-blue-700">{beneficiaries.length}</p>
            </div>
            <button
              onClick={() => {
                logoutInspector();
                router.push('/login?role=inspector');
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              title="Sign Out as Inspector"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2 mb-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, PMAY ID, Village, or Ration Card..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-blue-600 shadow-xs"
          />
        </div>

        {/* Filter Pills & Scan Button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={selectedGp}
              onChange={(e) => setSelectedGp(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden font-medium cursor-pointer shadow-xs"
            >
              <option value="ALL">All Panchayats</option>
              <option value="Bishnupur Gram Panchayat">Bishnupur GP</option>
              <option value="Chandankiyari Gram Panchayat">Chandankiyari GP</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden font-medium cursor-pointer shadow-xs"
            >
              <option value="ALL">All Stages</option>
              <option value="foundation">Stage 1: Foundation</option>
              <option value="plinth">Stage 2: Plinth</option>
              <option value="lintel">Stage 3: Lintel</option>
              <option value="completion">Stage 4: Completion</option>
            </select>
          </div>

          {/* QR Scanner Trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Scan Sanction QR</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredBeneficiaries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold">No beneficiaries matching search criteria.</p>
          </div>
        ) : (
          filteredBeneficiaries.map((ben) => {
            const currentStageData = ben.stageHistory[ben.currentStage];
            const isFlagged = ben.overallStatus === 'flagged' || ben.flags.some(f => !f.resolved);
            const isUnderReview = currentStageData?.status === 'submitted';
            const isCompleted = ben.overallStatus === 'completed';

            return (
              <div
                key={ben.id}
                onClick={() => router.push(`/field/inspect/${ben.id}`)}
                className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-blue-300 p-4 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {ben.name}
                      </h3>
                      <Badge size="sm" variant="slate">{ben.pmayId}</Badge>

                      {isFlagged ? (
                        <Badge size="sm" variant="flagged">Flagged Alert</Badge>
                      ) : isCompleted ? (
                        <Badge size="sm" variant="completed">Fully Completed</Badge>
                      ) : isUnderReview ? (
                        <Badge size="sm" variant="pending">Review Pending</Badge>
                      ) : (
                        <Badge size="sm" variant={`stage-${ben.currentStage}`}>
                          {ben.currentStage.toUpperCase()} READY
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>{ben.targetAddress}</p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        <span>{ben.village}, {ben.gramPanchayat}</span>
                      </p>
                    </div>

                    {/* Stage Mini Progress Bar */}
                    <div className="mt-3 grid grid-cols-4 gap-1.5 max-w-sm">
                      {stagesList.map((stg, sIdx) => {
                        const sData = ben.stageHistory[stg];
                        const isApp = sData?.status === 'approved';
                        const isSub = sData?.status === 'submitted';
                        const isCur = ben.currentStage === stg;

                        return (
                          <div
                            key={stg}
                            className={`h-1.5 rounded-full ${
                              isApp
                                ? 'bg-emerald-500'
                                : isSub
                                ? 'bg-amber-400'
                                : isCur
                                ? 'bg-blue-600 animate-pulse'
                                : 'bg-slate-200'
                            }`}
                            title={`Stage ${sIdx + 1}: ${stg}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Action Arrow */}
                  <div className="flex items-center gap-2 self-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ergonomic Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* PMAY-G Sanction Order QR Code Scanner Modal */}
      <SanctionQrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        beneficiaries={beneficiaries}
      />
    </div>
  );
}
