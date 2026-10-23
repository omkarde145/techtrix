'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Filter, 
  Flag, 
  Home, 
  Eye, 
  Send, 
  X,
  IndianRupee
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StageType, SocialAuditReport } from '@/types';

export default function SocialAuditPage() {
  const { beneficiaries } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGp, setSelectedGp] = useState('ALL');
  const [selectedBeneficiaryForReport, setSelectedBeneficiaryForReport] = useState<string | null>(null);
  const [complaintCategory, setComplaintCategory] = useState<SocialAuditReport['complaintCategory']>('GHOST_BENEFICIARY');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [submittedReports, setSubmittedReports] = useState<SocialAuditReport[]>([
    {
      id: 'SAR-2024-001',
      pmayId: 'PMAY-G-JH-2024-08201',
      beneficiaryName: 'Smt. Sunita Devi',
      village: 'Hesag',
      gramPanchayat: 'Hesag GP',
      stageReported: 'lintel',
      citizenName: 'Rameshwar Oraon (Gram Sabha Member)',
      citizenMobile: '+91-98765-43210',
      complaintCategory: 'GENERAL_FEEDBACK',
      complaintDescription: 'Construction is progressing well with good brick masonry. Beneficiary has received both 1st and 2nd instalments directly in bank account.',
      submittedAt: '2024-05-18T10:30:00Z',
      status: 'DISMISSED',
    },
    {
      id: 'SAR-2024-002',
      pmayId: 'PMAY-G-JH-2024-08204',
      beneficiaryName: 'Sunita Devi (Duplicate)',
      village: 'Namkum',
      gramPanchayat: 'Namkum GP',
      stageReported: 'foundation',
      citizenName: 'Deepak Kumar (Village Vigilance Committee)',
      citizenMobile: '+91-98123-45678',
      complaintCategory: 'GHOST_BENEFICIARY',
      complaintDescription: 'Same ration card number is being used in two adjacent Panchayats. Please verify physical presence of beneficiary before releasing second instalment.',
      submittedAt: '2024-05-19T14:15:00Z',
      status: 'VERIFIED_FRAUD',
    },
  ]);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  // Filter beneficiaries
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pmayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGp = selectedGp === 'ALL' || b.gramPanchayat === selectedGp;
    return matchesSearch && matchesGp;
  });

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiaryForReport || !complaintText.trim()) return;

    const b = beneficiaries.find((item) => item.id === selectedBeneficiaryForReport);
    if (!b) return;

    const ticketId = `SAR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: SocialAuditReport = {
      id: ticketId,
      pmayId: b.pmayId,
      beneficiaryName: b.name,
      village: b.village,
      gramPanchayat: b.gramPanchayat,
      stageReported: b.currentStage,
      citizenName: citizenName || 'Anonymous Gram Sabha Citizen',
      citizenMobile: citizenPhone || '+91-XXXXXXXXXX',
      complaintCategory,
      complaintDescription: complaintText,
      submittedAt: new Date().toISOString(),
      status: 'PENDING_INVESTIGATION',
    };

    setSubmittedReports([newReport, ...submittedReports]);
    setSuccessTicket(ticketId);
    setSelectedBeneficiaryForReport(null);
    setComplaintText('');
    setCitizenName('');
    setCitizenPhone('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <Home className="w-3.5 h-3.5 text-blue-700" />
            <span>Portal Home</span>
          </Link>
          <span className="text-xs text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Sec 17 Panchayati Raj Act
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              Jan Soochna: Public Social Audit Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/field" className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs">
            Inspector View
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 shadow-xs">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Gram Sabha Community Verification Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Jan Soochna: Public Social Audit of Rural Housing Works
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            In accordance with the Panchayati Raj Act, all sanctioned PMAY-G houses and Panchayat works are publicly listed with geo-coordinates, milestone photographs, and DBT release records for public community audit. Citizens can report anomalies with 1-click whistleblower flags.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <strong>{beneficiaries.length}</strong> Public Records Listed
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <strong>{submittedReports.length}</strong> Citizen Vigilance Reports
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
              ✓ 100% Open Data Transparency
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Success ticket banner */}
        {successTicket && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Whistleblower Report Submitted: Ticket #{successTicket}</p>
                <p className="text-[11px] text-slate-600">Transmitted directly to District Collector Vigilance Cell for inquiry.</p>
              </div>
            </div>
            <button onClick={() => setSuccessTicket(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by citizen name, PMAY ID, village..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedGp}
              onChange={(e) => setSelectedGp(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-blue-600 w-full sm:w-auto"
            >
              <option value="ALL">All Gram Panchayats</option>
              <option value="Bishnupur Gram Panchayat">Bishnupur GP</option>
              <option value="Chandankiyari Gram Panchayat">Chandankiyari GP</option>
            </select>
          </div>
        </div>

        {/* Public Beneficiary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeneficiaries.map((b) => (
            <div 
              key={b.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {b.pmayId}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    b.currentStage === 'completion'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {b.currentStage} Stage
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                  <p className="text-xs text-slate-500">{b.guardianName} • {b.category}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-700" />
                    <span>{b.village}, {b.gramPanchayat}</span>
                  </p>
                </div>

                {/* DBT Funds Summary */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">DBT Released</span>
                    <strong className="text-emerald-700 text-sm">₹{b.totalDbtReleased.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Sanctioned</span>
                    <span className="text-slate-700 font-bold">₹{b.sanctionedAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 4-Stage Mini Timeline */}
                <div className="flex items-center gap-1 pt-1 text-[9px] font-bold">
                  {(['foundation', 'plinth', 'lintel', 'completion'] as StageType[]).map((stg) => {
                    const status = b.stageHistory[stg]?.status;
                    const isApproved = status === 'approved';
                    const isSubmitted = status === 'submitted';
                    return (
                      <div
                        key={stg}
                        className={`flex-1 py-1 rounded text-center uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isSubmitted
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {stg.slice(0, 4)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/field/inspect/${b.id}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Photos</span>
                </Link>

                <button
                  onClick={() => setSelectedBeneficiaryForReport(b.id)}
                  className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Anomaly</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Existing Citizen Vigilance Reports Feed */}
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Public Citizen Vigilance &amp; Social Audit Inquiries</span>
            </h2>
            <span className="text-xs text-slate-500">Sec 17 Vigilance Register</span>
          </div>

          <div className="space-y-2">
            {submittedReports.map((report) => (
              <div key={report.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-700">{report.id}</span>
                    <span className="text-slate-900 font-bold">{report.beneficiaryName} ({report.pmayId})</span>
                    <span className="text-slate-500 text-[10px]">• {report.village}, {report.gramPanchayat}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    report.status === 'VERIFIED_FRAUD'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : report.status === 'PENDING_INVESTIGATION'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  &quot;{report.complaintDescription}&quot;
                </p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                  <span>Reported by: {report.citizenName}</span>
                  <span>•</span>
                  <span>Category: {report.complaintCategory}</span>
                  <span>•</span>
                  <span>Date: {new Date(report.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Citizen Whistleblower Modal */}
      {selectedBeneficiaryForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gram Sabha Citizen Whistleblower Report</h3>
                  <p className="text-[10px] text-slate-500">Anonymous vigilance submission to District Collector</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBeneficiaryForReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Complaint Category</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-hidden focus:border-blue-600"
                >
                  <option value="GHOST_BENEFICIARY">Ghost Beneficiary / Not Resident in Village</option>
                  <option value="STAGE_MISMATCH">Stage Mismatch (Physical house is behind reported stage)</option>
                  <option value="QUALITY_DEFECT">Substandard Construction / Safety Defect</option>
                  <option value="BRIBE_DEMAND">Middleman / Extortion Complaint</option>
                  <option value="GENERAL_FEEDBACK">General Community Feedback</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description / Grounds of Objection</label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Provide concrete details about the site anomaly, contractor irregularity, or ghost claim..."
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Leave blank for anonymous"
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91-XXXXX-XXXXX"
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBeneficiaryForReport(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Whistleblower Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
