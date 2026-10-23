import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { RoleSwitcher } from '@/components/common/RoleSwitcher';

export const metadata: Metadata = {
  title: 'GraminVikas 360 | Rural Housing & Panchayat Works Portal',
  description: 'National Digital Monitoring Platform for PMAY-G Inspections, Real-Time Geotagging, and PFMS Direct Benefit Transfer Oversight.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f2d59',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <AppProvider>
          {/* Top network & offline status simulation bar */}
          <NetworkStatusBanner />

          {/* Main page content */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Floating dual-role switcher (Field vs Admin) */}
          <RoleSwitcher />
        </AppProvider>
      </body>
    </html>
  );
}
