import { apiClient } from '@/lib/apiClient';
import { CreateManpowerDTO, ManpowerRecord, UpdateManpowerDTO } from '@/types/manpower';
import { mockManpowerRecords } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: ManpowerRecord[] | null = null;
const getMockStore = (): ManpowerRecord[] => (mockStore ??= cloneMock(mockManpowerRecords));

export const manpowerService = {
  getAll: async (): Promise<ManpowerRecord[]> => {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<ManpowerRecord[]>('/manpower');
    return response.data;
  },

  getById: async (id: string): Promise<ManpowerRecord | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((m) => m.id === id) ?? null);
    }
    const response = await apiClient.get<ManpowerRecord>(`/manpower/${id}`);
    return response.data;
  },

  create: async (data: CreateManpowerDTO): Promise<ManpowerRecord> => {
    if (USE_MOCK) {
      const newRecord: ManpowerRecord = {
        ...data,
        id: `mp-${crypto.randomUUID()}`,
        joinDate: data.joinDate ?? new Date().toISOString().slice(0, 10),
      };
      getMockStore().unshift(newRecord);
      return cloneMock(newRecord);
    }
    const response = await apiClient.post<ManpowerRecord>('/manpower', data);
    return response.data;
  },

  update: async (id: string, data: UpdateManpowerDTO): Promise<ManpowerRecord> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((m) => m.id === id);
      if (index === -1) throw new Error(`Manpower dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<ManpowerRecord>(`/manpower/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((m) => m.id !== id);
      return;
    }
    await apiClient.delete(`/manpower/${id}`);
  },
};
