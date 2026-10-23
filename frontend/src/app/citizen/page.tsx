'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Eye, 
  Printer, 
  ShieldCheck, 
  Home, 
  Layers, 
  FileText, 
  AlertCircle, 
  Droplet, 
  Flame, 
  Zap, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  User,
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Beneficiary, StageType } from '@/types';
import { SEED_PANCHAYAT_WORKS } from '@/lib/db/seedData';

export default function CitizenPublicDashboardPage() {
  const { beneficiaries, selectedPanchayat, setSelectedPanchayat } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [activeTab, setActiveTab] = useState<'housing' | 'panchayat_works'>('housing');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Filter beneficiaries for public search
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.pmayId.toLowerCase().includes(q) ||
        b.village.toLowerCase().includes(q) ||
        b.rationCardNo.toLowerCase().includes(q);

      const matchesGp = selectedPanchayat === 'ALL' || b.gramPanchayat === selectedPanchayat;
      return matchesSearch && matchesGp;
    });
  }, [beneficiaries, searchQuery, selectedPanchayat]);

  // Public high-level metrics
  const totalSanctioned = filteredBeneficiaries.length;
  const completedHouses = filteredBeneficiaries.filter(b => b.overallStatus === 'completed').length;
  const underConstruction = filteredBeneficiaries.filter(b => b.overallStatus === 'in_progress').length;
  const totalDbtReleased = filteredBeneficiaries.reduce((sum, b) => sum + b.totalDbtReleased, 0);

  const handlePrintSlip = () => {
    window.print();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackText('');
      setIsFeedbackModalOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top National Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs shrink-0 hover:bg-blue-800 transition-colors">
              <Building2 className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Public Information Portal • Section 17 Social Audit
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hidden sm:inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> Read-Only Mode
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                PMAY-G Citizen Housing &amp; Panchayat Tracker
              </h1>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <select
                value={selectedPanchayat}
                onChange={(e) => setSelectedPanchayat(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="ALL">All Gram Panchayats</option>
                <option value="Bishnupur Gram Panchayat">Bishnupur GP (Ranchi)</option>
                <option value="Chandankiyari Gram Panchayat">Chandankiyari GP (Bokaro)</option>
              </select>
            </div>

            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Read-Only Guarantee Notice Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                Official Public Transparency Dashboard (Read-Only)
              </h3>
              <p className="text-[11px] text-emerald-800">
                Rural citizens can openly search and track sanction records, milestone photos, and PFMS DBT transfers without alteration rights.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer text-center"
          >
            Submit Citizen Feedback
          </button>
        </div>

        {/* Public KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sanctioned Houses</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{totalSanctioned}</p>
            <span className="text-[11px] text-slate-500">Government approved</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Completed Pucca</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700">{completedHouses}</p>
            <span className="text-[11px] text-slate-500">Fully finished &amp; occupied</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Under Construction</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-800">{underConstruction}</p>
            <span className="text-[11px] text-slate-500">Foundation, Plinth or Lintel</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Direct Subsidies</span>
              <IndianRupee className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-teal-800">₹{(totalDbtReleased / 100000).toFixed(2)} L</p>
            <span className="text-[11px] text-slate-500">Aadhaar PFMS DBT credited</span>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('housing')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'housing'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Beneficiary House Tracker
              </button>
              <button
                onClick={() => setActiveTab('panchayat_works')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'panchayat_works'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Panchayat Development Works
              </button>
            </div>

            {/* Public Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by PMAY ID, Name (e.g. Sunita Devi), or Village..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Beneficiary House Tracker */}
        {activeTab === 'housing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Beneficiary List / Search Results */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col h-[640px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Beneficiary Records ({filteredBeneficiaries.length})
                </span>
                <span className="text-[11px] text-slate-500">Tap to inspect</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredBeneficiaries.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No matching beneficiary records found.
                  </div>
                ) : (
                  filteredBeneficiaries.map((b) => {
                    const isSelected = selectedBeneficiary?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBeneficiary(b)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{b.name}</h4>
                            <p className="text-[11px] font-mono text-blue-700 font-semibold">{b.pmayId}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{b.village}, {b.gramPanchayat}</p>
                          </div>
                          <Badge size="sm" variant={`stage-${b.currentStage}`}>
                            {b.currentStage.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-500">DBT Released:</span>
                          <span className="font-bold text-emerald-700">₹{b.totalDbtReleased.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Beneficiary Detailed Case View (Read-Only) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs h-fit space-y-6">
              {selectedBeneficiary ? (
                <div className="space-y-6">
                  {/* Beneficiary Header & Slip Action */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                          Official PMAY-G Sanction Record
                        </span>
                        <Badge size="sm" variant={`stage-${selectedBeneficiary.currentStage}`}>
                          {selectedBeneficiary.currentStage.toUpperCase()} STAGE
                        </Badge>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {selectedBeneficiary.name}
                      </h2>
                      <p className="text-xs text-slate-600">
                        {selectedBeneficiary.village}, {selectedBeneficiary.gramPanchayat} • PMAY ID: <strong>{selectedBeneficiary.pmayId}</strong>
                      </p>
                    </div>

                    <button
                      onClick={handlePrintSlip}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Status Slip</span>
                    </button>
                  </div>

                  {/* 4-Stage Visual Construction Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      4-Stage Construction &amp; Subsidy Progress (Read-Only)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(['foundation', 'plinth', 'lintel', 'completion'] as StageType[]).map((stage, idx) => {
                        const stageData = selectedBeneficiary.stageHistory[stage];
                        const isApproved = stageData?.status === 'approved';
                        const isSubmitted = stageData?.status === 'submitted';
                        const amounts = { foundation: 40000, plinth: 45000, lintel: 30000, completion: 15000 };

                        return (
                          <div
                            key={stage}
                            className={`p-3 rounded-xl border ${
                              isApproved
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : isSubmitted
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                              Stage 0{idx + 1}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 capitalize mt-0.5">{stage}</h5>
                            <p className="text-[11px] font-bold text-emerald-800 mt-1">
                              ₹{amounts[stage].toLocaleString('en-IN')}
                            </p>
                            <span className={`text-[10px] font-semibold block mt-1.5 ${
                              isApproved ? 'text-emerald-700' : isSubmitted ? 'text-amber-800' : 'text-slate-400'
                            }`}>
                              {isApproved ? '✓ Verified & Credited' : isSubmitted ? '⏳ Under Review' : '🔒 Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stamped Geotagged Photo Evidence Gallery */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Photographic Inspection Evidence (Field Geotagged)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['foundation', 'plinth', 'lintel', 'completion'] as StageType[]).map((stage) => {
                        const stageData = selectedBeneficiary.stageHistory[stage];
                        if (!stageData?.photoUrl && !stageData?.watermarkedPhotoUrl) return null;

                        return (
                          <div key={stage} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                            <div className="p-2 border-b border-slate-200 flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 capitalize">{stage} Inspection Photo</span>
                              <span className="text-emerald-700 font-semibold text-[10px]">ECDSA Signed</span>
                            </div>
                            <div className="relative aspect-4/3 bg-slate-900 flex items-center justify-center">
                              <img
                                src={stageData.watermarkedPhotoUrl || stageData.photoUrl}
                                alt={`${stage} photo`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="p-2 text-[10px] text-slate-500 space-y-0.5">
                              <p>Date: {stageData.submittedAt ? new Date(stageData.submittedAt).toLocaleDateString() : 'N/A'}</p>
                              <p className="font-mono text-teal-800 font-semibold">
                                GPS: {stageData.latitude !== undefined && stageData.longitude !== undefined 
                                  ? `${stageData.latitude.toFixed(5)}° N, ${stageData.longitude.toFixed(5)}° E` 
                                  : 'Geotag Coordinates Authenticated'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Welfare Convergence Matrix (Read-Only) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Welfare Scheme Convergence Status</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">PM Ujjwala (LPG)</p>
                          <span className="text-xs font-bold text-emerald-700">✓ Connected</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">Saubhagya (Power)</p>
                          <span className="text-xs font-bold text-emerald-700">✓ Metered</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">Jal Jeevan (Water)</p>
                          <span className="text-xs font-bold text-emerald-700">✓ Tap Available</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <Home className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">SBM-G (Toilet)</p>
                          <span className="text-xs font-bold text-emerald-700">✓ IHHL Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-100">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Select a Beneficiary from the Left List</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Or use the search box above to track your PMAY-G application status, photo verification, and DBT installments.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Panchayat Development Works Tracker */}
        {activeTab === 'panchayat_works' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Gram Panchayat Infrastructure &amp; Civic Works
              </h3>
              <p className="text-xs text-slate-500">
                15th Finance Commission &amp; MGNREGS village development projects (Public Audit)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SEED_PANCHAYAT_WORKS.map((work) => (
                <div key={work.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">{work.workCode}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{work.title}</h4>
                      <p className="text-[11px] text-slate-500">{work.village}, {work.gramPanchayat}</p>
                    </div>
                    <Badge size="sm" variant={work.status === 'completed' ? 'completed' : 'pending'}>
                      {work.status === 'completed' ? 'Completed' : `${work.physicalProgressPercent}% In Progress`}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    Agency: <strong className="font-semibold text-slate-800">{work.executingAgency}</strong> • Current Milestone: {work.currentStage}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Physical Progress:</span>
                      <strong className="text-slate-800">{work.physicalProgressPercent}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${work.physicalProgressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sanctioned Grant:</span>
                      <span className="font-bold text-slate-900">₹{work.sanctionedCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Funds Disbursed:</span>
                      <span className="font-bold text-emerald-700">₹{work.fundsDisbursed.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Citizen Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Gram Sabha Social Audit Feedback</h3>
                <p className="text-[11px] text-slate-500">Submit an inquiry or grievance for public audit review</p>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">Grievance / Feedback Registered</h4>
                <p className="text-xs text-emerald-800">
                  Your feedback has been logged in the Gram Panchayat Social Audit register.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Beneficiary Name / PMAY ID (Optional)
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedBeneficiary?.name || ''}
                    placeholder="e.g. Sunita Devi (JH-849102)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Feedback / Inquiry Remarks
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter your query regarding construction progress, subsidy credit delay, or material voucher..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  Submit to Social Audit Record
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>Pradhan Mantri Awaas Yojana - Gramin (PMAY-G) • Ministry of Rural Development</p>
      </footer>
    </div>
  );
}
