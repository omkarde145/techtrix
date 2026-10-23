'use client';

import React, { useState } from 'react';
import { FraudAlert, Beneficiary } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { 
  ShieldAlert, 
  MapPin, 
  CreditCard, 
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface FraudAlertWidgetProps {
  alert: FraudAlert;
  beneficiaries: Beneficiary[];
}

export function FraudAlertWidget({ alert, beneficiaries }: FraudAlertWidgetProps) {
  const { resolveFraudAlert } = useApp();
  const [remarks, setRemarks] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const primaryBen = beneficiaries.find(b => b.id === alert.beneficiaryId);
  const collidingBen = alert.collidingBeneficiaryId 
    ? beneficiaries.find(b => b.id === alert.collidingBeneficiaryId)
    : undefined;

  const handleResolve = async () => {
    if (!remarks.trim()) return;
    setIsResolving(true);
    try {
      await resolveFraudAlert(alert.id, remarks);
      setShowResolveModal(false);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      alert.resolved 
        ? 'bg-slate-50 border-slate-200 opacity-80' 
        : 'bg-red-50/40 border-red-200 shadow-xs'
    } p-5`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            alert.resolved 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {alert.type === 'geo_collision' ? (
              <MapPin className="w-5 h-5" />
            ) : alert.type === 'duplicate_ration_card' ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                {alert.type.replace('_', ' ')}
              </span>
              <Badge size="sm" variant={alert.resolved ? 'verified' : 'flagged'}>
                {alert.resolved ? 'Resolved' : `${alert.severity.toUpperCase()} RISK`}
              </Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500">
          <span>Detected: {new Date(alert.timestamp).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-700 my-3 leading-relaxed">
        {alert.description}
      </p>

      {/* Side-by-Side Comparison Box */}
      {collidingBen && primaryBen && (
        <div className="my-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          {/* Claim Under Investigation */}
          <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
            <span className="text-[10px] font-bold uppercase text-red-700 tracking-wider">
              Flagged Applicant
            </span>
            <h5 className="text-sm font-bold text-slate-900 mt-0.5">{primaryBen.name}</h5>
            <p className="text-xs text-slate-500">{primaryBen.pmayId}</p>

            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <p><strong>Village:</strong> {primaryBen.village}, {primaryBen.gramPanchayat}</p>
              <p><strong>Ration Card:</strong> <span className="font-mono text-amber-800 font-bold">{primaryBen.rationCardNo}</span></p>
              <p><strong>Cadastral Plot:</strong> <span className="text-teal-800 font-semibold">{primaryBen.khasraNo || 'N/A'}</span></p>
              <p><strong>GPS &amp; Altitude:</strong> {primaryBen.latitude.toFixed(5)}° N, {primaryBen.longitude.toFixed(5)}° E ({primaryBen.altitude || 340}m MSL)</p>
              <p><strong>DBT Disbursed:</strong> ₹{primaryBen.totalDbtReleased.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Existing Sanction / Collision Match */}
          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
              Conflicting Prior Record
            </span>
            <h5 className="text-sm font-bold text-slate-900 mt-0.5">{collidingBen.name}</h5>
            <p className="text-xs text-slate-500">{collidingBen.pmayId}</p>

            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <p><strong>Village:</strong> {collidingBen.village}, {collidingBen.gramPanchayat}</p>
              <p><strong>Ration Card:</strong> <span className="font-mono text-amber-800 font-bold">{collidingBen.rationCardNo}</span></p>
              <p><strong>Cadastral Plot:</strong> <span className="text-teal-800 font-semibold">{collidingBen.khasraNo || 'N/A'}</span></p>
              <p><strong>GPS &amp; Altitude:</strong> {collidingBen.latitude.toFixed(5)}° N, {collidingBen.longitude.toFixed(5)}° E ({collidingBen.altitude || 340}m MSL)</p>
              <p><strong>DBT Disbursed:</strong> <span className="text-emerald-700 font-semibold">₹{collidingBen.totalDbtReleased.toLocaleString('en-IN')}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Actions */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {alert.type === 'geo_collision'
            ? `3D Haversine: ${alert.distanceMeters || 8.2}m (Horizontal: ${alert.horizontalDistance || 8.2}m, Elevation: ${alert.elevationDeltaMeters || 0.2}m). Identical plot.`
            : 'Duplicate identity violation per PMAY-G operational guidelines'}
        </span>

        {!alert.resolved && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Adjudicate / Resolve</span>
          </button>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Adjudicate Fraud Alert: {alert.id}
              </h4>
              <p className="text-xs text-slate-500">
                Enter official inquiry findings or field verification notes to formally resolve or dismiss this risk flag.
              </p>
            </div>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Physical field inquiry verified distinct ancestral partition. Bound wall exists between plots."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-hidden focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600 transition-colors"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!remarks.trim() || isResolving}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
