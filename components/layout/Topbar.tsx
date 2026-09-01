'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User as UserIcon, LogOut, ChevronDown, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/context/PageTitleContext';
import { showToast } from '@/components/ui/Toast';

export interface TopbarProps {
  onToggleSidebar?: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Calendar Project' },
  '/projects': { title: 'List Project', subtitle: 'List of All Projects' },
  '/projects/new': { title: 'Add New Project', subtitle: 'Add new project' },
  '/projects/history': { title: 'History Project', subtitle: 'List of All Projects That Already Done' },
  '/application-cost': { title: 'List Application Cost', subtitle: 'List of Application Cost' },
  '/manpower': { title: 'List Data Employee', subtitle: 'List of All Employees' },
  '/manpower/skills': { title: 'Data Skill', subtitle: 'Employee skills and certifications' },
  '/clients/pic': { title: 'List Data Client', subtitle: 'List of Client PICs' },
  '/clients/company': { title: 'List Client Company', subtitle: 'List of Client Companies' },
  '/profile': { title: 'Profile', subtitle: 'Director Profile' },
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { customTitle, customSubtitle } = usePageTitle();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast.success('Anda telah keluar dari sistem.');
    router.push('/login');
  };

  const getPageHeader = () => {
    if (customTitle && customSubtitle) {
      return { title: customTitle, subtitle: customSubtitle };
    }
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith('/projects/')) {
      return { title: 'Detail Project', subtitle: 'Project details and overview' };
    }
    if (pathname.startsWith('/application-cost/production-cost')) {
      return { title: 'Production Cost', subtitle: 'Production Cost Document' };
    }
    if (pathname.startsWith('/application-cost/quotation')) {
      return { title: 'Quotation', subtitle: 'Quotation Document' };
    }
    if (pathname.startsWith('/application-cost/invoice')) {
      return { title: 'Invoice', subtitle: 'Invoice Document' };
    }
    if (pathname.startsWith('/application-cost/')) {
      return { title: 'Production Cost', subtitle: 'Production Cost Document' };
    }
    return { title: 'Dashboard', subtitle: 'Calendar Project' };
  };

  const header = getPageHeader();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-hidden cursor-pointer"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate max-w-45 sm:max-w-none">
            {header.title}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {header.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => showToast.info('Tidak ada notifikasi baru.')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative cursor-pointer"
          title="Notifikasi"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-hidden cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center border border-primary-200 overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-30 md:max-w-none">
                {user?.name || 'Pengguna'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Profil Saya</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
