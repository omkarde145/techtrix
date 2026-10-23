'use client';

import React from 'react';
import { CloudRain, CheckCircle2, Zap } from 'lucide-react';
import { MonsoonRiskAssessment } from '@/types';

interface MonsoonRiskBannerProps {
  riskData: MonsoonRiskAssessment;
  onTriggerFastTrack?: () => void;
  fastTrackTriggered?: boolean;
}

export function MonsoonRiskBanner({
  riskData,
  onTriggerFastTrack,
  fastTrackTriggered = false,
}: MonsoonRiskBannerProps) {
  if (riskData.vulnerableHousesCount === 0 && !fastTrackTriggered) {
    return null;
  }

  const isCritical = riskData.riskLevel === 'CRITICAL' || riskData.riskLevel === 'HIGH';

  return (
    <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
      fastTrackTriggered
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : isCritical
        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            fastTrackTriggered
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
          }`}>
            {fastTrackTriggered ? <CheckCircle2 className="w-5 h-5" /> : <CloudRain className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                fastTrackTriggered
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {fastTrackTriggered ? 'FAST-TRACK DBT ACTIVE' : `IMD WEATHER ALERT: ${riskData.riskLevel} RISK`}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {riskData.blockName} Early-Warning
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {fastTrackTriggered ? (
                <span className="text-emerald-800 font-medium">
                  ✓ Pre-monsoon fast-track DBT approved for {riskData.vulnerableHousesCount} vulnerable houses. Funds released to avert monsoon brickwork erosion!
                </span>
              ) : (
                <span>
                  <strong>{riskData.vulnerableHousesCount} houses</strong> at Foundation/Plinth. Heavy rains ({riskData.expectedRainfallMm}mm) forecast in <strong>{riskData.daysUntilMonsoonArrival} days</strong>. Fast-track approvals to roof before rain!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 1-Click Fast-Track Action Button */}
        {onTriggerFastTrack && !fastTrackTriggered && (
          <button
            onClick={onTriggerFastTrack}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Fast-Track Pre-Monsoon DBT</span>
          </button>
        )}
      </div>
    </div>
  );
}
