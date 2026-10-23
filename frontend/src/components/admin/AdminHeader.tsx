'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  Building2, 
  CheckSquare, 
  ShieldAlert, 
  RotateCcw, 
  MapPin, 
  User, 
  Layers,
  Globe,
  Home
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    admin, 
    selectedPanchayat, 
    setSelectedPanchayat, 
    beneficiaries, 
    resetToSeedData,
    logoutAdmin 
  } = useApp();

  const totalFlagged = beneficiaries.filter(b => b.overallStatus === 'flagged' || b.flags.some(f => !f.resolved)).length;
  const pendingApprovals = beneficiaries.filter(b => 
    Object.values(b.stageHistory).some(s => s.status === 'submitted')
  ).length;

  const navLinks = [
    {
      href: '/admin',
      label: 'Executive Dashboard',
      icon: Layers,
      active: pathname === '/admin'
    },
    {
      href: '/admin/approvals',
      label: 'Stage Verification & DBT',
      icon: CheckSquare,
      active: pathname === '/admin/approvals',
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      badgeVariant: 'pending' as const
    },
    {
      href: '/admin/fraud-control',
      label: 'Anti-Fraud & Deduplication',
      icon: ShieldAlert,
      active: pathname === '/admin/fraud-control',
      badge: totalFlagged > 0 ? totalFlagged : undefined,
      badgeVariant: 'flagged' as const
    },
    {
      href: '/citizen',
      label: 'Citizen Tracking (Public)',
      icon: Globe,
      active: pathname === '/citizen'
    },
    {
      href: '/social-audit',
      label: 'Social Audit Registry',
      icon: User,
      active: pathname === '/social-audit'
    }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top tier: Identity & Jurisdiction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-xs shrink-0 hover:bg-blue-800 transition-colors" title="Home">
            <Building2 className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                Ministry of Rural Development • Govt of India
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              PMAY-G Digital Monitoring &amp; DBT Portal
            </h1>
          </div>
        </div>

        {/* Right: GP Filter & Officer Pill */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Gram Panchayat Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <select
              value={selectedPanchayat}
              onChange={(e) => setSelectedPanchayat(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-white text-slate-800">All Gram Panchayats</option>
              <option value="Bishnupur Gram Panchayat" className="bg-white text-slate-800">
                Bishnupur GP (Ranchi)
              </option>
              <option value="Chandankiyari Gram Panchayat" className="bg-white text-slate-800">
                Chandankiyari GP (Bokaro)
              </option>
            </select>
          </div>

          {/* Persona Card */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left text-[11px] leading-tight">
              <p className="font-bold text-slate-800">{admin.name}</p>
              <p className="text-slate-500">{admin.designation}</p>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset database to clean seed state?')) {
                resetToSeedData();
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Reset to Fresh Seed Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Lock BDO Session */}
          <button
            onClick={() => {
              logoutAdmin();
              router.push('/login?role=admin');
            }}
            className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
            title="Lock BDO Session"
          >
            Lock Session
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="border-t border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  link.active
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <Badge size="sm" variant={link.badgeVariant}>
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
