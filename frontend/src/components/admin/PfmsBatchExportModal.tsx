'use client';

import React, { useState } from 'react';
import { PfmsFtoBatch } from '@/types';
import { downloadPfmsFtoXml } from '@/lib/engines/pfmsEngine';
import { 
  FileCode, 
  Download, 
  X, 
  Building2, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface PfmsBatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: PfmsFtoBatch | null;
}

export function PfmsBatchExportModal({
  isOpen,
  onClose,
  batch
}: PfmsBatchExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'xml'>('summary');

  if (!isOpen || !batch) return null;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(batch.batchXmlPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Public Financial Management System
                </span>
                <Badge size="sm" variant="verified">PFMS APBS Mandate</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Fund Transfer Order (FTO) Batch Generated
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-slate-50/50">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Disbursement Summary ({batch.totalBeneficiaries} Beneficiaries)
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'xml'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Official PFMS XML Payload</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* Batch Metadata Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">FTO Number</span>
                  <p className="text-xs font-mono font-bold text-teal-800 truncate mt-0.5">{batch.ftoNumber}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Financial Year</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{batch.financialYear}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Grant</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    ₹{batch.totalDisbursementAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Gateway</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">NPCI-APBS Direct</p>
                </div>
              </div>

              {/* Beneficiary Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Authorized Beneficiary Subsidy Credits</span>
                  <span className="text-teal-700 font-mono text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Class-3 DSC Signed
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {batch.beneficiaries.map((b) => (
                    <div key={b.pmayId} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{b.beneficiaryName}</span>
                          <span className="text-[10px] text-teal-700 font-mono">{b.pmayId}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.village} • Bank: {b.bankAccountMasked} ({b.bankIfsc})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{b.instalmentStage}</span>
                        <span className="font-bold text-emerald-700">₹{b.instalmentAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DSC e-Token Signature Digest */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 overflow-hidden">
                  <span className="font-bold text-slate-900 block">Digital Signature Certificate (DSC) Cryptographic Seal</span>
                  <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">{batch.dscSignatureDigest}</p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Signatory: {batch.generatedByOfficer} • {batch.officerDesignation}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {batch.batchXmlPayload}
              </pre>
              <button
                onClick={handleCopyXml}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-md backdrop-blur-sm transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                <span>{copied ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Compliant with MoRD PFMS DBT Integration Circular v4.2
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => downloadPfmsFtoXml(batch)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed PFMS XML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
