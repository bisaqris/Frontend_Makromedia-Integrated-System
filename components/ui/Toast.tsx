'use client';

import React from 'react';
import { Toaster as HotToaster, toast } from 'react-hot-toast';

export const ToastProvider: React.FC = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          fontSize: '0.875rem',
          borderRadius: '0.75rem',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          fontFamily: 'var(--font-sans)',
        },
        success: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) =>
    toast(message, {
      icon: 'ℹ️',
    }),
  warning: (message: string) =>
    toast(message, {
      icon: '⚠️',
    }),
  promise: toast.promise,
};

export default ToastProvider;
