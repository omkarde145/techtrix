'use client';

import React from 'react';
import { StageType, StageData } from '@/types';
import { Check, Clock, Lock, AlertCircle, Camera } from 'lucide-react';

interface StageTimelineProps {
  currentStage: StageType;
  stageHistory: Record<StageType, StageData>;
  onSelectStage?: (stage: StageType) => void;
  interactive?: boolean;
}

const STAGES: { type: StageType; label: string; installment: number; description: string }[] = [
  {
    type: 'foundation',
    label: 'Foundation',
    installment: 40000,
    description: 'Trench excavation & PCC footing'
  },
  {
    type: 'plinth',
    label: 'Plinth',
    installment: 45000,
    description: 'Plinth masonry up to 0.9m & DPC'
  },
  {
    type: 'lintel',
    label: 'Lintel',
    installment: 30000,
    description: 'Walls to 7ft & RCC lintel band'
  },
  {
    type: 'completion',
    label: 'Completion',
    installment: 15000,
    description: 'RCC roof, doors, windows & paint'
  }
];

export function StageTimeline({
  currentStage,
  stageHistory,
  onSelectStage,
  interactive = true
}: StageTimelineProps) {
  const getStageStatus = (stage: StageType, index: number) => {
    const data = stageHistory[stage];
    if (data?.status === 'approved') return 'approved';
    if (data?.status === 'submitted') return 'submitted';
    if (data?.status === 'rejected') return 'rejected';

    // Check if previous stage is approved
    if (index === 0) {
      return 'ready';
    }
    const prevStage = STAGES[index - 1].type;
    const prevStatus = stageHistory[prevStage]?.status;
    if (prevStatus === 'approved') {
      return 'ready';
    }
    return 'locked';
  };

  return (
    <div className="w-full py-2">
      {/* Horizontal on Desktop, Stepper grid on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAGES.map((s, idx) => {
          const status = getStageStatus(s.type, idx);
          const data = stageHistory[s.type];
          const isSelected = currentStage === s.type;

          const isClickable = interactive && (status === 'ready' || status === 'submitted' || status === 'approved' || status === 'rejected');

          return (
            <div
              key={s.type}
              onClick={() => isClickable && onSelectStage?.(s.type)}
              className={`relative rounded-xl p-3 border transition-all duration-200 ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              } ${
                isSelected
                  ? 'bg-teal-50/80 border-teal-500 shadow-sm ring-1 ring-teal-500'
                  : status === 'approved'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : status === 'submitted'
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                  : status === 'rejected'
                  ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              {/* Header: Stage Number & Status Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  STAGE 0{idx + 1}
                </span>

                {status === 'approved' && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                {status === 'submitted' && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3 h-3" />
                  </span>
                )}
                {status === 'rejected' && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 border border-red-300">
                    <AlertCircle className="w-3 h-3" />
                  </span>
                )}
                {status === 'ready' && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 animate-pulse">
                    <Camera className="w-3 h-3" />
                  </span>
                )}
                {status === 'locked' && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-400 border border-slate-300">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Stage Title */}
              <h4 className="text-sm font-bold text-slate-900">{s.label}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                {s.description}
              </p>

              {/* DBT Installment Amount Pill */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 text-[11px]">
                <span className="text-slate-500 font-medium">Instalment:</span>
                <span className="font-bold text-emerald-700 flex items-center">
                  ₹{s.installment.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Status Tag */}
              <div className="mt-2 text-[10px]">
                {status === 'approved' && (
                  <span className="text-emerald-700 font-bold">
                    ✓ Approved {data?.dbtReleased ? '(DBT Released)' : ''}
                  </span>
                )}
                {status === 'submitted' && (
                  <span className="text-amber-800 font-bold">
                    ⏳ Under Review
                  </span>
                )}
                {status === 'rejected' && (
                  <span className="text-red-700 font-bold">
                    ✕ Action Required
                  </span>
                )}
                {status === 'ready' && (
                  <span className="text-teal-800 font-bold">
                    ● Ready to Inspect
                  </span>
                )}
                {status === 'locked' && (
                  <span className="text-slate-400 font-medium">
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
