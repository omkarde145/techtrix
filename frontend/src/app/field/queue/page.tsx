'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  Database, 
  CloudUpload, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  HardDrive,
  AlertTriangle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SyncQueueCard } from '@/components/field/SyncQueueCard';
import { MobileBottomNav } from '@/components/field/MobileBottomNav';
import { Badge } from '@/components/common/Badge';

export default function OfflineQueuePage() {
  const router = useRouter();
  const { syncQueue, isOnline, syncPendingQueue, isSyncing, storageQuota } = useApp();

  const pendingCount = syncQueue.filter(q => q.status === 'pending').length;
  const syncedCount = syncQueue.filter(q => q.status === 'synced').length;

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto pb-28 sm:pb-12 px-3 sm:px-6 pt-3">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/field')}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspections</span>
        </button>

        <Badge size="sm" variant={isOnline ? 'verified' : 'pending'}>
          {isOnline ? 'Online Sync Active' : 'Offline Mode (Queueing)'}
        </Badge>
      </div>

      {/* Queue Executive Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  IndexedDB Local Storage Queue
                </h2>
                <Badge size="sm" variant="verified">ECDSA Signed</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                All inspections captured with zero internet are compressed and signed with device cryptographic keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => syncPendingQueue()}
              disabled={!isOnline || pendingCount === 0 || isSyncing}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Batch...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Sync Pending ({pendingCount})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
            <span className="text-slate-500 text-[11px]">Total Queued</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{syncQueue.length}</p>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/80">
            <span className="text-amber-800 text-[11px] font-medium">Pending Sync</span>
            <p className="text-sm font-bold text-amber-700 mt-0.5">{pendingCount}</p>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200/80">
            <span className="text-emerald-800 text-[11px] font-medium">Synced to Portal</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">{syncedCount}</p>
          </div>
        </div>
      </div>

      {/* Storage Quota & Optimization Pill */}
      {storageQuota && (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <HardDrive className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              IndexedDB Storage: <strong className="text-slate-900">{storageQuota.formattedUsage}</strong> used of {storageQuota.formattedQuota} ({storageQuota.percentUsed}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Eviction Guard: Active</span>
            </span>
            <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <Zap className="w-3 h-3 text-blue-700" />
              <span>1080p WebP</span>
            </span>
          </div>
        </div>
      )}

      {/* Advisory Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-4 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950">
            Background Upload Advisory
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            When returning from low-network zones, keep this web app open in your mobile browser until the upload progress finishes.
          </p>
        </div>
      </div>

      {/* List of Offline Queue Records */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
          Inspection Records in Buffer ({syncQueue.length})
        </h3>

        {syncQueue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-600 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Queue is Fully Synced</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No pending inspections waiting to upload. All captured milestones have been recorded.
              </p>
            </div>
          </div>
        ) : (
          syncQueue.map((item) => (
            <SyncQueueCard key={item.id} record={item} />
          ))
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
