import { apiClient } from '@/lib/apiClient';
import { Project, ProjectCategory } from '@/types/project';
import projectService from '@/lib/services/projectService';
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
  getCalendarEvents: async (
    params?: CalendarRangeParams,
    userRole?: string
  ): Promise<CalendarEvent[]> => {
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

    // 1. Fetch raw calendar events and project metadata in parallel
    const [eventsResponse, projectsData] = await Promise.all([
      apiClient
        .get<BackendCalendarEvent[]>('/calendar/events', {
          params:
            params?.start && params?.end
              ? { start: params.start, end: params.end }
              : undefined,
        })
        .catch(() => ({ data: [] as BackendCalendarEvent[] })),
      projectService.getProjects({ limit: 100 }).catch(() => ({ data: [] as Project[], total: 0 })),
    ]);

    const projectMap = new Map<string, Project>();
    projectsData.data.forEach((p) => {
      projectMap.set(p.id, p);
    });

    const isNonFinancialRole = userRole === 'PROJECT_MANAGER' || userRole === 'PRODUKSI';

    const events: CalendarEvent[] = [];
    const seenProjectEventIds = new Set<string>();

    for (const raw of eventsResponse.data) {
      if (!raw.date) continue;
      // RBAC: Filter out financial invoice due dates for PM and Produksi
      if (raw.type === 'INVOICE_DUE' && isNonFinancialRole) {
        continue;
      }

      const proj = projectMap.get(raw.projectId);
      const rawDateStr = raw.date.slice(0, 10);

      if (raw.type === 'EVENT') {
        seenProjectEventIds.add(raw.projectId);
        const startDate = proj?.startDate || proj?.projectStarts || rawDateStr;
        const endDate = proj?.endDate || proj?.deadline || startDate;

        events.push({
          id: raw.id,
          title: raw.title,
          startDate,
          endDate,
          type: 'EVENT',
          projectId: raw.projectId,
          category: proj?.category,
        });
      } else {
        events.push({
          id: raw.id,
          title: raw.title,
          startDate: rawDateStr,
          endDate: rawDateStr,
          type: raw.type,
          projectId: raw.projectId,
          category: proj?.category,
        });
      }
    }

    // Include projects that have no eventDate on the backend but have startDate & endDate
    for (const proj of projectsData.data) {
      if (!seenProjectEventIds.has(proj.id)) {
        const startDate = proj.startDate || proj.projectStarts;
        if (startDate) {
          const endDate = proj.endDate || proj.deadline || startDate;
          events.push({
            id: `evt-${proj.id}`,
            title: proj.name,
            startDate,
            endDate,
            type: 'EVENT',
            projectId: proj.id,
            category: proj.category,
          });
        }
      }
    }

    return events;
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
