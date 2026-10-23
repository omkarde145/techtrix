'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
