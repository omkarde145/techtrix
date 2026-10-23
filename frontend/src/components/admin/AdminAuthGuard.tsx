'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { ShieldAlert, KeyRound, Building2, Lock, ArrowRight, Eye } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticatedAdmin, authenticateAdmin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (isAuthenticatedAdmin) {
    return <>{children}</>;
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(pin)) {
      setError(false);
      setPin('');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-900 tracking-wider uppercase">
                Ministry of Rural Development • Govt of India
              </p>
              <h1 className="text-sm font-bold text-slate-900">
                PMAY-G Digital Monitoring &amp; DBT Administration
              </h1>
            </div>
          </div>
          <Link
            href="/citizen"
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Citizen Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Lock Shield Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-bold border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Restricted Administrative Zone</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              BDO Clearance Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Access to sanction DBT funds, review structural stage submissions, and execute anti-fraud audits requires active cryptographic DSC token credentials.
            </p>
          </div>

          {/* Quick PIN Unlock */}
          <form onSubmit={handleUnlock} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Quick DSC Passcode Unlock
              </label>
              <span className="text-[11px] text-blue-700 font-bold font-mono">Demo PIN: 2024</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter 2024"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-center text-sm font-mono tracking-widest text-slate-900 focus:outline-hidden focus:border-blue-600"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Unlock
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-rose-600 font-semibold text-center">
                Invalid DSC Passcode. Use demo PIN 2024.
              </p>
            )}
          </form>

          {/* Route to Full Login or Citizen Portal */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/login?role=admin"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Open Official BDO Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/citizen"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Go to Public Citizen Tracking Dashboard (No Login Needed)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
