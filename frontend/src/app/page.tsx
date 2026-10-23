'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers,
  IndianRupee,
  Globe,
  Search,
  Lock,
  Eye,
  Shield,
  FileCheck
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export default function HomePage() {
  const router = useRouter();
  const { 
    setRole, 
    beneficiaries, 
    isAuthenticatedInspector, 
    isAuthenticatedAdmin 
  } = useApp();

  const totalBeneficiaries = beneficiaries.length;
  const flaggedCount = beneficiaries.filter(b => b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved)).length;
  const totalDbt = beneficiaries.reduce((acc, b) => acc + b.totalDbtReleased, 0);

  const handleInspectorAccess = () => {
    if (isAuthenticatedInspector) {
      setRole('field');
      router.push('/field');
    } else {
      router.push('/login?role=inspector');
    }
  };

  const handleAdminAccess = () => {
    if (isAuthenticatedAdmin) {
      setRole('admin');
      router.push('/admin');
    } else {
      router.push('/login?role=admin');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-4 py-6 sm:py-10">
      {/* Top National Branding Strip */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        {/* Official Brand Logo */}
        <div className="flex justify-center">
          <img src="/logo.png" alt="GraminVikas Logo" className="h-20 sm:h-28 w-auto object-contain drop-shadow-sm" />
        </div>

        {/* Tricolor Accent Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-800 font-bold">Ministry of Rural Development</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-700 font-semibold">Government of India</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Pradhan Mantri Awaas Yojana - Gramin
          <span className="block text-blue-700 text-xl sm:text-3xl md:text-4xl mt-1 font-extrabold">
            Digital Monitoring &amp; Panchayat Works Platform
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Official national platform powering mobile field inspections with offline geotagging, executive BDO stage approval with PFMS Direct Benefit Transfer, and public citizen case tracking.
        </p>

        {/* Live Operational Metrics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span><strong>{totalBeneficiaries}</strong> Beneficiaries</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span><strong>₹{totalDbt.toLocaleString('en-IN')}</strong> DBT Released</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span><strong>100%</strong> Geofenced Audit</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span><strong>{flaggedCount}</strong> Deduplication Flags</span>
          </div>
        </div>
      </div>

      {/* Main Deployment Module Cards (3 Portals) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
        {/* Module 1: Mobile Field Inspector App */}
        <div 
          onClick={handleInspectorAccess}
          className="group relative rounded-2xl bg-white border border-slate-200 p-6 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Staff Authentication
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Field Inspector Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                AwaasApp Handheld Mobile Inspection Console
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Designed for handheld mobile use on rural construction sites with or without internet connectivity.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>4-Stage Inspections:</strong> Foundation to Roof</span>
              </li>
              <li className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Tamper-Proof Geotag:</strong> GPS + ECDSA seal</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>Offline Sync:</strong> Dual-tier IndexedDB queue</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all group-hover:gap-3 cursor-pointer">
              <span>{isAuthenticatedInspector ? 'Open Field Console' : 'Inspector Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module 2: BDO / Administrative Portal */}
        <div 
          onClick={handleAdminAccess}
          className="group relative rounded-2xl bg-white border border-slate-200 p-6 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                DSC e-Token Required
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                BDO Oversight &amp; DBT
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Executive Desktop &amp; Tablet Administration
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Administrative dashboard for Block Development Officers to audit inspections and release PFMS DBT subsidies.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>3-Tier Maker-Checker:</strong> JE Clearance &amp; BDO DSC</span>
              </li>
              <li className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>PFMS XML DBT:</strong> APBS Direct Subsidy Batch</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Anti-Fraud Engine:</strong> 3D Geofence Deduplication</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all group-hover:gap-3 cursor-pointer">
              <span>{isAuthenticatedAdmin ? 'Open BDO Portal' : 'BDO Admin Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module 3: Citizen / Regular User Dashboard */}
        <Link
          href="/citizen"
          className="group relative rounded-2xl bg-white border border-slate-200 p-6 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Read-Only Public
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Citizen Tracking Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Open Access for Rural Beneficiaries &amp; Citizens
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Public dashboard for citizens to check their housing sanction status, subsidy disbursement, and village works.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Application Tracking:</strong> Search by PMAY ID or Name</span>
              </li>
              <li className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>View Inspection Photos:</strong> Read-only stage evidence</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Panchayat Works:</strong> Village roads, solar &amp; sanitation</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all group-hover:gap-3 cursor-pointer">
              <span>Open Citizen Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Official Government Compliance Footer */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Shield className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            Compliant with Section 17 Social Audit (PMAY-G Guidelines), DPDP Act 2023, and PFMS Direct Benefit Transfer Standards.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">
          GraminVikas 360 v2.0 • MoRD
        </span>
      </div>
    </div>
  );
}
