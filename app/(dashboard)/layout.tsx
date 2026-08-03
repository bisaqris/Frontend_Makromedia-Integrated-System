'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import RoleGuard from '@/components/auth/RoleGuard';
import { ALL_ROLES } from '@/lib/roles';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={ALL_ROLES} fallbackMode="message">
      <div className="min-h-screen bg-slate-50 flex">
        {/* Left Fixed Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
