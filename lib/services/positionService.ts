import { apiClient } from '@/lib/apiClient';
import { Position, CreatePositionDTO, UpdatePositionDTO } from '@/types/manpower';
import { mockPositions } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: Position[] | null = null;
const getMockStore = (): Position[] => (mockStore ??= cloneMock(mockPositions));

export const positionService = {
  async getAll(): Promise<Position[]> {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<Position[]>('/positions');
    return response.data;
  },

  async getById(id: string): Promise<Position> {
    if (USE_MOCK) {
      const position = getMockStore().find((p) => p.id === id);
      if (!position) throw new Error(`Position dengan id "${id}" tidak ditemukan.`);
      return cloneMock(position);
    }
    const response = await apiClient.get<Position>(`/positions/${id}`);
    return response.data;
  },

  async create(data: CreatePositionDTO): Promise<Position> {
    if (USE_MOCK) {
      const newPosition: Position = {
        ...data,
        id: crypto.randomUUID(),
        status: data.status ?? 'ACTIVE',
        usedBy: 0,
        createdAt: new Date().toISOString(),
      };
      getMockStore().push(newPosition);
      return cloneMock(newPosition);
    }
    const response = await apiClient.post<Position>('/positions', data);
    return response.data;
  },

  async update(id: string, data: UpdatePositionDTO): Promise<Position> {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Position dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<Position>(`/positions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((p) => p.id !== id);
      return;
    }
    await apiClient.delete(`/positions/${id}`);
  },
};
