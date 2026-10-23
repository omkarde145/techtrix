'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { Smartphone, Building2, Lock, X, Check, KeyRound, Globe, ArrowRight } from 'lucide-react';

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, officer, admin, isAuthenticatedAdmin, authenticateAdmin } = useApp();

  const isField = pathname.startsWith('/field');
  const isAdmin = pathname.startsWith('/admin');
  const isCitizen = pathname.startsWith('/citizen') || pathname.startsWith('/social-audit');

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Do not show floating role switcher on dedicated login page
  if (pathname.startsWith('/login')) {
    return null;
  }

  const handleSwitchToField = () => {
    setRole('field');
    if (!isField) {
      router.push('/field');
    }
  };

  const handleSwitchToAdmin = () => {
    if (isAuthenticatedAdmin) {
      setRole('admin');
      if (!isAdmin) {
        router.push('/admin');
      }
    } else {
      setShowPinModal(true);
    }
  };

  const handleSwitchToCitizen = () => {
    if (!isCitizen) {
      router.push('/citizen');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authenticateAdmin(pinInput);
    if (success) {
      setPinError(false);
      setShowPinModal(false);
      setPinInput('');
      setRole('admin');
      router.push('/admin');
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50">
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-1">
          {/* Field Inspector */}
          <button
            onClick={handleSwitchToField}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isField
                ? 'bg-blue-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={`Active Inspector: ${officer.name} (${officer.id})`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspector</span>
            <span className="sm:hidden">Field</span>
          </button>

          {/* Admin BDO */}
          <button
            onClick={handleSwitchToAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isAdmin
                ? 'bg-indigo-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={`Active BDO: ${admin.name} (${admin.id})`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BDO Admin</span>
            <span className="sm:hidden">Admin</span>
            {!isAuthenticatedAdmin && (
              <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-0.5" />
            )}
          </button>

          {/* Citizen Dashboard (Public Read-Only) */}
          <button
            onClick={handleSwitchToCitizen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isCitizen
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Public Citizen Tracking Dashboard (Read-Only)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen Portal</span>
            <span className="sm:hidden">Citizen</span>
          </button>
        </div>
      </div>

      {/* Gov BDO PIN Security Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">BDO Authentication</h3>
                  <p className="text-[11px] text-slate-500">Security Clearance Required</p>
                </div>
              </div>

              <button
                onClick={() => { setShowPinModal(false); setPinError(false); }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Administrative oversight and DBT disbursement permissions are restricted to authorized Block Development Officers.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enter Officer Passcode / PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  placeholder="Enter 4-digit PIN (Default: 2024)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block text-center">
                  💡 Officer Demo PIN: <strong className="text-blue-700 font-mono">2024</strong>
                </span>
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 text-center font-semibold">
                  Invalid officer PIN. Please enter 2024.
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinError(false); }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify PIN</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                href="/login?role=admin"
                onClick={() => setShowPinModal(false)}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
              >
                <span>Or go to Dedicated BDO Login Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
