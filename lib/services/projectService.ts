import { apiClient } from '@/lib/apiClient';
import { Project, ProjectCategory } from '@/types/project';
import { mockProjects } from '@/lib/mock/projects.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

interface BackendProject {
  id: string;
  name: string;
  description?: string | null;
  category?: string;
  clientId: string;
  client?: { name?: string; company?: { name?: string } };
  clientType?: string | null;
  partnershipModel?: string | null;
  projectManagerId?: string | null;
  projectManager?: { id: string; name: string } | null;
  status: string;
  venue?: string | null;
  contractValue?: number | string | null;
  eventDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  links?: Array<{ id: string; label: string; url: string }>;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string | null;
    dueDate?: string | null;
    progress?: number;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    assignedToId?: string | null;
    assignedTo?: { name?: string } | null;
  }>;
  payments?: Array<{
    id: string;
    paidAt: string;
    amount: number | string;
    paymentMethod?: string | null;
    bankTo?: string | null;
    bankAccount?: string | null;
    note?: string | null;
  }>;
  productionCosts?: Array<{
    id: string;
    category: string;
    description?: string | null;
    executorName?: string | null;
    unitPrice: number | string;
    quantity: number;
    frequency: number;
    period?: string | null;
    amount: number | string;
  }>;
  quotations?: Array<{
    items: Array<{
      id: string;
      item: string;
      description?: string | null;
      unitPrice: number | string;
      quantity: number;
      frequency: number;
      period?: string | null;
      subTotal: number | string;
    }>;
  }>;
  invoices?: Array<{
    items: Array<{
      id: string;
      item: string;
      description?: string | null;
      unitPrice: number | string;
      quantity: number;
      frequency: number;
      period?: string | null;
      subTotal: number | string;
    }>;
  }>;
}

interface BackendPaginatedProjects {
  data: BackendProject[];
  meta: { total: number };
}

const toNumber = (value: number | string | null | undefined): number =>
  Number(value ?? 0);

const categoryFromApi = (category?: string): ProjectCategory => {
  switch (category) {
    case 'CORPORATE_VIDEO':
      return 'Corporate Video';
    case 'FILM_PRODUCTION':
      return 'Film Production';
    case 'WEDDING':
      return 'Wedding';
    case 'OTHER':
      return 'Content Video/Marketing';
    default:
      return 'Event';
  }
};

const categoryToApi = (category?: ProjectCategory | 'ALL'): string | undefined => {
  switch (category) {
    case 'Event':
      return 'EVENT';
    case 'Corporate Video':
      return 'CORPORATE_VIDEO';
    case 'Film Production':
      return 'FILM_PRODUCTION';
    case 'Wedding':
      return 'WEDDING';
    case 'Content Video/Marketing':
      return 'OTHER';
    default:
      return undefined;
  }
};

const statusFromApi = (status: string): Project['status'] => {
  switch (status) {
    case 'ACTIVE':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'DONE';
    case 'ON_HOLD':
      return 'ON_HOLD';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'QUOTATION_PENDING';
  }
};

const statusToApi = (status?: Project['status']): string | undefined => {
  switch (status) {
    case 'DRAFT':
    case 'QUOTATION_PENDING':
      return 'DRAFT';
    case 'QUOTATION_APPROVED':
    case 'IN_PROGRESS':
      return 'ACTIVE';
    case 'ON_HOLD':
      return 'ON_HOLD';
    case 'DONE':
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return undefined;
  }
};

