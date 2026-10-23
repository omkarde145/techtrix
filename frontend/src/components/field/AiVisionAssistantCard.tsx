'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Cpu, 
  Eye, 
  ShieldCheck,
  Check,
  Layers
} from 'lucide-react';
import { AiVisionAnalysisResult } from '@/types';

interface AiVisionAssistantCardProps {
  analysis: AiVisionAnalysisResult;
  isAnalyzing?: boolean;
}

export function AiVisionAssistantCard({ analysis }: AiVisionAssistantCardProps) {
  const isMatch = analysis.stageMatch ?? (analysis.detectedStage === analysis.targetStage);

  return (
    <div className={`p-4 rounded-2xl border text-xs space-y-3 shadow-xs transition-all ${
      isMatch 
        ? 'bg-emerald-50/70 border-emerald-300 text-slate-800' 
        : 'bg-amber-50 border-amber-300 text-slate-900'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold">
          <Cpu className={`w-4 h-4 ${isMatch ? 'text-emerald-700' : 'text-amber-700'} animate-pulse`} />
          <span className={isMatch ? 'text-emerald-950' : 'text-amber-950'}>
            Edge AI Stage Classifier (TensorFlow.js WASM)
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
          isMatch 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
            : 'bg-amber-100 text-amber-900 border-amber-300'
        }`}>
          {isMatch ? '✓ Verified Match' : '⚠️ Stage Discrepancy'}
        </span>
      </div>

      {/* Discrepancy Warning Banner if Mismatch */}
      {!isMatch && analysis.targetStage && (
        <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Stage Mismatch Detected by Visual Model</p>
            <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
              Photo matches <strong className="uppercase font-mono">{analysis.detectedStage}</strong> stage, but inspection is being filed for <strong className="uppercase font-mono">{analysis.targetStage}</strong>. Please confirm before submitting.
            </p>
          </div>
        </div>
      )}

      {/* Detected Stage vs Claimed Target & Confidence */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            AI Detected Stage
          </span>
          <p className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5 mt-0.5">
            <span className={isMatch ? 'text-emerald-600' : 'text-amber-600'}>●</span>
            <span>{analysis.detectedStage} Stage</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Confidence Score
          </span>
          <p className="text-sm font-black text-emerald-700 mt-0.5">
            {analysis.confidencePercent}%
          </p>
        </div>
      </div>

      {/* Structural Checklist */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block">
          Structural Feature Verification:
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
            {analysis.structuralChecklist.rebarDetected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={analysis.structuralChecklist.rebarDetected ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
              TMT Rebar / Sariya
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
            {analysis.structuralChecklist.brickMasonryDetected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={analysis.structuralChecklist.brickMasonryDetected ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
              Brick Bond Masonry
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
            {analysis.structuralChecklist.curedConcreteBeamDetected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={analysis.structuralChecklist.curedConcreteBeamDetected ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
              Concrete Tie-Beam
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
            {analysis.structuralChecklist.roofSlabDetected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={analysis.structuralChecklist.roofSlabDetected ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
              RCC Flat Roof Slab
            </span>
          </div>
        </div>
      </div>

      {/* Clarity & Anti-Glare Guard */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-600">Photo Clarity Score:</span>
          <strong className="text-slate-900">{analysis.clarityScore}/100</strong>
        </div>
        {analysis.glareDetected ? (
          <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Harsh Glare
          </span>
        ) : (
          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Glare Optimal
          </span>
        )}
      </div>

      {/* Analysis Summary */}
      <p className="text-[11px] text-slate-600 italic leading-snug">
        &ldquo;{analysis.analysisSummary}&rdquo;
      </p>
    </div>
  );
}
