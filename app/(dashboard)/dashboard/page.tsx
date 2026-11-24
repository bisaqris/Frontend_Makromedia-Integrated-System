"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CalendarView } from "@/components/shared/CalendarView";
import Select from "@/components/ui/Select";
import { ProjectCategory } from "@/types/project";
import {
  CalendarEvent,
  FinancialDashboardSummary,
  ProjectCategoryCounts,
} from "@/types/dashboard";
import { dashboardService } from "@/lib/services/dashboardService";
import { showToast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

/** Nilai awal sebelum baseline kategori dari service termuat. */
const EMPTY_CATEGORY_COUNTS: ProjectCategoryCounts = {
  Event: 0,
  'Corporate Video': 0,
  'Film Production': 0,
  'Content Video/Marketing': 0,
  Wedding: 0,
};

const EMPTY_FINANCIAL_TOTALS: FinancialDashboardSummary = {
  totalContractValue: 0,
  totalPaid: 0,
  restOfBill: 0,
  totalProjectCost: 0,
};

const formatRupiah = (value: number) => {
  return `Rp${(value || 0).toLocaleString('id-ID')}`;
};

const MONTH_OPTIONS = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
];

export default function DashboardPage() {
  const { role } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categoryBaseline, setCategoryBaseline] =
    useState<ProjectCategoryCounts>(EMPTY_CATEGORY_COUNTS);
  const [categoryCountsIncludeCalendarProjects, setCategoryCountsIncludeCalendarProjects] =
    useState(false);
  const [financialTotals, setFinancialTotals] =
    useState<FinancialDashboardSummary>(EMPTY_FINANCIAL_TOTALS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    dashboardService
      .getCategoryCounts()
      .then(({ counts, includesCalendarProjects }) => {
        setCategoryBaseline(counts);
        setCategoryCountsIncludeCalendarProjects(includesCalendarProjects);
      })
      .catch(() => {
        setCategoryBaseline(EMPTY_CATEGORY_COUNTS);
        showToast.error('Gagal memuat jumlah proyek per kategori.');
      });
  }, []);

  const isFinancialRole =
    role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES';

  useEffect(() => {
    if (!isFinancialRole) return;
    dashboardService
      .getFinancialSummary()
      .then(setFinancialTotals)
      .catch(() => {
        setFinancialTotals(EMPTY_FINANCIAL_TOTALS);
        showToast.error('Gagal memuat ringkasan finansial.');
      });
  }, [isFinancialRole]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      try {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        ).toISOString();
        const end = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        ).toISOString();

        setEvents(await dashboardService.getCalendarEvents({ start, end }));
      } catch {
        setEvents([]);
        showToast.error('Gagal memuat event kalender.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ProjectCategory, number> = {
      ...categoryBaseline,
    };

    if (!categoryCountsIncludeCalendarProjects) {
      events.forEach((event) => {
        if (event.type === 'EVENT' && event.category && counts[event.category] !== undefined) {
          counts[event.category] += 1;
        }
      });
    } else {
      return counts;
    }

    return counts;
  }, [categoryBaseline, categoryCountsIncludeCalendarProjects, events]);

  const isFinancialView =
    role === "DIREKTUR" || role === "FINANCE" || role === "SALES";

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), selectedMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}

          <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-white divide-x divide-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handleToday}
              className="h-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-full w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-full w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-36">
            <Select
              value={currentDate.getMonth().toString()}
              onChange={handleMonthSelect}
              options={MONTH_OPTIONS}
              className="h-9 py-0 text-xs bg-white border-slate-200 hover:border-slate-300 rounded-lg font-semibold leading-none flex items-center shadow-2xs"
            />
          </div>
        </div>
      </div>

      {isFinancialView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0066FF] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-medium text-white/90 mb-3">
              Total Contract Value
            </span>
            <p className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialTotals.totalContractValue)}
            </p>
          </div>

          <div className="bg-[#00B074] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-medium text-white/90 mb-3">
              Total Paid
            </span>
            <p className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialTotals.totalPaid)}
            </p>
          </div>

          <div className="bg-[#E5A800] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-medium text-white/90 mb-3">
              Rest of the Bill
            </span>
            <p className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialTotals.restOfBill)}
            </p>
          </div>

          <div className="bg-[#FF5B26] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-medium text-white/90 mb-3">
              Total Project Cost
            </span>
            <p className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialTotals.totalProjectCost)}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-[#0066ff] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Event
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Event"]}
            </p>
          </div>

          <div className="bg-[#0fab63] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Corporate Video
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Corporate Video"]}
            </p>
          </div>

          <div className="bg-[#e5a900] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Film Production
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Film Production"]}
            </p>
          </div>

          <div className="bg-[#ff6818] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Content Video/Marketing
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Content Video/Marketing"]}
            </p>
          </div>

          <div className="bg-[#ef3838] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Wedding
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Wedding"]}
            </p>
          </div>
        </div>
      )}

      <div>
        <CalendarView
          currentDate={currentDate}
          events={events}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
