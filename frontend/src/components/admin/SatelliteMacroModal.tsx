'use client';

import React from 'react';
import { Satellite, X, CheckCircle2, TrendingDown, TrendingUp, Layers, Globe } from 'lucide-react';
import { Beneficiary } from '@/types';
import { getSatelliteMacroVerification } from '@/lib/engines/satelliteEngine';

interface SatelliteMacroModalProps {
  beneficiary: Beneficiary;
  isOpen: boolean;
  onClose: () => void;
}

export function SatelliteMacroModal({ beneficiary, isOpen, onClose }: SatelliteMacroModalProps) {
  if (!isOpen) return null;

  const satData = getSatelliteMacroVerification(
    beneficiary.pmayId,
    beneficiary.latitude,
    beneficiary.longitude,
    beneficiary.currentStage
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Satellite className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">ISRO Bhuvan &amp; Sentinel-2 Remote Sensing</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Macro Check
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Orbital vegetation index &amp; SAR backscatter ground truthing
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Parcel Metadata */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Cadastral Parcel ID</span>
            <p className="font-mono text-slate-900 font-bold">{satData.parcelId}</p>
            <p className="text-[11px] text-slate-600">{beneficiary.village}, {beneficiary.gramPanchayat}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Orbital Sensor Source</span>
            <p className="text-blue-700 font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              {satData.satelliteProvider} (C-Band SAR)
            </p>
            <p className="text-[11px] text-slate-500">Overpass: {satData.lastOverpassDate}</p>
          </div>
        </div>

        {/* Visual Imagery Comparison (Pre vs Post Sanction) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pre-Sanction Tile */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Pre-Sanction (Fallow / Bush)</span>
            <div className="aspect-square rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <Layers className="w-8 h-8 text-emerald-600 mb-1 z-10" />
              <span className="text-[11px] font-bold text-emerald-800 z-10">Dense Greenery</span>
              <span className="text-[10px] font-mono text-emerald-700 z-10 font-semibold">NDVI: {satData.preSanctionNdvi}</span>
            </div>
          </div>

          {/* Post-Sanction Tile */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Current Milestone Overpass</span>
            <div className="aspect-square rounded-xl bg-blue-50 border border-blue-200 p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-12 h-12 bg-white border-2 border-amber-500 shadow-sm rotate-6 z-10 flex items-center justify-center rounded">
                <span className="text-[10px] font-black text-amber-800">25m²</span>
              </div>
              <span className="text-[11px] font-bold text-blue-900 z-10 mt-1">Built-Up Hard Surface</span>
              <span className="text-[10px] font-mono text-blue-700 z-10 font-semibold">NDVI: {satData.postSanctionNdvi}</span>
            </div>
          </div>
        </div>

        {/* Radar & Change Metrics */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Vegetation Drop (Ground Clearing):</span>
            <span className="font-bold text-amber-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              {Math.round((satData.preSanctionNdvi - satData.postSanctionNdvi) * 100)}% NDVI Drop
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Radar Backscatter (Hard Masonry Corner):</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              +{satData.radarBackscatterDeltaDb} dB Structural Reflection
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-bold">Physical Structure Confirmed:</span>
            <span className="font-black text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              YES ({satData.confidenceScore}% Satellite Confidence)
            </span>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
        >
          Close Satellite Verification Viewer
        </button>
      </div>
    </div>
  );
}
