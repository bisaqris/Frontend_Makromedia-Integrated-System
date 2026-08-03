'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import Badge from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';

export const Topbar: React.FC = () => {
  const router = useRouter();
  const { user, role, logout } = useAuth();
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

  const getRoleBadgeVariant = (userRole: string | null) => {
    switch (userRole) {
      case 'DIREKTUR':
        return 'accent';
      case 'FINANCE':
        return 'success';
      case 'SALES':
        return 'primary';
      case 'PROJECT_MANAGER':
        return 'info';
      case 'PRODUKSI':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Title / Search / Quick Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-700 hidden sm:block">
          Makromedia Integrated System
        </h1>
      </div>

      {/* Right Controls: Notifications & User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button
          type="button"
          onClick={() => showToast.info('Tidak ada notifikasi baru.')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-hidden"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center border border-primary-200 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            {/* Name & Role */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Pengguna'}
              </span>
              <div className="mt-0.5">
                <Badge variant={getRoleBadgeVariant(role)} size="sm">
                  {role ? ROLE_LABELS[role] || role : 'GUEST'}
                </Badge>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
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
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
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
