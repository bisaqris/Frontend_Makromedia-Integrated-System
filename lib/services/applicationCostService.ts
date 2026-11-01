import { apiClient } from '@/lib/apiClient';
import {
  ApplicationCostDocType,
  ApplicationCostItem,
  ApplicationCostStatus,
} from '@/types/application-cost';
import { mockApplicationCosts } from '@/lib/mock/application-cost.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

interface BackendProject {
  id: string;
  name: string;
  contractValue?: number | string;
  venue?: string | null;
  eventDate?: string | null;
  client?: { name?: string; company?: { name?: string } };
}

interface BackendProjectsPage {
  data: BackendProject[];
  meta: { totalPages: number };
}

interface BackendLineItem {
  id: string;
  item: string;
  description?: string | null;
  quantity: number;
  unitPrice: number | string;
  frequency?: number;
  period?: string | null;
  subTotal: number | string;
}

interface BackendQuotation {
  id: string;
  projectId: string;
  quotationNumber: string;
  subtotal: number | string;
  discountPercent: number | string;
  taxAmount: number | string;
  totalValue: number | string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  createdAt: string;
  items: BackendLineItem[];
}

interface BackendInvoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  amount: number | string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate?: string | null;
  paymentInstruction?: string | null;
  notes?: string | null;
  createdAt: string;
  items: BackendLineItem[];
}

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionNote?: string | null;
  createdAt: string;
  project?: { id: string; name: string };
}

const toNumber = (value: number | string | null | undefined): number =>
  Number(value ?? 0);

const formatDate = (value?: string | null): string =>
  value ? value.slice(0, 10) : '';

let mockStore: ApplicationCostItem[] | null = null;
const getMockStore = (): ApplicationCostItem[] =>
  (mockStore ??= cloneMock(mockApplicationCosts));

const mapLineItems = (items: BackendLineItem[]) =>
  items.map((item) => ({
    id: item.id,
    itemName: item.item,
    descriptions: item.description ? [item.description] : [],
    unitPrice: toNumber(item.unitPrice),
    quantity: item.quantity,
    freq: item.frequency ?? 1,
    period: item.period ?? '',
    subTotal: toNumber(item.subTotal),
  }));

const mapQuotation = (
  quotation: BackendQuotation,
  project: BackendProject
): ApplicationCostItem => ({
  id: quotation.id,
  projectId: quotation.projectId,
  projectName: project.name,
  applicationDocument: 'Quotation',
  applicationDate: formatDate(quotation.createdAt),
  totalCost: toNumber(quotation.totalValue),
  status: quotation.status,
  venue: project.venue ?? undefined,
  eventDate: formatDate(project.eventDate),
  mainClient: project.client?.company?.name ?? project.client?.name,
  documentNumber: quotation.quotationNumber,
  releaseDate: formatDate(quotation.createdAt),
  contractValue: toNumber(quotation.totalValue),
  lineItems: mapLineItems(quotation.items),
  discountPercent: toNumber(quotation.discountPercent),
  pph: toNumber(quotation.taxAmount),
  notes: quotation.notes ?? undefined,
});

const mapInvoice = (
  invoice: BackendInvoice,
  project: BackendProject
): ApplicationCostItem => ({
  id: invoice.id,
  projectId: invoice.projectId,
  projectName: project.name,
  applicationDocument: 'Invoice',
  applicationDate: formatDate(invoice.createdAt),
  totalCost: toNumber(invoice.amount),
  status: invoice.status,
  venue: project.venue ?? undefined,
  eventDate: formatDate(project.eventDate),
  mainClient: project.client?.company?.name ?? project.client?.name,
  documentNumber: invoice.invoiceNumber,
  releaseDate: formatDate(invoice.createdAt),
  dueDate: formatDate(invoice.dueDate),
  contractValue:
    project.contractValue == null ? undefined : toNumber(project.contractValue),
  lineItems: mapLineItems(invoice.items),
  paymentInstruction: invoice.paymentInstruction ?? undefined,
  notes: invoice.notes ?? undefined,
});

const mapProductionCost = (
  cost: BackendProductionCost,
  project: BackendProject
): ApplicationCostItem => ({
  id: cost.id,
  projectId: cost.projectId,
  projectName: project.name,
  applicationDocument: 'Production Cost',
  applicationDate: formatDate(cost.createdAt),
  totalCost: toNumber(cost.amount),
  status: cost.status,
  projectOfficer: cost.executorName ?? undefined,
  venue: project.venue ?? undefined,
  eventDate: formatDate(project.eventDate),
  mainClient: project.client?.company?.name ?? project.client?.name,
  contractValue: toNumber(project.contractValue),
  estimateCost: toNumber(cost.amount),
  estimateProfit: toNumber(project.contractValue) - toNumber(cost.amount),
  costPercent: project.contractValue
    ? (toNumber(cost.amount) / toNumber(project.contractValue)) * 100
    : 0,
  notes: cost.rejectionNote ?? undefined,
  categories: [
    {
      number: 1,
      categoryName: cost.category,
      items: [
        {
          id: cost.id,
          itemName: cost.description ?? cost.category,
          executorName: cost.executorName ?? '',
          unitPrice: toNumber(cost.unitPrice),
          quantity: cost.quantity,
          unitLabel: '',
          freq: cost.frequency,
          freqUnitLabel: '',
          period: cost.period ?? '',
          subTotal: toNumber(cost.amount),
        },
      ],
    },
  ],
});

