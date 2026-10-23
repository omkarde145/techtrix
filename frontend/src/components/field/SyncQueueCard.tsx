'use client';

import React from 'react';
import { SyncRecord } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Database 
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface SyncQueueCardProps {
  record: SyncRecord;
  onRetry?: (record: SyncRecord) => void;
}

export function SyncQueueCard({ record }: SyncQueueCardProps) {
  const { isOnline, syncPendingQueue, isSyncing } = useApp();
  const inspection = record.payload;

  const formattedDate = new Date(record.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Thumbnail & details */}
        <div className="flex items-start gap-3">
          {/* Photo Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {inspection.watermarkedPhotoUrl || inspection.photoUrl ? (
              <img
                src={inspection.watermarkedPhotoUrl || inspection.photoUrl}
                alt="Stage thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Database className="w-6 h-6" />
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-center font-bold text-teal-300 uppercase py-0.5">
              {record.stage}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                {inspection.beneficiaryName}
              </h4>
              <Badge size="sm" variant="slate">
                {inspection.pmayId}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {inspection.latitude.toFixed(4)}° N, {inspection.longitude.toFixed(4)}° E
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>

            {inspection.notes && (
              <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">
                &ldquo;{inspection.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Right: Sync Status & Actions */}
        <div className="flex flex-col sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            {record.status === 'synced' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Synced with Central Portal
              </span>
            )}
            {record.status === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Syncing ({record.progress || 35}%)...
              </span>
            )}
            {record.status === 'pending' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                Saved Locally (Offline)
              </span>
            )}
            {record.status === 'failed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                Sync Failed
              </span>
            )}

            {record.status === 'pending' && (
              <button
                onClick={() => syncPendingQueue()}
                disabled={!isOnline || isSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title={!isOnline ? 'Network offline; reconnect to sync' : 'Sync this record now'}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Sync' : 'Offline'}</span>
              </button>
            )}
          </div>

          {/* Dual-Tier Sync Telemetry Badges */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className={`px-2 py-0.5 rounded border ${
              record.status === 'synced' || record.dualTierProgress?.tier1Synced
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              Tier 1 Telemetry: {record.status === 'synced' || record.dualTierProgress?.tier1Synced ? 'Uploaded' : 'Queued'}
            </span>

            <span className={`px-2 py-0.5 rounded border ${
              record.status === 'synced' || record.dualTierProgress?.tier2Synced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              Tier 2 Archival: {record.status === 'synced' ? 'Uploaded' : 'Queued'}
            </span>
          </div>

          {/* Progress bar if syncing */}
          {record.status === 'syncing' && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200 mt-1">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${record.progress || 35}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
