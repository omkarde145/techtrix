'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { FraudAlertWidget } from '@/components/admin/FraudAlertWidget';
import { FraudAlert } from '@/types';
import { 
  ShieldAlert, 
  MapPin, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export default function AntiFraudControlPage() {
  const { beneficiaries, selectedPanchayat } = useApp();

  // Aggregate all fraud alerts
  const alertsList = useMemo(() => {
    const list: FraudAlert[] = [];
    beneficiaries.forEach((b) => {
      if (selectedPanchayat !== 'ALL' && b.gramPanchayat !== selectedPanchayat) {
        return;
      }
      b.flags.forEach((f) => {
        list.push(f);
      });
    });
    return list;
  }, [beneficiaries, selectedPanchayat]);

  const activeAlerts = alertsList.filter(a => !a.resolved);
  const resolvedAlerts = alertsList.filter(a => a.resolved);

  return (
    <AdminAuthGuard>
      <div className="flex-1 flex flex-col bg-slate-50 pb-16">
        <AdminHeader />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Anti-Fraud Banner */}
        <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Automated Verification &amp; Integrity Guard
              </span>
              <Badge size="sm" variant={activeAlerts.length > 0 ? 'flagged' : 'verified'}>
                {activeAlerts.length} Active Collisions
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Anti-Fraud &amp; Deduplication Control Center
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Cross-checks applicant coordinates for 15-meter proximity collisions and matches Ration Card / Family IDs to prevent double subsidies and ghost structures.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500">Total Scanned</span>
              <p className="text-base font-bold text-slate-900">{beneficiaries.length} Plots</p>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] text-rose-700 font-medium">Risk Flags</span>
              <p className="text-base font-bold text-rose-700">{activeAlerts.length}</p>
            </div>
          </div>
        </div>

        {/* Engine Mechanism Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Geofencing Engine */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>15m Geofence Collision</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              3D Haversine formula flags claims within 15 meters on identical cadastral plots without legal homestead partitions.
            </p>
          </div>

          {/* Card 2: Ration Card Matching */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>Duplicate Household Claims</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-matches NFSA Ration Card and Family Member IDs to enforce strict one-pucca-house-per-family rules.
            </p>
          </div>

          {/* Card 3: Prior Scheme Benefits */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Prior Welfare Benefits</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-checks Indira Awaas Yojana (IAY) &amp; State Housing databases to prevent double-dipping from past schemes.
            </p>
          </div>

          {/* Card 4: Ineligible Family Members */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Ineligible Family Members</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates SECC 2011 exclusion criteria: government salaried employment, commercial 4-wheelers, or pucca roof ownership.
            </p>
          </div>
        </div>

        {/* List of Detected Fraud Collisions */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
            Active Integrity Flags &amp; Collision Reports ({alertsList.length})
          </h3>

          {alertsList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Zero Integrity Collisions Detected</h4>
              <p className="text-xs text-slate-500">All registered plots adhere to geofencing and deduplication rules.</p>
            </div>
          ) : (
            alertsList.map((alert) => (
              <FraudAlertWidget
                key={alert.id}
                alert={alert}
                beneficiaries={beneficiaries}
              />
            ))
          )}
        </div>
      </div>
      </div>
    </AdminAuthGuard>
  );
}
