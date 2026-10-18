import { apiClient } from '@/lib/apiClient';
import { ApplicationCostItem } from '@/types/application-cost';
import { mockApplicationCosts } from '@/lib/mock/application-cost.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: ApplicationCostItem[] | null = null;
const getMockStore = (): ApplicationCostItem[] => (mockStore ??= cloneMock(mockApplicationCosts));

export const applicationCostService = {
  getAll: async (): Promise<ApplicationCostItem[]> => {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<ApplicationCostItem[]>('/application-costs');
    return response.data;
  },

  getById: async (id: string): Promise<ApplicationCostItem | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((item) => item.id === id) ?? null);
    }
    const response = await apiClient.get<ApplicationCostItem>(`/application-costs/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<ApplicationCostItem>): Promise<ApplicationCostItem> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Application Cost dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<ApplicationCostItem>(`/application-costs/${id}`, data);
    return response.data;
  },
};
