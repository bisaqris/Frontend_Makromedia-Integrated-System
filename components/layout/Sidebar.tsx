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
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext'; // 1. Import useSidebar
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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  // 2. Ambil state dan handler dari SidebarContext
  const { isOpen: contextIsOpen, closeSidebar: contextCloseSidebar } = useSidebar();

  // Gabungkan prop dan context (Context diutamakan)
  const isSidebarOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const handleClose = propOnClose || contextCloseSidebar;

  // Tutup sidebar otomatis saat berpindah halaman di mobile
  useEffect(() => {
    handleClose();
  }, [pathname]);

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
              { title: 'List Data Employee', href: '/manpower', icon: <Users className="w-4 h-4" /> },
              { title: 'Data Skill', href: '/manpower/skills', icon: <Award className="w-4 h-4" /> },
            ],
          },
          {
            title: 'client data',
            items: [
              { title: 'List Data Client', href: '/clients/pic', icon: <Contact2 className="w-4 h-4" /> },
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

  const allHrefs = [
    ...standaloneItems.map((item) => item.href),
    ...sections.flatMap((section) => section.items.map((item) => item.href)),
  ];

  const getActiveHref = (path: string, hrefs: string[]) => {
    const matches = hrefs.filter(
      (href) => path === href || path.startsWith(href + '/')
    );
    if (matches.length === 0) return null;
    return matches.reduce((longest, href) =>
      href.length > longest.length ? href : longest
    );
  };

  const activeHref = getActiveHref(pathname, allHrefs);

  const isLinkActive = (href: string) => href === activeHref;

  return (
    <>
      {/* Backdrop Gelap untuk Mobile saat Sidebar Terbuka */}
      {isSidebarOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Container Sidebar */}
      <aside
        className={twMerge(
          clsx(
            // Styling dasar & animasi mobile (fixed)
            'fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 flex flex-col z-50 select-none transition-transform duration-300 ease-in-out shrink-0',
            // Styling khusus desktop lg: ke atas (static/sticky supaya tidak menimpa konten)
            'lg:static lg:translate-x-0 lg:z-auto',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
            onClick={handleClose}
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
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  )}
                >
                  <span className={clsx(active ? 'text-white' : 'text-slate-400')}>{item.icon}</span>
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-xs font-semibold uppercase text-slate-400 tracking-wider">
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
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )
                    )}
                  >
                    <span className={clsx(active ? 'text-white' : 'text-slate-400')}>{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;