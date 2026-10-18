import { apiClient } from '@/lib/apiClient';
import { Project, ProjectCategory } from '@/types/project';
import { mockProjects } from '@/lib/mock/projects.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

export interface GetProjectsParams {
  search?: string;
  category?: ProjectCategory | 'ALL';
  projectManagerId?: string | 'ALL';
  status?: string;
  page?: number;
  limit?: number;
}

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: Project[] | null = null;
const getMockStore = (): Project[] => (mockStore ??= cloneMock(mockProjects));

export const projectService = {
  getProjects: async (
    params?: GetProjectsParams
  ): Promise<{ data: Project[]; total: number }> => {
    if (USE_MOCK) {
      let filtered = getMockStore();

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            (p.clientName && p.clientName.toLowerCase().includes(q))
        );
      }

      if (params?.category && params.category !== 'ALL') {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params?.projectManagerId && params.projectManagerId !== 'ALL') {
        filtered = filtered.filter((p) => p.projectManagerId === params.projectManagerId);
      }

      if (params?.status) {
        filtered =
          params.status === 'DONE'
            ? filtered.filter((p) => p.status === 'COMPLETED' || p.status === 'DONE')
            : filtered.filter((p) => p.status === params.status);
      }

      const total = filtered.length;
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;

      return { data: cloneMock(filtered.slice(startIndex, startIndex + limit)), total };
    }

    const response = await apiClient.get('/projects', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    return { data: response.data, total: response.data.length };
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((p) => p.id === id) ?? null);
    }
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const newProject: Project = {
        id: `proj-${crypto.randomUUID()}`,
        code: `PRJ-2026-${String(store.length + 1).padStart(3, '0')}`,
        name: projectData.name || 'Untitled Project',
        category: projectData.category || 'Event',
        clientId: projectData.clientId || 'cli-1',
        clientName: projectData.clientName || 'PT Client Default',
        status: projectData.status || 'QUOTATION_PENDING',
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        projectStarts: projectData.projectStarts,
        deadline: projectData.deadline,
        venue: projectData.venue,
        budget: projectData.budget || 0,
        totalPaid: 0,
        restOfBill: projectData.budget || 0,
        totalCost: 0,
        deliverablesLink: projectData.deliverablesLink,
        additionalLinks: projectData.additionalLinks || [],
        generalBrief: projectData.generalBrief || '',
        costItems: [],
        paymentHistory: [],
        tasks: [],
      };
      store.unshift(newProject);
      return cloneMock(newProject);
    }

    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Project dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...projectData };
      return cloneMock(store[index]);
    }

    const response = await apiClient.patch(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((p) => p.id !== id);
      return true;
    }
    await apiClient.delete(`/projects/${id}`);
    return true;
  },
};

export default projectService;
