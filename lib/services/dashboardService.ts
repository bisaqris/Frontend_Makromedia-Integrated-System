import { apiClient } from '@/lib/apiClient';
import { Project } from '@/types/project';
import { ProjectCategoryCounts } from '@/types/dashboard';
import { mockProjects } from '@/lib/mock/projects.mock';
import { mockDashboardCategories } from '@/lib/mock/dashboard.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

export interface CalendarRangeParams {
  start: string;
  end: string;
}

export const dashboardService = {
  /** Project yang tampil di kalender dashboard pada rentang tanggal tertentu. */
  getCalendarProjects: async (params: CalendarRangeParams): Promise<Project[]> => {
    if (USE_MOCK) return cloneMock(mockProjects);
    const response = await apiClient.get<Project[]>('/projects/calendar', { params });
    return response.data;
  },

  /** Jumlah project historis per kategori (baseline sebelum project berjalan). */
  getCategoryCounts: async (): Promise<ProjectCategoryCounts> => {
    if (USE_MOCK) return cloneMock(mockDashboardCategories);
    const response = await apiClient.get<ProjectCategoryCounts>('/dashboard/category-counts');
    return response.data;
  },
};
