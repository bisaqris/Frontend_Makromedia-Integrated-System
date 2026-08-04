'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CalendarView } from '@/components/shared/CalendarView';
import Select from '@/components/ui/Select';
import { apiClient } from '@/lib/apiClient';
import { Project, ProjectCategory } from '@/types/project';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Calendar as CalendarIcon,
  Video,
  Clapperboard,
  Tv,
  Heart,
  PartyPopper,
} from 'lucide-react';

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const DUMMY_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'PRJ-2026-001',
    name: 'Peluncuran Produk Innovate Tech 2026',
    category: 'Event',
    clientId: 'cli-1',
    clientName: 'PT Innovate Indonesia',
    status: 'IN_PROGRESS',
    startDate: '2026-05-04',
    endDate: '2026-05-08',
    budget: 350000000,
    totalPaid: 250000000,
    restOfBill: 100000000,
    totalCost: 180000000,
  },
  {
    id: 'proj-2',
    code: 'PRJ-2026-002',
    name: 'Company Profile & Video Direksi',
    category: 'Corporate Video',
    clientId: 'cli-2',
    clientName: 'Bank Nusantara',
    status: 'IN_PROGRESS',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    budget: 250000000,
    totalPaid: 200000000,
    restOfBill: 50000000,
    totalCost: 120000000,
  },
  {
    id: 'proj-3',
    code: 'PRJ-2026-003',
    name: 'Film Pendek Dokumenter Makromedia',
    category: 'Film Production',
    clientId: 'cli-3',
    clientName: 'Yayasan Seni Visual',
    status: 'QUOTATION_APPROVED',
    startDate: '2026-05-18',
    endDate: '2026-05-24',
    budget: 400000000,
    totalPaid: 200000000,
    restOfBill: 200000000,
    totalCost: 210000000,
  },
  {
    id: 'proj-4',
    code: 'PRJ-2026-004',
    name: 'Campaign Media Sosial Ramadan & Idul Fitri',
    category: 'Content Video/Marketing',
    clientId: 'cli-4',
    clientName: 'Brand Retail Utama',
    status: 'IN_PROGRESS',
    startDate: '2026-05-12',
    endDate: '2026-05-20',
    budget: 150000000,
    totalPaid: 100000000,
    restOfBill: 50000000,
    totalCost: 70000000,
  },
  {
    id: 'proj-5',
    code: 'PRJ-2026-005',
    name: 'Cinematic Wedding Film & Live Stream',
    category: 'Wedding',
    clientId: 'cli-5',
    clientName: 'Keluarga Henderson',
    status: 'COMPLETED',
    startDate: '2026-05-27',
    endDate: '2026-05-29',
    budget: 100000000,
    totalPaid: 100000000,
    restOfBill: 0,
    totalCost: 40000000,
  },
];

const MONTH_OPTIONS = [
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' },
];

export default function DashboardPage() {
  const { role } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 1));
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      try {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

        const response = await apiClient.get('/projects/calendar', {
          params: { start, end },
        });

        if (response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        }
      } catch {
        setProjects(DUMMY_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate]);

  const financialTotals = useMemo(() => {
    const totalContractValue = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalPaid = projects.reduce((acc, p) => acc + (p.totalPaid || 0), 0);
    const restOfBill = projects.reduce((acc, p) => acc + (p.restOfBill || 0), 0);
    const totalProjectCost = projects.reduce((acc, p) => acc + (p.totalCost || 0), 0);

    return {
      totalContractValue,
      totalPaid,
      restOfBill,
      totalProjectCost,
    };
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ProjectCategory, number> = {
      Event: 10,
      'Corporate Video': 4,
      'Film Production': 2,
      'Content Video/Marketing': 6,
      Wedding: 3,
    };

    projects.forEach((p) => {
      if (p.category && counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });

    return counts;
  }, [projects]);

  const isFinancialView = role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES';

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), selectedMonth, 1));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            {currentDate.toLocaleDateString('id-ID', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 sm:hidden">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            <span>Calendar Project</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-40">
            <Select
              value={currentDate.getMonth().toString()}
              onChange={handleMonthSelect}
              options={MONTH_OPTIONS}
              className="py-2 text-xs bg-slate-50 border-slate-200 rounded-xl font-semibold"
            />
          </div>
        </div>
      </div>

      {isFinancialView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-xs border border-blue-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Total Contract Value
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight">
                {formatRupiah(financialTotals.totalContractValue)}
              </p>
              <p className="text-[11px] text-blue-100 mt-1">Nilai total seluruh kontrak proyek</p>
            </div>
          </div>

          <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-xs border border-emerald-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Total Paid
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight">
                {formatRupiah(financialTotals.totalPaid)}
              </p>
              <p className="text-[11px] text-emerald-100 mt-1">Pembayaran yang telah diterima</p>
            </div>
          </div>

          <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-xs border border-amber-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
                Rest of the Bill
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight">
                {formatRupiah(financialTotals.restOfBill)}
              </p>
              <p className="text-[11px] text-amber-100 mt-1">Sisa piutang tagihan belum lunas</p>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-5 shadow-xs border border-orange-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                Total Project Cost
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Receipt className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight">
                {formatRupiah(financialTotals.totalProjectCost)}
              </p>
              <p className="text-[11px] text-orange-100 mt-1">Total pengeluaran biaya produksi</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-xs border border-blue-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 truncate">
                Event
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <PartyPopper className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black tracking-tight">{categoryCounts['Event']}</p>
              <p className="text-[11px] text-blue-100 mt-0.5">Proyek Event</p>
            </div>
          </div>

          <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-xs border border-emerald-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 truncate">
                Corporate Video
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Video className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black tracking-tight">
                {categoryCounts['Corporate Video']}
              </p>
              <p className="text-[11px] text-emerald-100 mt-0.5">Company Profile</p>
            </div>
          </div>

          <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-xs border border-amber-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-100 truncate">
                Film Production
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Clapperboard className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black tracking-tight">
                {categoryCounts['Film Production']}
              </p>
              <p className="text-[11px] text-amber-100 mt-0.5">Film & Dokudrama</p>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-4 shadow-xs border border-orange-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-100 truncate">
                Content Video
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Tv className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black tracking-tight">
                {categoryCounts['Content Video/Marketing']}
              </p>
              <p className="text-[11px] text-orange-100 mt-0.5">Marketing Content</p>
            </div>
          </div>

          <div className="bg-rose-500 text-white rounded-2xl p-4 shadow-xs border border-rose-600 md:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-100 truncate">
                Wedding
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black tracking-tight">{categoryCounts['Wedding']}</p>
              <p className="text-[11px] text-rose-100 mt-0.5">Dokumentasi Wedding</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <CalendarView
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          projects={projects}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
