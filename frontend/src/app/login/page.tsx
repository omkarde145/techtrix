'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Search,
  Globe
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'inspector';

  const { 
    authenticateInspector, 
    authenticateAdmin, 
    isAuthenticatedInspector, 
    isAuthenticatedAdmin,
    officer,
    admin 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inspector' | 'admin'>(initialRole);

  // Inspector Form State
  const [inspectorId, setInspectorId] = useState('FO-8821');
  const [inspectorPin, setInspectorPin] = useState('1234');
  const [inspectorBlock, setInspectorBlock] = useState('Ranchi Sadar');
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Admin Form State
  const [adminId, setAdminId] = useState('bdo.ranchi@nic.in');
  const [adminPin, setAdminPin] = useState('2024');
  const [captchaInput, setCaptchaInput] = useState('7K9X2');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Update tab if query parameter changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') setActiveTab('admin');
    if (roleParam === 'inspector') setActiveTab('inspector');
  }, [searchParams]);

  // If already logged in, redirect
  useEffect(() => {
    if (activeTab === 'inspector' && isAuthenticatedInspector) {
      router.push('/field');
    } else if (activeTab === 'admin' && isAuthenticatedAdmin) {
      router.push('/admin');
    }
  }, [isAuthenticatedInspector, isAuthenticatedAdmin, activeTab, router]);

  const handleInspectorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setInspectorError(null);
    setInspectorLoading(true);

    setTimeout(() => {
      const success = authenticateInspector(inspectorId, inspectorPin);
      if (success) {
        router.push('/field');
      } else {
        setInspectorError('Invalid Inspector ID or Security PIN. Try ID: FO-8821, PIN: 1234');
        setInspectorLoading(false);
      }
    }, 400);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    setTimeout(() => {
      if (captchaInput.toUpperCase() !== '7K9X2') {
        setAdminError('Invalid Captcha code. Please enter 7K9X2');
        setAdminLoading(false);
        return;
      }

      const success = authenticateAdmin(adminPin);
      if (success) {
        router.push('/admin');
      } else {
        setAdminError('Invalid DSC e-Token PIN. Try PIN: 2024');
        setAdminLoading(false);
      }
    }, 400);
  };

  const autoFillInspector = () => {
    setInspectorId('FO-8821');
    setInspectorPin('1234');
    setInspectorBlock('Ranchi Sadar');
    setInspectorError(null);
  };

  const autoFillAdmin = () => {
    setAdminId('bdo.ranchi@nic.in');
    setAdminPin('2024');
    setCaptchaInput('7K9X2');
    setAdminError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top National Header Bar */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                Ministry of Rural Development • Government of India
              </p>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                PMAY-G Digital Monitoring Portal
              </h1>
            </div>
          </Link>

          <Link
            href="/citizen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Public Citizen Tracking</span>
            <span className="sm:hidden">Citizen</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'inspector'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Field Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>BDO Admin</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {activeTab === 'inspector' ? (
              /* Field Inspector Form */
              <form onSubmit={handleInspectorLogin} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-100">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Field Inspector Login</h2>
                  <p className="text-xs text-slate-500">
                    AwaasApp Offline Inspection &amp; Geotag Verification Console
                  </p>
                </div>

                {inspectorError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{inspectorError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Inspector ID / Employee Code
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                        placeholder="e.g. FO-8821"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security MPIN (4 Digits)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        maxLength={8}
                        value={inspectorPin}
                        onChange={(e) => setInspectorPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden tracking-widest transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Development Block
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={inspectorBlock}
                        onChange={(e) => setInspectorBlock(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer transition-colors"
                      >
                        <option value="Ranchi Sadar">Ranchi Sadar (Bishnupur GP)</option>
                        <option value="Chas Block">Chas Block (Chandankiyari GP)</option>
                        <option value="Kanke Block">Kanke Block</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inspectorLoading}
                  className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{inspectorLoading ? 'Authenticating...' : 'Sign In to Field Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={autoFillInspector}
                    className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Demo Auto-fill (FO-8821 / 1234)</span>
                  </button>

                  <span className="text-slate-400 font-mono text-[10px]">ECDSA-P256</span>
                </div>
              </form>
            ) : (
              /* BDO Administrative Officer Form */
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto border border-indigo-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">BDO Administrative Login</h2>
                  <p className="text-xs text-slate-500">
                    Executive Stage Approval &amp; PFMS DBT Disbursement Portal
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      NIC Official Email / Officer ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        placeholder="e.g. bdo.ranchi@nic.in"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Class-3 DSC Token PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden tracking-widest transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security Captcha
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-800 font-mono font-black text-sm tracking-widest select-none border border-slate-300">
                        7K9X2
                      </div>
                      <input
                        type="text"
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{adminLoading ? 'Verifying DSC Token...' : 'Authenticate with NIC DSC'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={autoFillAdmin}
                    className="text-indigo-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Demo Auto-fill (PIN: 2024)</span>
                  </button>

                  <span className="text-slate-400 font-mono text-[10px]">NIC Class-3</span>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            <span>Are you a rural citizen? </span>
            <Link href="/citizen" className="text-blue-700 font-bold hover:underline">
              Check your house status here (No login needed)
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>Pradhan Mantri Awaas Yojana - Gramin (PMAY-G) • Ministry of Rural Development</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
