import { apiClient } from '@/lib/apiClient';
import {
  PaymentHistoryItem,
  ProjectCostItem,
  ProjectLink,
  ProjectProgress,
  ProjectTask,
} from '@/types/project';

interface BackendProductionCost {
  id: string;
  projectId: string;
  category: string;
  description?: string | null;
  executorName?: string | null;
  unitPrice: number | string;
  quantity: number;
  frequency: number;
  period?: string | null;
  amount: number | string;
}

interface BackendTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: ProjectTask['status'];
  progress?: number;
  assignedToId?: string | null;
  assignedTo?: { name?: string } | null;
}

interface BackendPayment {
  id: string;
  paidAt: string;
  amount: number | string;
  paymentMethod?: string | null;
  bankTo?: string | null;
  bankAccount?: string | null;
  note?: string | null;
}

interface BackendDocument {
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
}

const toNumber = (value: number | string): number => Number(value);

const mapCost = (item: BackendProductionCost): ProjectCostItem => ({
  id: item.id,
  projectId: item.projectId,
  category: item.category,
  description: item.description ?? '',
  executor: item.executorName ?? '',
  unitCost: toNumber(item.unitPrice),
  quantity: item.quantity,
  unit: '',
  freq: item.frequency,
  period: item.period ?? '',
  totalCost: toNumber(item.amount),
});

const mapTask = (task: BackendTask): ProjectTask => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  dueDate: task.dueDate?.slice(0, 10) ?? '',
  picName: task.assignedTo?.name ?? '',
  assignedToId: task.assignedToId ?? undefined,
  progress: task.progress ?? 0,
  status: task.status,
});

const mapPayment = (payment: BackendPayment): PaymentHistoryItem => ({
  id: payment.id,
  date: payment.paidAt.slice(0, 10),
  amount: toNumber(payment.amount),
  paymentMethod: payment.paymentMethod ?? '',
  toAccount: payment.bankTo ?? '',
  fromAccount: payment.bankAccount ?? '',
  notes: payment.note ?? '',
});

const mapDocumentItems = (document: BackendDocument, projectId: string): ProjectCostItem[] =>
  document.items.map((item) => ({
    id: item.id,
    projectId,
    category: '',
    description: item.item,
    executor: item.description ?? '',
    unitCost: toNumber(item.unitPrice),
    quantity: item.quantity,
    unit: '',
    freq: item.frequency,
    period: item.period ?? '',
    totalCost: toNumber(item.subTotal),
  }));

export const projectWorkflowService = {
  async getProductionCosts(projectId: string): Promise<ProjectCostItem[]> {
    const response = await apiClient.get<BackendProductionCost[]>(
      `/production-costs/project/${projectId}`
    );
    return response.data.map(mapCost);
  },

  async createProductionCost(
    projectId: string,
    item: Omit<ProjectCostItem, 'id' | 'projectId'>
  ): Promise<ProjectCostItem> {
    const response = await apiClient.post<BackendProductionCost>('/production-costs', {
      projectId,
      category: item.category,
      description: item.description,
      executorName: item.executor,
      unitPrice: item.unitCost,
      quantity: item.quantity,
      frequency: item.freq,
      period: item.period,
    });
    return mapCost(response.data);
  },

  async updateProductionCost(
    id: string,
    item: Omit<ProjectCostItem, 'id' | 'projectId'>
  ): Promise<ProjectCostItem> {
    const response = await apiClient.patch<BackendProductionCost>(`/production-costs/${id}`, {
      category: item.category,
      description: item.description,
      executorName: item.executor,
      unitPrice: item.unitCost,
      quantity: item.quantity,
      frequency: item.freq,
      period: item.period,
    });
    return mapCost(response.data);
  },

  deleteProductionCost: async (id: string): Promise<void> => {
    await apiClient.delete(`/production-costs/${id}`);
  },

  async createQuotation(
    projectId: string,
    items: ProjectCostItem[]
  ): Promise<ProjectCostItem[]> {
    const response = await apiClient.post<BackendDocument>('/quotations', {
      projectId,
      quotationNumber: `QUO-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      items: items.map((item) => ({
        item: item.description,
        description: item.executor,
        unitPrice: item.unitCost,
        quantity: item.quantity,
        frequency: item.freq || 1,
        period: item.period || undefined,
      })),
    });
    return mapDocumentItems(response.data, projectId);
  },

  async createInvoice(projectId: string, items: ProjectCostItem[]): Promise<ProjectCostItem[]> {
    const response = await apiClient.post<BackendDocument>('/invoices', {
      projectId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      items: items.map((item) => ({
        item: item.description,
        description: item.executor,
        unitPrice: item.unitCost,
        quantity: item.quantity,
        frequency: item.freq || 1,
        period: item.period || undefined,
      })),
    });
    return mapDocumentItems(response.data, projectId);
  },

  async createTask(
    projectId: string,
    task: Omit<ProjectTask, 'id'>
  ): Promise<ProjectTask> {
    const response = await apiClient.post<BackendTask>(`/projects/${projectId}/tasks`, {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || undefined,
      status: task.status,
      progress: task.progress ?? (task.status === 'DONE' ? 100 : 0),
    });
    return mapTask(response.data);
  },

  async updateTask(id: string, task: Omit<ProjectTask, 'id'>): Promise<ProjectTask> {
    const response = await apiClient.patch<BackendTask>(`/tasks/${id}`, {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || undefined,
      status: task.status,
    });
    return mapTask(response.data);
  },

  async updateTaskProgress(id: string, progress: number): Promise<ProjectTask> {
    const response = await apiClient.patch<BackendTask>(`/tasks/${id}/progress`, { progress });
    return mapTask(response.data);
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  async createPayment(
    projectId: string,
    payment: Omit<PaymentHistoryItem, 'id'>
  ): Promise<PaymentHistoryItem> {
    const response = await apiClient.post<BackendPayment>(
      `/projects/${projectId}/payments`,
      {
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        bankTo: payment.toAccount,
        bankAccount: payment.fromAccount,
        note: payment.notes,
        paidAt: payment.date,
      }
    );
    return mapPayment(response.data);
  },

  async getLinks(projectId: string): Promise<ProjectLink[]> {
    try {
      const response = await apiClient.get<ProjectLink[]>(`/projects/${projectId}/links`);
      return response.data;
    } catch {
      return [];
    }
  },

  async createLink(
    projectId: string,
    link: { label: string; url: string }
  ): Promise<ProjectLink> {
    const response = await apiClient.post<ProjectLink>(`/projects/${projectId}/links`, link);
    return response.data;
  },

  async updateLink(
    projectId: string,
    linkId: string,
    link: { label?: string; url?: string }
  ): Promise<ProjectLink> {
    const response = await apiClient.patch<ProjectLink>(
      `/projects/${projectId}/links/${linkId}`,
      link
    );
    return response.data;
  },

  async deleteLink(projectId: string, linkId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/links/${linkId}`);
  },

  async getProgress(projectId: string): Promise<ProjectProgress[]> {
    try {
      const response = await apiClient.get<ProjectProgress[]>(`/projects/${projectId}/progress`);
      return response.data;
    } catch {
      return [];
    }
  },

  async createProgress(
    projectId: string,
    progress: { percentage: number; notes?: string }
  ): Promise<ProjectProgress> {
    const response = await apiClient.post<ProjectProgress>(
      `/projects/${projectId}/progress`,
      progress
    );
    return response.data;
  },

  async deleteProgress(projectId: string, progressId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/progress/${progressId}`);
  },
};
