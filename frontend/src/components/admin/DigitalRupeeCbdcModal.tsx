'use client';

import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, ShieldCheck, IndianRupee, Store, Sparkles } from 'lucide-react';
import { Beneficiary, DigitalRupeeCbdcBatch, StageType } from '@/types';
import { generateCbdcVoucher, LOCAL_REGISTERED_VENDORS } from '@/lib/engines/cbdcEngine';

interface DigitalRupeeCbdcModalProps {
  beneficiary: Beneficiary;
  stage: StageType;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onVoucherIssued: (voucher: DigitalRupeeCbdcBatch) => void;
}

export function DigitalRupeeCbdcModal({
  beneficiary,
  stage,
  amount,
  isOpen,
  onClose,
  onVoucherIssued,
}: DigitalRupeeCbdcModalProps) {
  const [voucher, setVoucher] = useState<DigitalRupeeCbdcBatch | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateVoucher = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const v = generateCbdcVoucher(beneficiary, stage, amount);
      setVoucher(v);
      setIsGenerating(false);
      onVoucherIssued(v);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">RBI Digital Rupee (e₹ - CBDC)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Programmable DBT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Purpose-bound tokens locked to building material vendors</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Beneficiary:</span>
            <span className="text-slate-900 font-bold">{beneficiary.name} ({beneficiary.pmayId})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Instalment Amount:</span>
            <span className="text-emerald-700 font-black text-sm">₹{amount.toLocaleString('en-IN')} (e₹ Token)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Token Purpose Binding:</span>
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-amber-200">
              BUILDING_MATERIALS_CEMENT_STEEL
            </span>
          </div>
        </div>

        {/* Generated QR Voucher Simulation */}
        {voucher ? (
          <div className="space-y-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2.5">
              <div className="w-32 h-32 bg-white rounded-xl border border-slate-300 flex items-center justify-center p-2 shadow-xs">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs font-black tracking-wider text-slate-900">{voucher.voucherId}</p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">Scan at authorized Gram Panchayat vendor to redeem</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Expires: {voucher.expiresAt}</p>
              </div>
            </div>

            {/* Whitelisted Vendors */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Authorized Local Material Merchants:
              </span>
              <div className="space-y-1.5 text-xs">
                {LOCAL_REGISTERED_VENDORS.map((v) => (
                  <div key={v.vendorId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-teal-600" />
                      <span className="text-slate-800 font-medium">{v.vendorName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {v.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2 text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
            <p>
              Issuing an <strong className="text-slate-800">e₹ Programmable Voucher</strong> guarantees 100% of the funds are spent strictly on bricks, cement, and TMT sariya at registered local hardware stores, completely preventing fund diversion.
            </p>
          </div>
        )}

        {/* Trigger Button */}
        <div className="pt-2">
          {!voucher ? (
            <button
              onClick={handleGenerateVoucher}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Cryptographic e₹ Token...' : 'Issue Programmable e₹ Material Voucher'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
            >
              Close &amp; Record Digital Rupee Sanction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
