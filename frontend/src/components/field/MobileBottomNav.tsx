'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { ClipboardList, Camera, Database, Home } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { syncQueue } = useApp();

  const pendingCount = syncQueue.filter(q => q.status === 'pending').length;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      label: 'Inspections',
      href: '/field',
      icon: ClipboardList,
      active: pathname === '/field'
    },
    {
      label: 'New Inspection',
      href: '/field',
      icon: Camera,
      isSpecial: true,
      onClick: () => {
        router.push('/field');
      }
    },
    {
      label: 'Offline Queue',
      href: '/field/queue',
      icon: Database,
      active: pathname === '/field/queue',
      badge: pendingCount > 0 ? pendingCount : undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe sm:hidden shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          if (item.isSpecial) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="relative -top-3 flex flex-col items-center justify-center p-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-md border-4 border-white active:scale-95 transition-transform"
                title={item.label}
              >
                <Icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors relative cursor-pointer ${
                item.active ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
