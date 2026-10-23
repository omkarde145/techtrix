'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  ArrowUpRight,
  ShieldAlert,
  Home,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { InteractiveGISMap } from '@/components/admin/InteractiveGISMap';
import { MonsoonRiskBanner } from '@/components/admin/MonsoonRiskBanner';
import { calculateMonsoonRisk } from '@/lib/engines/monsoonRiskEngine';
import { Badge } from '@/components/common/Badge';
import { Beneficiary } from '@/types';
import { SEED_PANCHAYAT_WORKS } from '@/lib/db/seedData';

export default function AdminDashboardPage() {
  const { beneficiaries, selectedPanchayat, auditLogs } = useApp();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'housing' | 'panchayat_works'>('housing');

  // Filter beneficiaries by selected Gram Panchayat
  const filteredBeneficiaries = useMemo(() => {
    if (selectedPanchayat === 'ALL') return beneficiaries;
    return beneficiaries.filter(b => b.gramPanchayat === selectedPanchayat);
  }, [beneficiaries, selectedPanchayat]);

  // Filter Panchayat Development Works by selected Gram Panchayat
  const filteredPanchayatWorks = useMemo(() => {
    if (selectedPanchayat === 'ALL') return SEED_PANCHAYAT_WORKS;
    return SEED_PANCHAYAT_WORKS.filter(w => w.gramPanchayat === selectedPanchayat);
  }, [selectedPanchayat]);

  // Executive KPI Calculations - Housing
  const totalSanctioned = filteredBeneficiaries.length;
  const completedHouses = filteredBeneficiaries.filter(b => b.overallStatus === 'completed').length;
  const underConstruction = filteredBeneficiaries.filter(b => b.overallStatus === 'in_progress').length;
  const flaggedClaims = filteredBeneficiaries.filter(b => b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved)).length;
  const totalFundsReleased = filteredBeneficiaries.reduce((sum, b) => sum + b.totalDbtReleased, 0);

  // Executive KPI Calculations - Panchayat Works
  const totalWorksSanctioned = filteredPanchayatWorks.length;
  const completedWorks = filteredPanchayatWorks.filter(w => w.status === 'completed').length;
  const inProgressWorks = filteredPanchayatWorks.filter(w => w.status === 'in_progress').length;
  const totalWorksCost = filteredPanchayatWorks.reduce((sum, w) => sum + w.sanctionedCost, 0);
  const totalWorksDisbursed = filteredPanchayatWorks.reduce((sum, w) => sum + w.fundsDisbursed, 0);

  // IMD Monsoon Risk Assessment
  const monsoonRisk = useMemo(() => {
    return calculateMonsoonRisk(selectedPanchayat === 'ALL' ? 'Ranchi Sadar' : selectedPanchayat, filteredBeneficiaries);
  }, [selectedPanchayat, filteredBeneficiaries]);
  const [fastTrackTriggered, setFastTrackTriggered] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="flex-1 flex flex-col bg-slate-50 pb-12">
        {/* Administrative Header */}
        <AdminHeader />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* IMD Monsoon Hazard Predictive Weather Early-Warning Banner */}
        <MonsoonRiskBanner
          riskData={monsoonRisk}
          onTriggerFastTrack={() => setFastTrackTriggered(true)}
          fastTrackTriggered={fastTrackTriggered}
        />

        {/* Jan Soochna Public Social Audit Portal Banner */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Jan Soochna: Public Social Audit Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Sec 17 Mandate
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Open citizen vigilance register, verified stage photographs, and Gram Sabha community social audit transparency.
              </p>
            </div>
          </div>
          <Link
            href="/social-audit"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <span>Open Social Audit Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module Switcher Tabs: Rural Housing vs Panchayat Development Works */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('housing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'housing'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>PMAY-G Rural Housing ({filteredBeneficiaries.length} Houses)</span>
          </button>

          <button
            onClick={() => setActiveTab('panchayat_works')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'panchayat_works'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Gram Panchayat Development Works ({filteredPanchayatWorks.length} Projects)</span>
          </button>
        </div>

        {/* Executive KPI Cards - Housing View */}
        {activeTab === 'housing' ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Card 1: Total Sanctioned */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Sanctioned</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalSanctioned}</p>
              <p className="text-[11px] text-slate-500 mt-1">Houses in jurisdiction</p>
            </div>

            {/* Card 2: Completed Pucca Houses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Completed</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-700">{completedHouses}</p>
              <p className="text-[11px] text-slate-500 mt-1">100% verified &amp; handed over</p>
            </div>

            {/* Card 3: Under Construction */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Under Construction</span>
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{underConstruction}</p>
              <p className="text-[11px] text-slate-500 mt-1">Across 4 sequential stages</p>
            </div>

            {/* Card 4: Flagged Claims */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Duplicate / Flagged</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-700">{flaggedClaims}</p>
              <p className="text-[11px] text-rose-600 mt-1">Geofence &amp; Ration conflicts</p>
            </div>

            {/* Card 5: DBT Funds Released */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Direct Benefit (DBT)</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{(totalFundsReleased / 100000).toFixed(2)}L</p>
              <p className="text-[11px] text-emerald-700 mt-1">₹{totalFundsReleased.toLocaleString('en-IN')} disbursed</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Works */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Works Sanctioned</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalWorksSanctioned}</p>
              <p className="text-[11px] text-slate-500 mt-1">Panchayat infrastructure</p>
            </div>

            {/* Card 2: Commissioned */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Commissioned Works</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-700">{completedWorks}</p>
              <p className="text-[11px] text-slate-500 mt-1">Dedicated to public use</p>
            </div>

            {/* Card 3: Active Execution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Active Execution</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-800">{inProgressWorks}</p>
              <p className="text-[11px] text-slate-500 mt-1">Foundation to superstructure</p>
            </div>

            {/* Card 4: Expenditure */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Expenditure</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-700">₹{(totalWorksDisbursed / 100000).toFixed(2)}L</p>
              <p className="text-[11px] text-slate-500 mt-1">Sanctioned: ₹{(totalWorksCost / 100000).toFixed(2)}L</p>
            </div>
          </div>
        )}

        {/* Interactive GIS Geoportal Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  OpenStreetMap • Geotagged Visual Plotting
                </span>
                <Badge size="sm" variant="slate">
                  {filteredBeneficiaries.length} Plots Plotted
                </Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Gram Panchayat GIS Spatial Oversight Map
              </h2>
            </div>

            <div className="text-xs text-slate-500">
              Showing: <strong className="text-slate-900">{selectedPanchayat}</strong>
            </div>
          </div>

          {/* Dynamic Leaflet GIS Map */}
          <InteractiveGISMap
            beneficiaries={filteredBeneficiaries}
            filterPanchayat={selectedPanchayat}
            onSelectBeneficiary={(b) => setSelectedBeneficiary(b)}
          />
        </div>

        {/* Lower Grid: Beneficiary List & Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Beneficiary Master Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === 'housing' ? 'Beneficiary Stage Registry' : 'Panchayat Development Works Registry'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTab === 'housing' 
                    ? 'Real-time status across 4 sequential construction milestones'
                    : 'Physical & financial progress of Gram Panchayat community infrastructure'}
                </p>
              </div>
            </div>

            {activeTab === 'housing' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] bg-slate-50">
                      <th className="py-2.5 px-3">Beneficiary</th>
                      <th className="py-2.5 px-3">Panchayat / Village</th>
                      <th className="py-2.5 px-3">Current Stage</th>
                      <th className="py-2.5 px-3">DBT Released</th>
                      <th className="py-2.5 px-3">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBeneficiaries.map((b) => {
                      const isFlagged = b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{b.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{b.pmayId}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <p>{b.village}</p>
                            <p className="text-[11px] text-slate-400">{b.gramPanchayat.replace(' Gram Panchayat', '')}</p>
                          </td>
                          <td className="py-3 px-3">
                            <Badge size="sm" variant={`stage-${b.currentStage}`}>
                              {b.currentStage.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-700">
                            ₹{b.totalDbtReleased.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            {isFlagged ? (
                              <Badge size="sm" variant="flagged">
                                Flagged
                              </Badge>
                            ) : b.overallStatus === 'completed' ? (
                              <Badge size="sm" variant="completed">
                                Completed
                              </Badge>
                            ) : (
                              <Badge size="sm" variant="verified">
                                In Progress
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] bg-slate-50">
                      <th className="py-2.5 px-3">Work Title &amp; Code</th>
                      <th className="py-2.5 px-3">Panchayat / Scheme</th>
                      <th className="py-2.5 px-3">Milestone Stage</th>
                      <th className="py-2.5 px-3">Physical Progress</th>
                      <th className="py-2.5 px-3">Expenditure</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPanchayatWorks.map((work) => (
                      <tr key={work.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{work.title}</p>
                          <p className="text-[10px] text-blue-700 font-mono mt-0.5">{work.workCode}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <p>{work.village}, {work.gramPanchayat.replace(' Gram Panchayat', '')}</p>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{work.scheme}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="font-medium">{work.currentStage}</span>
                          <span className="text-[10px] text-slate-400 block">Agency: {work.executingAgency}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                              <span>{work.physicalProgressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  work.physicalProgressPercent === 100
                                    ? 'bg-emerald-500'
                                    : work.physicalProgressPercent > 50
                                    ? 'bg-blue-600'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${work.physicalProgressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">
                          ₹{work.fundsDisbursed.toLocaleString('en-IN')}
                          <span className="text-[10px] text-slate-400 block">of ₹{work.sanctionedCost.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge size="sm" variant={work.status === 'completed' ? 'completed' : 'verified'}>
                            {work.status === 'completed' ? 'Commissioned' : 'In Progress'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Real-time Audit Trail & Inspection Logs (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Audit Trail &amp; History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable event log of inspections &amp; DBTs
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {auditLogs.slice(0, 7).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span>{log.actor}</span>
                      <Badge size="sm" variant={log.badgeType === 'danger' ? 'flagged' : log.badgeType === 'success' ? 'verified' : 'slate'}>
                        {log.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminAuthGuard>
);
}
