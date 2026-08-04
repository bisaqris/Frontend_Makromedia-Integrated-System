'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck,
  FolderKanban,
  History,
  Users,
  Award,
  Contact2,
  Building2,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/user';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { role, user } = useAuth();

  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  const getRoleMenuStructure = (userRole: Role | null): { standaloneItems: MenuItem[]; sections: MenuSection[] } => {
    const standaloneItems: MenuItem[] = [
      {
        title: 'Main Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ];

    if (userRole === 'DIREKTUR') {
      standaloneItems.push({
        title: 'List Application Cost',
        href: '/application-cost',
        icon: <FileCheck className="w-4 h-4" />,
      });
    }

    if (userRole === 'DIREKTUR' || userRole === 'FINANCE' || userRole === 'SALES') {
      return {
        standaloneItems,
        sections: [
          {
            title: 'sales',
            items: [
              { title: 'List Project', href: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
              { title: 'History', href: '/projects/history', icon: <History className="w-4 h-4" /> },
            ],
          },
          {
            title: 'manpower',
            items: [
              { title: 'List Data Manpower', href: '/manpower', icon: <Users className="w-4 h-4" /> },
              { title: 'Data Skill', href: '/manpower/skills', icon: <Award className="w-4 h-4" /> },
            ],
          },
          {
            title: 'client data',
            items: [
              { title: 'List Data PIC Client', href: '/clients/pic', icon: <Contact2 className="w-4 h-4" /> },
              { title: 'List Client Company', href: '/clients/company', icon: <Building2 className="w-4 h-4" /> },
            ],
          },
        ],
      };
    }

    if (userRole === 'PROJECT_MANAGER' || userRole === 'PRODUKSI') {
      return {
        standaloneItems,
        sections: [
          {
            title: 'production',
            items: [
              { title: 'List Project', href: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
              { title: 'History', href: '/projects/history', icon: <History className="w-4 h-4" /> },
            ],
          },
        ],
      };
    }

    return {
      standaloneItems,
      sections: [],
    };
  };

  const { standaloneItems, sections } = getRoleMenuStructure(role);

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={twMerge(
          clsx(
            'fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 flex flex-col z-50 select-none transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center">
              <Image src="/makromedia-logo1.png" alt="Logo" width={36} height={36} className="w-auto h-auto" />
            </div>
            <span className="font-semibold text-lg text-slate-900 leading-none tracking-tight">
              Makromedia
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {standaloneItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={twMerge(
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
                      active
                        ? 'bg-primary text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  )}
                >
                  <span className={clsx(active ? 'text-white' : 'text-slate-400')}>{item.icon}</span>
                  <span className="flex-1">{item.title}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={twMerge(
                      clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
                        active
                          ? 'bg-primary text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )
                    )}
                  >
                    <span className={clsx(active ? 'text-white' : 'text-slate-400')}>{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-semibold text-slate-800 truncate">
                {user?.name || 'Pengguna'}
              </span>
              <span className="text-[10px] text-accent font-medium truncate">{role || 'GUEST'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
