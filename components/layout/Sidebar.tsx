'use client';

import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/user';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user } = useAuth();

  // Role-based menu structure definition
  const getRoleMenuStructure = (userRole: Role | null): { standaloneItems: MenuItem[]; sections: MenuSection[] } => {
    // Default standalone items
    const standaloneItems: MenuItem[] = [
      {
        title: 'Main Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ];

    // DIREKTUR: has List Application Cost
    if (userRole === 'DIREKTUR') {
      standaloneItems.push({
        title: 'List Application Cost',
        href: '/application-cost',
        icon: <FileCheck className="w-4 h-4" />,
      });
    }

    // Configuration 1: DIREKTUR, FINANCE, SALES
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

    // Configuration 2: PROJECT_MANAGER, PRODUKSI
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

    // Fallback if role not set yet
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
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 flex flex-col z-30 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
          <Building2 className="w-5 h-5 text-accent" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-slate-900 leading-none tracking-tight">
            Makromedia
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
            Integrated System
          </span>
        </div>
      </div>

      {/* Menu Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Standalone Items (e.g. Main Dashboard, List Application Cost) */}
        <div className="space-y-1">
          {standaloneItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                    active
                      ? 'bg-primary-50 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                )}
              >
                <span className={clsx(active ? 'text-primary' : 'text-slate-400')}>{item.icon}</span>
                <span className="flex-1">{item.title}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-80" />}
              </Link>
            );
          })}
        </div>

        {/* Role Sections */}
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                      active
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  )}
                >
                  <span className={clsx(active ? 'text-primary' : 'text-slate-400')}>{item.icon}</span>
                  <span className="flex-1">{item.title}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-80" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Role Info */}
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
  );
};

export default Sidebar;
