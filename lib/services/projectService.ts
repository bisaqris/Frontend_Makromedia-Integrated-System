import { apiClient } from '@/lib/apiClient';
import { Project, ProjectCategory } from '@/types/project';
import { mockProjects } from '@/lib/mock/projects.mock';

let localProjects: Project[] = [...mockProjects];

export interface GetProjectsParams {
  search?: string;
  category?: ProjectCategory | 'ALL';
  projectManagerId?: string | 'ALL';
  status?: string;
  page?: number;
  limit?: number;
}

export const projectService = {
  getProjects: async (params?: GetProjectsParams): Promise<{ data: Project[]; total: number }> => {
    try {
      const response = await apiClient.get('/projects', { params });
      if (response.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
    } catch {
      // Fallback to local mock data
    }

    let filtered = [...localProjects];

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
      if (params.status === 'DONE') {
        filtered = filtered.filter((p) => p.status === 'COMPLETED' || p.status === 'DONE');
      } else {
        filtered = filtered.filter((p) => p.status === params.status);
      }
    }

    const total = filtered.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return { data: paginatedData, total };
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      if (response.data) return response.data;
    } catch {
      // Fallback to local mock data
    }
    const found = localProjects.find((p) => p.id === id);
    return found || null;
  },

  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.post('/projects', projectData);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      code: `PRJ-2026-00${localProjects.length + 1}`,
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

    localProjects.unshift(newProject);
    return newProject;
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.patch(`/projects/${id}`, projectData);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }

    localProjects = localProjects.map((p) => (p.id === id ? { ...p, ...projectData } : p));
    const updated = localProjects.find((p) => p.id === id);
    return updated!;
  },

  deleteProject: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/projects/${id}`);
      localProjects = localProjects.filter((p) => p.id !== id);
      return true;
    } catch {
      localProjects = localProjects.filter((p) => p.id !== id);
      return true;
    }
  },
};

export default projectService;
