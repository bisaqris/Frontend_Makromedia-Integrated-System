import { apiClient } from '@/lib/apiClient';
import { Position, CreatePositionDTO, UpdatePositionDTO } from '@/types/manpower';
import { mockPositions } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

const STORAGE_KEY = 'makromedia_positions';

let mockStore: Position[] | null = null;

const loadMockStore = (): Position[] => {
  if (typeof window === 'undefined') return cloneMock(mockPositions);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPositions));
      return cloneMock(mockPositions);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return cloneMock(mockPositions);
};

const saveMockStore = (items: Position[]) => {
  mockStore = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
};

const getMockStore = (): Position[] => {
  if (!mockStore) {
    mockStore = loadMockStore();
  }
  return mockStore;
};

export const positionService = {
  async getAll(): Promise<Position[]> {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<Position[]>('/positions');
    return response.data;
  },

  async getActive(): Promise<Position[]> {
    const all = await positionService.getAll();
    return all.filter((p) => p.status === 'ACTIVE');
  },

  async getActiveNames(): Promise<string[]> {
    const active = await positionService.getActive();
    return active.map((p) => p.name);
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
      const store = getMockStore();
      const newPosition: Position = {
        ...data,
        id: crypto.randomUUID(),
        status: data.status ?? 'ACTIVE',
        usedBy: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [...store, newPosition];
      saveMockStore(updated);
      return cloneMock(newPosition);
    }
    const response = await apiClient.post<Position>('/positions', {
      name: data.name,
      status: data.status ?? 'ACTIVE',
      category: data.category,
    });
    return response.data;
  },

  async update(id: string, data: UpdatePositionDTO): Promise<Position> {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Position dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      saveMockStore([...store]);
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<Position>(`/positions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      const store = getMockStore();
      const filtered = store.filter((p) => p.id !== id);
      saveMockStore(filtered);
      return;
    }
    await apiClient.delete(`/positions/${id}`);
  },
};