async function loadProjects(): Promise<BackendProject[]> {
  const firstPage = await apiClient.get<BackendProjectsPage>('/projects', {
    params: { page: 1, limit: 100 },
  });
  const projects = [...firstPage.data.data];
  const pageCount = firstPage.data.meta.totalPages;
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      apiClient.get<BackendProjectsPage>('/projects', {
        params: { page: index + 2, limit: 100 },
      })
    )
  );
  remainingPages.forEach((page) => projects.push(...page.data.data));
  return projects;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  map: (value: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await map(values[index]);
      }
    }
  );
  await Promise.all(workers);
  return results;
}

async function loadBackendItems(): Promise<ApplicationCostItem[]> {
  const projects = await loadProjects();
  const projectDocuments = await mapWithConcurrency(projects, 6, async (project) => {
    const [costResponse, quotationResponse, invoiceResponse] = await Promise.all([
      apiClient.get<BackendProductionCost[]>(
        `/production-costs/project/${project.id}`
      ),
      apiClient.get<BackendQuotation[]>(`/quotations/project/${project.id}`),
      apiClient.get<BackendInvoice[]>(`/invoices/project/${project.id}`),
    ]);
    return {
      project,
      costs: costResponse.data,
      quotations: quotationResponse.data,
      invoices: invoiceResponse.data,
    };
  });

  const documents = projectDocuments.flatMap(({ project, costs, quotations, invoices }) => [
    ...costs.map((cost) => mapProductionCost(cost, project)),
    ...quotations.map((quotation) => mapQuotation(quotation, project)),
    ...invoices.map((invoice) => mapInvoice(invoice, project)),
  ]);

  return documents.sort((a, b) =>
    b.applicationDate.localeCompare(a.applicationDate)
  );
}

export const applicationCostService = {
  getAll: async (): Promise<ApplicationCostItem[]> => {
    if (USE_MOCK) return cloneMock(getMockStore());
    return loadBackendItems();
  },

  getById: async (
    id: string,
    documentType?: ApplicationCostDocType
  ): Promise<ApplicationCostItem | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((item) => item.id === id) ?? null);
    }

    if (documentType === 'Production Cost') {
      return (await loadBackendItems()).find((item) => item.id === id) ?? null;
    }

    if (documentType === 'Quotation') {
      const response = await apiClient.get<BackendQuotation>(`/quotations/${id}`);
      const projectResponse = await apiClient.get<BackendProject>(
        `/projects/${response.data.projectId}`
      );
      return mapQuotation(response.data, projectResponse.data);
    }

    if (documentType === 'Invoice') {
      const response = await apiClient.get<BackendInvoice>(`/invoices/${id}`);
      const projectResponse = await apiClient.get<BackendProject>(
        `/projects/${response.data.projectId}`
      );
      return mapInvoice(response.data, projectResponse.data);
    }

    return (await loadBackendItems()).find((item) => item.id === id) ?? null;
  },

  updateStatus: async (
    id: string,
    documentType: ApplicationCostDocType,
    status: ApplicationCostStatus,
    notes?: string
  ): Promise<void> => {
    if (USE_MOCK) {
      const item = getMockStore().find((record) => record.id === id);
      if (!item) throw new Error(`Dokumen dengan id "${id}" tidak ditemukan.`);
      item.status =
        status === 'APPROVED' ? 'Approved' :
        status === 'REJECTED' ? 'Revise' :
        status;
      item.notes = notes;
      return;
    }

    if (documentType === 'Production Cost') {
      if (status === 'APPROVED' || status === 'Approved') {
        await apiClient.patch(`/production-costs/${id}/approve`);
        return;
      }
      if (status === 'REJECTED' || status === 'Revise') {
        await apiClient.patch(`/production-costs/${id}/reject`, {
          rejectionNote: notes ?? '',
        });
        return;
      }
      throw new Error(`Status "${status}" tidak didukung untuk production cost.`);
    }

    if (documentType === 'Quotation') {
      const apiStatus =
        status === 'Approved' ? 'APPROVED' :
        status === 'Revise' ? 'REJECTED' :
        status;
      if (!['SENT', 'APPROVED', 'REJECTED'].includes(apiStatus)) {
        throw new Error(`Status "${status}" tidak didukung untuk quotation.`);
      }
      await apiClient.patch(`/quotations/${id}/status`, { status: apiStatus });
      return;
    }

    const apiStatus = status.toUpperCase();
    if (!['SENT', 'PAID', 'OVERDUE'].includes(apiStatus)) {
      throw new Error(`Status "${status}" tidak didukung untuk invoice.`);
    }
    await apiClient.patch(`/invoices/${id}/status`, { status: apiStatus });
  },
};