const mapBackendProject = (project: BackendProject): Project => {
  const totalPaid =
    project.payments?.reduce((total, payment) => total + toNumber(payment.amount), 0) ?? 0;
  const totalCost =
    project.productionCosts?.reduce((total, item) => total + toNumber(item.amount), 0) ?? 0;

  return {
    id: project.id,
    name: project.name,
    category: categoryFromApi(project.category),
    clientId: project.clientId,
    clientName: project.client?.company?.name ?? project.client?.name,
    clientType: project.clientType ?? undefined,
    projectManagerId: project.projectManagerId ?? undefined,
    projectManagerName: project.projectManager?.name,
    status: statusFromApi(project.status),
    startDate: project.startDate?.slice(0, 10),
    endDate: project.endDate?.slice(0, 10),
    projectStarts: project.eventDate?.slice(0, 10) ?? project.startDate?.slice(0, 10),
    deadline: project.endDate?.slice(0, 10),
    venue: project.venue ?? undefined,
    budget: toNumber(project.contractValue),
    totalPaid,
    restOfBill: Math.max(0, toNumber(project.contractValue) - totalPaid),
    totalCost,
    generalBrief: project.description ?? '',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    additionalLinks: project.links?.map((link) => ({
      id: link.id,
      title: link.label,
      url: link.url,
    })),
    tasks: project.tasks?.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      dueDate: task.dueDate?.slice(0, 10) ?? '',
      picName: task.assignedTo?.name ?? '',
      assignedToId: task.assignedToId ?? undefined,
      progress: task.progress ?? 0,
      status: task.status,
    })),
    paymentHistory: project.payments?.map((payment) => ({
      id: payment.id,
      date: payment.paidAt.slice(0, 10),
      amount: toNumber(payment.amount),
      paymentMethod: payment.paymentMethod ?? '',
      toAccount: payment.bankTo ?? '',
      fromAccount: payment.bankAccount ?? '',
      notes: payment.note ?? '',
    })),
    costItems: project.productionCosts?.map((item) => ({
      id: item.id,
      projectId: project.id,
      category: item.category,
      description: item.description ?? '',
      executor: item.executorName ?? '',
      unitCost: toNumber(item.unitPrice),
      quantity: item.quantity,
      unit: '',
      freq: item.frequency,
      period: item.period ?? '',
      totalCost: toNumber(item.amount),
    })),
    quotationItems: project.quotations?.flatMap((quotation) => quotation.items.map((item) => ({
      id: item.id,
      projectId: project.id,
      category: 'Quotation',
      description: item.item,
      executor: item.description ?? '',
      unitCost: toNumber(item.unitPrice),
      quantity: item.quantity,
      unit: '',
      freq: item.frequency,
      period: item.period ?? '',
      totalCost: toNumber(item.subTotal),
    }))),
    invoiceItems: project.invoices?.flatMap((invoice) => invoice.items.map((item) => ({
      id: item.id,
      projectId: project.id,
      category: 'Invoice',
      description: item.item,
      executor: item.description ?? '',
      unitCost: toNumber(item.unitPrice),
      quantity: item.quantity,
      unit: '',
      freq: item.frequency,
      period: item.period ?? '',
      totalCost: toNumber(item.subTotal),
    }))),
  };
};

const projectToApi = (project: Partial<Project>, includeStatus = true) => ({
  ...(project.name !== undefined && { name: project.name }),
  ...((project.picClientId || project.clientId) && {
    clientId: project.picClientId || project.clientId,
  }),
  ...(project.projectManagerId && { projectManagerId: project.projectManagerId }),
  ...(project.clientType && { clientType: project.clientType }),
  ...(project.partnershipModel && { partnershipModel: project.partnershipModel }),
  ...(project.category && { category: categoryToApi(project.category) }),
  ...(project.venue && { venue: project.venue }),
  ...(project.budget !== undefined && { contractValue: project.budget }),
  ...((project.startDate || project.projectStarts) && {
    startDate: project.startDate || project.projectStarts,
  }),
  ...((project.endDate || project.deadline) && {
    endDate: project.endDate || project.deadline,
  }),
  ...(project.projectStarts && { eventDate: project.projectStarts }),
  ...((project.description !== undefined || project.generalBrief !== undefined) && {
    description: project.description ?? project.generalBrief,
  }),
  ...(includeStatus && project.status && { status: statusToApi(project.status) }),
});

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
            (p.code?.toLowerCase().includes(q) ?? false) ||
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

    const apiParams: Record<string, unknown> = {
      ...params,
      category: categoryToApi(params?.category),
      status:
        params?.status === 'DONE'
          ? 'COMPLETED'
          : params?.status
            ? statusToApi(params.status as Project['status'])
            : undefined,
    };
    // projectManagerId tidak didukung oleh BE saat ini (QueryProjectDto whitelist) — tidak dikirim ke API
    delete apiParams.projectManagerId;

    const response = await apiClient.get<BackendPaginatedProjects>('/projects', {
      params: apiParams,
    });
    return {
      data: response.data.data.map(mapBackendProject),
      total: response.data.meta.total,
    };
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((p) => p.id === id) ?? null);
    }
    const response = await apiClient.get<BackendProject>(`/projects/${id}`);
    return mapBackendProject(response.data);
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

    const response = await apiClient.post<BackendProject>(
      '/projects',
      projectToApi(projectData, false)
    );
    return mapBackendProject(response.data);
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Project dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...projectData };
      return cloneMock(store[index]);
    }

    const response = await apiClient.patch<BackendProject>(
      `/projects/${id}`,
      projectToApi(projectData)
    );
    return mapBackendProject(response.data);
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
