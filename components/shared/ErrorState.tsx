'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title = 'Gagal Terhubung ke Server',
  message = 'Terjadi kendala saat memuat data dari server backend. Pastikan server backend sedang aktif atau periksa jaringan Anda.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-red-200 rounded-2xl bg-red-50/30">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 border border-red-200 flex items-center justify-center mb-3 shadow-2xs">
        {icon || <WifiOff className="w-6 h-6 text-red-500" />}
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;

