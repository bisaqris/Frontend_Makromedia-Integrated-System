import { apiClient } from '@/lib/apiClient';
import { ProjectCategory } from '@/types/project';
import {
  CalendarEvent,
  FinancialDashboardSummary,
  ProjectCategoryCounts,
} from '@/types/dashboard';
import { mockProjects } from '@/lib/mock/projects.mock';
import { mockDashboardCategories } from '@/lib/mock/dashboard.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

export interface CalendarRangeParams {
  start: string;
  end: string;
}

interface BackendCalendarEvent {
  id: string;
  title: string;
  date: string | null;
  type: CalendarEvent['type'];
  projectId: string;
}

interface BackendProjectCounts {
  byCategory: Record<string, number>;
}

interface BackendFinancialSummary {
  totalContractValue: number | string;
  totalPaid: number | string;
  restOfBill: number | string;
  approvedProductionCost: number | string;
}

const EMPTY_COUNTS: ProjectCategoryCounts = {
  Event: 0,
  'Corporate Video': 0,
  'Film Production': 0,
  'Content Video/Marketing': 0,
  Wedding: 0,
};

const categoryFromApi = (category: string): ProjectCategory | undefined => {
  switch (category) {
    case 'EVENT':
      return 'Event';
    case 'CORPORATE_VIDEO':
      return 'Corporate Video';
    case 'FILM_PRODUCTION':
      return 'Film Production';
    case 'WEDDING':
      return 'Wedding';
    case 'OTHER':
      return 'Content Video/Marketing';
    default:
      return undefined;
  }
};

export const dashboardService = {
  getCalendarEvents: async (_params?: CalendarRangeParams): Promise<CalendarEvent[]> => {
    if (USE_MOCK) {
      return cloneMock(
        mockProjects.map((project) => {
          const startDate = project.startDate ?? project.projectStarts ?? '';
          const endDate = project.endDate ?? project.deadline ?? startDate;
          return {
            id: project.id,
            title: project.name,
            startDate,
            endDate,
            type: 'EVENT' as const,
            projectId: project.id,
            category: project.category,
          };
        }).filter((event) => event.startDate)
      );
    }

    const response = await apiClient.get<BackendCalendarEvent[]>('/calendar/events');
    return response.data
      .filter((event): event is BackendCalendarEvent & { date: string } => Boolean(event.date))
      .map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.date.slice(0, 10),
        endDate: event.date.slice(0, 10),
        type: event.type,
        projectId: event.projectId,
      }));
  },

  getCategoryCounts: async (): Promise<{
    counts: ProjectCategoryCounts;
    includesCalendarProjects: boolean;
  }> => {
    if (USE_MOCK) {
      return {
        counts: cloneMock(mockDashboardCategories),
        includesCalendarProjects: false,
      };
    }
    const response = await apiClient.get<BackendProjectCounts>('/dashboard/project-counts');
    const counts = { ...EMPTY_COUNTS };
    for (const [category, count] of Object.entries(response.data.byCategory)) {
      const mappedCategory = categoryFromApi(category);
      if (mappedCategory) counts[mappedCategory] = count;
    }
    return { counts, includesCalendarProjects: true };
  },

  getFinancialSummary: async (): Promise<FinancialDashboardSummary> => {
    if (USE_MOCK) {
      const totalContractValue = mockProjects.reduce(
        (sum, project) => sum + (project.budget ?? 0),
        0
      );
      const totalPaid = mockProjects.reduce(
        (sum, project) => sum + (project.totalPaid ?? 0),
        0
      );
      return {
        totalContractValue,
        totalPaid,
        restOfBill: Math.max(0, totalContractValue - totalPaid),
        totalProjectCost: mockProjects.reduce(
          (sum, project) => sum + (project.totalCost ?? 0),
          0
        ),
      };
    }
    const response = await apiClient.get<BackendFinancialSummary>('/dashboard/summary');
    return {
      totalContractValue: Number(response.data.totalContractValue),
      totalPaid: Number(response.data.totalPaid),
      restOfBill: Number(response.data.restOfBill),
      totalProjectCost: Number(response.data.approvedProductionCost),
    };
  },
};
