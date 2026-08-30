'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Project } from '@/types/project';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CalendarViewProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  projects: Project[];
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Event: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  'Corporate Video': { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' },
  'Film Production': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600' },
  'Content Video/Marketing': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  Wedding: { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600' },
  Default: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
};

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onMonthChange,
  projects,
  isLoading = false,
}) => {
  const router = useRouter();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateString: string;
    }> = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        dateString: formatDateKey(prevDate),
      });
    }

    const todayStr = formatDateKey(new Date());
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDateKey(date);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        dateString,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        dateString: formatDateKey(nextDate),
      });
    }

    return days;
  }, [year, month]);

  const weeks = useMemo(() => {
    const weekRows: (typeof calendarDays)[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weekRows.push(calendarDays.slice(i, i + 7));
    }
    return weekRows;
  }, [calendarDays]);

  const weekEventsMap = useMemo(() => {
    return weeks.map((week) => {
      const weekStartStr = week[0].dateString;
      const weekEndStr = week[6].dateString;

      const overlappingProjects = projects.filter((p) => {
        if (!p.startDate || !p.endDate) return false;
        return p.startDate <= weekEndStr && p.endDate >= weekStartStr;
      });

      overlappingProjects.sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return (a.startDate || '').localeCompare(b.startDate || '');
        }
        return (b.endDate || '').localeCompare(a.endDate || '');
      });

      const tracks: number[] = [];

      const placedEvents = overlappingProjects.map((proj) => {
        let startCol = 0;
        if (proj.startDate && proj.startDate > weekStartStr) {
          const foundIdx = week.findIndex((d) => d.dateString === proj.startDate);
          startCol = foundIdx !== -1 ? foundIdx : 0;
        }

        let endCol = 6;
        if (proj.endDate && proj.endDate < weekEndStr) {
          const foundIdx = week.findIndex((d) => d.dateString === proj.endDate);
          endCol = foundIdx !== -1 ? foundIdx : 6;
        }

        const span = Math.max(1, endCol - startCol + 1);

        let assignedTrack = -1;
        for (let t = 0; t < tracks.length; t++) {
          if (tracks[t] < startCol) {
            assignedTrack = t;
            tracks[t] = endCol;
            break;
          }
        }

        if (assignedTrack === -1) {
          assignedTrack = tracks.length;
          tracks.push(endCol);
        }

        const isOriginalStart = proj.startDate ? proj.startDate >= weekStartStr : true;
        const isOriginalEnd = proj.endDate ? proj.endDate <= weekEndStr : true;

        return {
          project: proj,
          startCol,
          endCol,
          span,
          trackIndex: assignedTrack,
          isOriginalStart,
          isOriginalEnd,
        };
      });

      return {
        placedEvents,
        maxTracks: tracks.length,
      };
    });
  }, [weeks, projects]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden select-none">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-slate-400">Jadwal Pelaksanaan & Event Proyek</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />}
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/60 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-175">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
            {DAY_NAMES.map((name, idx) => (
              <div
                key={name}
                className={clsx(
                  'py-2.5 text-xs font-semibold tracking-wider uppercase',
                  idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                {name}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {weeks.map((week, weekIdx) => {
              const { placedEvents } = weekEventsMap[weekIdx];

              return (
                <div key={`week-row-${weekIdx}`} className="relative min-h-27.5 flex flex-col">
                  <div className="grid grid-cols-7 divide-x divide-slate-100 absolute inset-0 h-full pointer-events-none">
                    {week.map((day, dayIdx) => (
                      <div
                        key={`bg-cell-${day.dateString}-${weekIdx}-${dayIdx}`}
                        className={twMerge(
                          clsx(
                            'p-2 flex flex-col justify-between transition-colors',
                            day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400',
                            day.isToday && 'bg-blue-50/30'
                          )
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={clsx(
                              'text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center pointer-events-auto',
                              day.isToday
                                ? 'bg-primary text-white font-bold shadow-xs'
                                : day.isCurrentMonth
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            )}
                          >
                            {day.date.getDate()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 pt-9 pb-2 px-1 grid grid-cols-7 gap-y-1.5 pointer-events-none">
                    {placedEvents.map((evt) => {
                      const proj = evt.project;
                      const colorStyle =
                        CATEGORY_COLORS[proj.category || ''] || CATEGORY_COLORS['Default'];

                      return (
                        <div
                          key={`evt-${proj.id}-w${weekIdx}`}
                          onClick={() => router.push(`/projects/${proj.id}`)}
                          style={{
                            gridColumnStart: evt.startCol + 1,
                            gridColumnEnd: `span ${evt.span}`,
                            gridRowStart: evt.trackIndex + 1,
                          }}
                          className={twMerge(
                            clsx(
                              'pointer-events-auto py-1 px-2.5 text-[11px] font-semibold truncate cursor-pointer shadow-2xs hover:brightness-110 transition-all flex items-center gap-1.5 relative my-0.5',
                              colorStyle.bg,
                              colorStyle.text,
                              evt.isOriginalStart
                                ? 'rounded-l-md pl-2.5'
                                : 'rounded-l-none border-l-2 border-white/40 pl-2',
                              evt.isOriginalEnd
                                ? 'rounded-r-md pr-2.5'
                                : 'rounded-r-none border-r-2 border-white/40 pr-2'
                            )
                          )}
                          title={`${proj.name} (${proj.clientName || 'Client'}) - ${proj.category || 'Proyek'}`}
                        >
                          <span className="truncate font-semibold text-[11px] leading-tight">
                            {proj.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
