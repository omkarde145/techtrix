'use client';

import React, { useState } from 'react';
import { Scan, CheckCircle2, UserCheck, X, Camera } from 'lucide-react';
import { Beneficiary, PlaqueOcrResult } from '@/types';
import { simulatePlaqueAndCoPresenceOcr } from '@/lib/engines/plaqueOcrEngine';

interface PlaqueOcrScannerModalProps {
  beneficiary: Beneficiary;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: PlaqueOcrResult) => void;
}

export function PlaqueOcrScannerModal({
  beneficiary,
  isOpen,
  onClose,
  onVerified,
}: PlaqueOcrScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PlaqueOcrResult | null>(null);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = simulatePlaqueAndCoPresenceOcr(beneficiary);
      setScanResult(result);
      setIsScanning(false);
      onVerified(result);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Scan className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Wall Plaque OCR &amp; Co-Presence Scanner</h3>
              <p className="text-[11px] text-slate-500">Verifies scheme plaque &amp; citizen presence</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Preview Box */}
        <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Simulated scanning laser animation */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-lg shadow-amber-500 animate-pulse top-1/2 -translate-y-1/2" />
          )}

          {/* Yellow Plaque Graphic Representation */}
          <div className="w-48 p-2.5 rounded-lg bg-amber-300 text-slate-900 font-bold text-center border-2 border-amber-500 shadow-sm space-y-0.5">
            <p className="text-[9px] uppercase tracking-wider font-black text-amber-950">PMAY-G • भारत सरकार</p>
            <p className="text-xs font-black tracking-wide text-slate-950">{beneficiary.pmayId}</p>
            <p className="text-[9px] font-semibold text-slate-800">{beneficiary.name} • {beneficiary.gramPanchayat}</p>
          </div>

          <div className="mt-2.5 text-center text-xs text-slate-500">
            {isScanning ? (
              <span className="text-amber-800 font-bold animate-pulse">Scanning wall plaque &amp; facial features...</span>
            ) : (
              <span>Align camera to the yellow wall plaque and beneficiary</span>
            )}
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Plaque ID Match:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {scanResult.extractedPmayId} ({scanResult.matchScore}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Citizen Co-Presence:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified ({scanResult.coPresenceScore}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200">
              {scanResult.notes}
            </p>
          </div>
        )}

        {/* Trigger Button */}
        <div className="flex gap-2 pt-1">
          {!scanResult ? (
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Processing OCR & Face Mesh...' : 'Scan Wall Plaque & Citizen'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Attach Co-Presence Artifact</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
