'use client';

import React from 'react';
import { CheckCircle2, XCircle, Droplets, Zap, Sun, ShieldCheck } from 'lucide-react';
import { ConvergenceMatrix } from '@/types';

interface ConvergenceMatrixWidgetProps {
  convergence?: ConvergenceMatrix;
  onToggle?: (key: keyof ConvergenceMatrix) => void;
  readOnly?: boolean;
}

export function ConvergenceMatrixWidget({
  convergence,
  onToggle,
  readOnly = true,
}: ConvergenceMatrixWidgetProps) {
  const current: ConvergenceMatrix = convergence || {
    sbmGToiletGeotagged: true,
    sbmGIncentiveAmount: 12000,
    jalJeevanTapConnected: true,
    saubhagyaElectricityMeter: true,
    pmSuryaGharSolarEligible: true,
    allConvergencesMet: true,
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Single-Window Welfare Convergence Matrix</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
          4 Schemes Linked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* SBM-G Toilet */}
        <div 
          onClick={() => !readOnly && onToggle && onToggle('sbmGToiletGeotagged')}
          className={`p-2.5 rounded-lg border transition-all ${
            current.sbmGToiletGeotagged 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : 'bg-white border-slate-200 text-slate-400'
          } ${!readOnly ? 'cursor-pointer hover:border-emerald-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">🚾</span>
            {current.sbmGToiletGeotagged ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <p className="font-bold text-[11px] text-slate-900">SBM-G Toilet</p>
          <p className="text-[10px] text-emerald-700 font-mono font-medium">+₹12,000 Linked</p>
        </div>

        {/* Jal Jeevan Mission */}
        <div 
          onClick={() => !readOnly && onToggle && onToggle('jalJeevanTapConnected')}
          className={`p-2.5 rounded-lg border transition-all ${
            current.jalJeevanTapConnected 
              ? 'bg-blue-50/80 border-blue-200 text-blue-800' 
              : 'bg-white border-slate-200 text-slate-400'
          } ${!readOnly ? 'cursor-pointer hover:border-blue-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-700" />
            {current.jalJeevanTapConnected ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <p className="font-bold text-[11px] text-slate-900">Jal Jeevan Mission</p>
          <p className="text-[10px] text-blue-700 font-medium">Piped Tap Water</p>
        </div>

        {/* Saubhagya Electricity */}
        <div 
          onClick={() => !readOnly && onToggle && onToggle('saubhagyaElectricityMeter')}
          className={`p-2.5 rounded-lg border transition-all ${
            current.saubhagyaElectricityMeter 
              ? 'bg-amber-50/80 border-amber-200 text-amber-800' 
              : 'bg-white border-slate-200 text-slate-400'
          } ${!readOnly ? 'cursor-pointer hover:border-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            {current.saubhagyaElectricityMeter ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <p className="font-bold text-[11px] text-slate-900">Saubhagya</p>
          <p className="text-[10px] text-amber-700 font-medium">Meter Seeded</p>
        </div>

        {/* PM Surya Ghar Solar */}
        <div 
          onClick={() => !readOnly && onToggle && onToggle('pmSuryaGharSolarEligible')}
          className={`p-2.5 rounded-lg border transition-all ${
            current.pmSuryaGharSolarEligible 
              ? 'bg-purple-50/80 border-purple-200 text-purple-800' 
              : 'bg-white border-slate-200 text-slate-400'
          } ${!readOnly ? 'cursor-pointer hover:border-purple-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Sun className="w-3.5 h-3.5 text-purple-600" />
            {current.pmSuryaGharSolarEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <p className="font-bold text-[11px] text-slate-900">PM Surya Ghar</p>
          <p className="text-[10px] text-purple-700 font-medium">Solar Eligible</p>
        </div>
      </div>
    </div>
  );
}
