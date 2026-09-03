"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CalendarView } from "@/components/shared/CalendarView";
import Select from "@/components/ui/Select";
import { apiClient } from "@/lib/apiClient";
import { Project, ProjectCategory } from "@/types/project";
import { mockProjects } from "@/lib/mock/projects.mock";
import { mockDashboardCategories } from "@/lib/mock/dashboard.mock";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 1));
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

        const response = await apiClient.get("/projects/calendar", {
          params: { start, end },
        });

        if (response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        }
      } catch {
        setProjects(mockProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate]);

  const financialTotals = useMemo(() => {
    const totalContractValue = projects.reduce(
      (acc, p) => acc + (p.budget || 0),
      0,
    );
    const totalPaid = projects.reduce((acc, p) => acc + (p.totalPaid || 0), 0);
    const restOfBill = projects.reduce(
      (acc, p) => acc + (p.restOfBill || 0),
      0,
    );
    const totalProjectCost = projects.reduce(
      (acc, p) => acc + (p.totalCost || 0),
      0,
    );

    return {
      totalContractValue,
      totalPaid,
      restOfBill,
      totalProjectCost,
    };
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ProjectCategory, number> = {
      ...mockDashboardCategories,
    };

    projects.forEach((p) => {
      if (p.category && counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });

    return counts;
  }, [projects]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white py-4 sm:py-5 border-y border-slate-200">
        <div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 leading-none">
            {currentDate.toLocaleDateString("id-ID", {
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
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-full w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-full w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-40 sm:w-32">
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
          <div className="bg-[#006AFF] text-white rounded-2xl p-5 shadow-xs border border-blue-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Total Contract Value
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight">
                {formatRupiah(financialTotals.totalContractValue)}
              </p>
            </div>
          </div>

          <div className="bg-[#12B76A] text-white rounded-2xl p-5 shadow-xs border border-emerald-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Total Paid
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight">
                {formatRupiah(financialTotals.totalPaid)}
              </p>
            </div>
          </div>

          <div className="bg-[#EAB308] text-white rounded-2xl p-5 shadow-xs border border-amber-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
                Rest of the Bill
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight">
                {formatRupiah(financialTotals.restOfBill)}
              </p>
            </div>
          </div>

          <div className="bg-[#F97316] text-white rounded-2xl p-5 shadow-xs border border-orange-600 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                Total Project Cost
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight">
                {formatRupiah(financialTotals.totalProjectCost)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Event */}
          <div className="bg-[#0066ff] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Event
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Event"] !== undefined ? categoryCounts["Event"] : 10}
            </p>
          </div>

          {/* Card 2: Corporate Video */}
          <div className="bg-[#0fab63] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Corporate Video
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Corporate Video"] !== undefined ? categoryCounts["Corporate Video"] : 4}
            </p>
          </div>

          {/* Card 3: Film Production */}
          <div className="bg-[#e5a900] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Film Production
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Film Production"] !== undefined ? categoryCounts["Film Production"] : 6}
            </p>
          </div>

          {/* Card 4: Content Video/Marketing */}
          <div className="bg-[#ff6818] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Content Video/Marketing
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Content Video/Marketing"] !== undefined ? categoryCounts["Content Video/Marketing"] : 26}
            </p>
          </div>

          {/* Card 5: Wedding */}
          <div className="bg-[#ef3838] text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs sm:text-sm font-normal text-white mb-2 block truncate">
              Wedding
            </span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {categoryCounts["Wedding"] !== undefined ? categoryCounts["Wedding"] : 21}
            </p>
          </div>
        </div>
      )}

      <div>
        <CalendarView
          currentDate={currentDate}
          projects={projects}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
