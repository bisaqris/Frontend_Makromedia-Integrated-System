'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { showToast } from '@/components/ui/Toast';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };
    const handleOnline = () => {
      setIsOffline(false);
    };

    window.addEventListener('makromedia:api-offline', handleOffline);
    window.addEventListener('makromedia:api-online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('makromedia:api-offline', handleOffline);
      window.removeEventListener('makromedia:api-online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await apiClient.get('/health');
      setIsOffline(false);
      showToast.success('Koneksi ke backend berhasil tersambung kembali!');
    } catch {
      showToast.error('Server backend masih belum dapat dihubungi.');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline || isDismissed) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 shadow-xs text-xs sm:text-sm flex items-center justify-between gap-3 sticky top-0 z-40 transition-all duration-200">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-100" />
        <span className="truncate">
          <strong>Koneksi Backend Terputus:</strong> Server backend (http://localhost:4000/api) sedang tidak aktif atau tidak dapat dijangkau.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCheckConnection}
          disabled={isChecking}
          className="px-2.5 py-1 bg-amber-700/60 hover:bg-amber-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Memeriksa...' : 'Coba Lagi'}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-amber-600 rounded-lg text-amber-100 hover:text-white transition-colors cursor-pointer"
          title="Tutup banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;

