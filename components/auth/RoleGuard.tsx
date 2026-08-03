'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
  fallbackMode?: 'hide' | 'message' | 'redirect';
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowed,
  children,
  fallbackMode = 'message',
  redirectTo = '/dashboard',
}) => {
  const { user, role, isLoading, isAuthenticated, hasAccess } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-50 w-full items-center justify-center p-6 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium">Memeriksa hak akses...</span>
      </div>
    );
  }

  if (!isAuthenticated || !role || !hasAccess(allowed)) {
    if (fallbackMode === 'hide') {
      return null;
    }

    if (fallbackMode === 'redirect') {
      if (typeof window !== 'undefined') {
        router.replace(redirectTo);
      }
      return null;
    }

    // Default: 'message' mode
    return (
      <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Akses Ditolak</h3>
        <p className="text-sm text-slate-500 mb-6">
          Anda tidak memiliki akses ke halaman ini. Halaman ini memerlukan salah satu role berikut:{' '}
          <span className="font-semibold text-slate-700">{allowed.join(', ')}</span>. Role Anda saat ini:{' '}
          <span className="font-semibold text-primary">{user?.role || 'Guest'}</span>.
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
