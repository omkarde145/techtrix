'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Wifi, WifiOff, RefreshCw, Database, CloudUpload, ShieldCheck, Sun, Languages } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/i18n/translations';

export function NetworkStatusBanner() {
  const { 
    isOnline, 
    isSimulatedOffline, 
    toggleSimulateOffline, 
    syncQueue, 
    syncPendingQueue, 
    isSyncing,
    language,
    setLanguage,
    sunlightMode,
    toggleSunlightMode
  } = useApp();

  const t = TRANSLATIONS[language];
  const pendingCount = syncQueue.filter(q => q.status === 'pending').length;
  const syncingCount = syncQueue.filter(q => q.status === 'syncing').length;

  return (
    <div 
      className={`w-full py-1.5 px-3 sm:px-6 transition-colors duration-300 border-b flex flex-wrap items-center justify-between text-xs gap-2 select-none shadow-xs ${
        sunlightMode
          ? 'bg-amber-100 text-black border-black font-semibold'
          : !isOnline
          ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-white text-slate-700 border-slate-200'
      }`}
    >
      {/* Left: Connectivity indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-medium">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-800">MoRD Central Live</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="font-bold text-amber-800">
                Offline Mode {isSimulatedOffline ? '(Simulated)' : '(No Network)'}
              </span>
            </span>
          )}
        </div>

        <span className="hidden sm:inline-block text-slate-300">|</span>

        {/* Offline Queue Status Pill */}
        <div className="hidden sm:flex items-center gap-2">
          {isSyncing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              Syncing {syncingCount || pendingCount} records...
            </span>
          ) : pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <Database className="w-3 h-3 text-amber-600" />
              <span className="font-bold">{pendingCount}</span> in local IndexedDB
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              All records synced
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions, Language & Toggles */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Bilingual Hindi / English Toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
          title="Toggle Language: English / हिंदी"
        >
          <Languages className="w-3.5 h-3.5 text-blue-700" />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>

        {/* High-Contrast Outdoor Sunlight Mode Switch */}
        <button
          onClick={toggleSunlightMode}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer shadow-xs ${
            sunlightMode
              ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Toggle High-Contrast Sunlight Mode for outdoor glare"
        >
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          <span>Sunlight</span>
        </button>

        {/* Manual Sync Trigger Button */}
        {isOnline && pendingCount > 0 && (
          <button
            onClick={() => syncPendingQueue()}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-xs disabled:opacity-50 transition-all active:scale-95 cursor-pointer text-[11px]"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>Sync ({pendingCount})</span>
          </button>
        )}

        {/* Simulate Offline Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
          <label 
            htmlFor="offline-toggle" 
            className="cursor-pointer text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Offline:
          </label>
          <button
            id="offline-toggle"
            role="switch"
            aria-checked={isSimulatedOffline}
            onClick={toggleSimulateOffline}
            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isSimulatedOffline ? 'bg-amber-600' : 'bg-slate-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                isSimulatedOffline ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
