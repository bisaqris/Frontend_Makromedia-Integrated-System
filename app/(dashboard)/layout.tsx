'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import RoleGuard from '@/components/auth/RoleGuard';
import { ALL_ROLES } from '@/lib/roles';
import { PageTitleProvider } from '@/context/PageTitleContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RoleGuard allowed={ALL_ROLES} fallbackMode="message">
      <PageTitleProvider>
        <div className="min-h-screen bg-white flex overflow-x-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-w-0 min-h-screen">
            <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
          </div>
        </div>
      </PageTitleProvider>
    </RoleGuard>
  );
}
