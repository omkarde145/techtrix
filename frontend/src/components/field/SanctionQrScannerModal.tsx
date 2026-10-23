'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Beneficiary } from '@/types';
import { 
  QrCode, 
  X, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface SanctionQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: Beneficiary[];
}

export function SanctionQrScannerModal({
  isOpen,
  onClose,
  beneficiaries
}: SanctionQrScannerModalProps) {
  const router = useRouter();
  const [scannedResult, setScannedResult] = useState<Beneficiary | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setScannerError(null);
    setIsInitializing(true);
    stopCamera();

    try {
      if (typeof window === 'undefined') return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access requires HTTPS or localhost on modern browsers.');
      }

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      const constraintAttempts: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        { video: true, audio: false }
      ];

      for (const constraints of constraintAttempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (!stream) {
        throw lastErr || new Error('Camera stream unavailable');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Playback notice:', playErr);
        }
        setCameraActive(true);
        setScannerError(null);
      } else {
        setCameraActive(true);
      }
    } catch {
      setScannerError('Camera stream restricted or permission pending. Select a sample below for instant QR decoding.');
      setCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleSelectSampleQr = (ben: Beneficiary) => {
    setScannedResult(ben);
  };

  const handleProceedToInspection = (benId: string) => {
    stopCamera();
    onClose();
    router.push(`/field/inspect/${benId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scan Sanction Order QR Code</h3>
              <p className="text-[11px] text-slate-500">Auto-lookup beneficiary from official PMAY-G letter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-square max-h-64 bg-slate-950 border-2 border-teal-500/40 flex items-center justify-center shadow-inner">
            {/* Always mounted video element ensures videoRef.current is never null! */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              onLoadedMetadata={() => {
                if (videoRef.current && streamRef.current) {
                  videoRef.current.play().catch(() => {});
                  setCameraActive(true);
                  setScannerError(null);
                }
              }}
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {!cameraActive && (
              <div className="text-center p-4 text-slate-400 z-10">
                <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs max-w-xs mx-auto mb-2">{scannerError || (isInitializing ? 'Connecting camera...' : 'Starting QR scanner viewfinder...')}</p>
                <button
                  onClick={startCamera}
                  disabled={isInitializing}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isInitializing ? 'animate-spin' : ''}`} />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Reticle Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-teal-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
              <span className="text-[10px] bg-slate-900/90 text-teal-300 px-3 py-1 rounded-full border border-teal-800/60 backdrop-blur-sm">
                Align PMAY-G Sanction Barcode / QR Code
              </span>
            </div>
          </div>

          {/* Scanned Match Result Card */}
          {scannedResult ? (
            <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Sanction Letter Decoded</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{scannedResult.name}</h4>
                  <p className="text-xs text-slate-600">{scannedResult.targetAddress}, {scannedResult.village}</p>
                </div>
                <Badge size="sm" variant={`stage-${scannedResult.currentStage}`}>
                  {scannedResult.currentStage.toUpperCase()}
                </Badge>
              </div>

              <div className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-teal-200 flex justify-between shadow-xs">
                <span>PMAY ID: {scannedResult.pmayId}</span>
                <span className="text-teal-800 font-bold">ULPIN: {scannedResult.ulpin || 'ULP-JH-829101'}</span>
              </div>

              <button
                onClick={() => handleProceedToInspection(scannedResult.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <span>Launch Stage Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Quick Scan (Field Test Samples)</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {beneficiaries.slice(0, 3).map((ben) => (
                  <button
                    key={ben.id}
                    onClick={() => handleSelectSampleQr(ben)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 text-left flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {ben.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ben.pmayId} • {ben.village}
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      Simulate Scan
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
