'use client';

import React, { useState } from 'react';
import { Scan, CheckCircle2, UserCheck, X, Camera, AlertTriangle } from 'lucide-react';
import { Beneficiary, PlaqueOcrResult } from '@/types';
import { detectPlaqueAndCoPresence } from '@/lib/engines/plaqueOcrEngine';

interface PlaqueOcrScannerModalProps {
  beneficiary: Beneficiary;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: PlaqueOcrResult) => void;
  imageSrc?: string | null;
}

export function PlaqueOcrScannerModal({
  beneficiary,
  isOpen,
  onClose,
  onVerified,
  imageSrc,
}: PlaqueOcrScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PlaqueOcrResult | null>(null);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const result = await detectPlaqueAndCoPresence(beneficiary, imageSrc || undefined);
      setScanResult(result);
      setIsScanning(false);
      onVerified(result);
    } catch(e) {
      setIsScanning(false);
    }
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
              <p className="text-[11px] text-slate-500">Verifies scheme plaque &amp; citizen physical presence</p>
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
        <div className="relative aspect-video rounded-xl bg-slate-900 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center p-4 overflow-hidden">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Inspection Source" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            /* Yellow Plaque Graphic Representation */
            <div className="w-48 p-2.5 rounded-lg bg-amber-300 text-slate-900 font-bold text-center border-2 border-amber-500 shadow-sm space-y-0.5 relative z-10">
              <p className="text-[9px] uppercase tracking-wider font-black text-amber-950">PMAY-G • भारत सरकार</p>
              <p className="text-xs font-black tracking-wide text-slate-950">{beneficiary.pmayId}</p>
              <p className="text-[9px] font-semibold text-slate-800">{beneficiary.name} • {beneficiary.gramPanchayat}</p>
            </div>
          )}

          {/* Scanning laser animation */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400 animate-pulse top-1/2 -translate-y-1/2 z-20" />
          )}

          <div className="mt-2.5 text-center text-xs text-slate-200 relative z-10 bg-slate-900/80 px-3 py-1 rounded-full">
            {isScanning ? (
              <span className="text-amber-300 font-bold animate-pulse">Analyzing pixel skin tones &amp; facial landmarks...</span>
            ) : (
              <span>{imageSrc ? 'Photo loaded. Click below to analyze human presence & plaque.' : 'Align camera to the yellow wall plaque and beneficiary'}</span>
            )}
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${scanResult.beneficiaryFaceDetected ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Citizen Co-Presence:</span>
              <span className={`font-bold flex items-center gap-1 ${scanResult.beneficiaryFaceDetected ? 'text-emerald-700' : 'text-red-600'}`}>
                {scanResult.beneficiaryFaceDetected ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified ({scanResult.coPresenceScore}%)
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-red-600" />
                    NOT DETECTED (No Human Face)
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Wall Plaque Match:</span>
              <span className={`font-bold flex items-center gap-1 ${scanResult.plaqueDetected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {scanResult.plaqueDetected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Detected ({scanResult.matchScore}%)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Plaque Not Found (0%)
                  </>
                )}
              </span>
            </div>

            <p className={`text-[11px] pt-2 border-t ${scanResult.beneficiaryFaceDetected ? 'text-emerald-800 border-emerald-200' : 'text-red-700 font-medium border-red-200'}`}>
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
              <span>{isScanning ? 'Analyzing Facial Features & Plaque...' : 'Scan Photo for Beneficiary & Plaque'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                scanResult.beneficiaryFaceDetected ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{scanResult.beneficiaryFaceDetected ? 'Confirm & Attach Verified Co-Presence' : 'Acknowledge Result & Close'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
