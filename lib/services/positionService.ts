import { apiClient } from '@/lib/apiClient';
import { Position, CreatePositionDTO, UpdatePositionDTO } from '@/types/manpower';
import { mockPositions } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';
import { getMockManpowerStore } from './manpowerService';

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

interface BackendPosition {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { users: number; manpower: number };
}

interface AssignedUserPosition {
  position?: string;
  positionId?: string;
}

const getAssignedUserPositions = (): AssignedUserPosition[] => {
  if (typeof window === 'undefined') return [];
  const results: AssignedUserPosition[] = [];
  try {
    const raw = localStorage.getItem('makromedia_user_assigned_positions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        results.push(...(Object.values(parsed) as AssignedUserPosition[]));
      }
    }
  } catch {
    // ignore
  }
  try {
    const rawProfile = localStorage.getItem('makromedia_user_profile');
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      if (parsed && (parsed.position || parsed.positionId)) {
        results.push({ position: parsed.position, positionId: parsed.positionId });
      }
    }
  } catch {
    // ignore
  }
  return results;
};

const countAssignedPositions = (pId: string, pName: string, assigned: AssignedUserPosition[]): number => {
  const pNameLower = pName.trim().toLowerCase();
  return assigned.filter((u) => {
    if (u.positionId && u.positionId === pId) return true;
    const uPos = (u.position || '').trim().toLowerCase();
    if (uPos && uPos === pNameLower) return true;
    if (
      (pNameLower === 'production' || pNameLower === 'produksi') &&
      (uPos === 'production' || uPos === 'produksi')
    ) {
      return true;
    }
    return false;
  }).length;
};

const mapBackendPosition = (item: BackendPosition): Position => ({
  id: item.id,
  name: item.name,
  status: item.isActive ? 'ACTIVE' : 'INACTIVE',
  usedBy: (item._count?.users ?? 0) + (item._count?.manpower ?? 0),
  createdAt: item.createdAt,
});

export const positionService = {
  async getAll(): Promise<Position[]> {
    if (USE_MOCK) {
      const store = getMockStore();
      const mockEmps = getMockManpowerStore();
      const assignedUsers = getAssignedUserPositions();
      let mockUsersList: Array<{ role?: string; department?: string }> = [];
      try {
        const { mockUsers } = await import('@/lib/mock/users.mock');
        mockUsersList = mockUsers;
      } catch {
        // ignore
      }

      return cloneMock(
        store.map((p) => {
          const pNameLower = p.name.trim().toLowerCase();

          // 1. Hitung karyawan di mock manpower
          const matchedEmps = mockEmps.filter((e) => {
            const ePos = (e.position || '').trim().toLowerCase();
            if (ePos === pNameLower) return true;
            if (
              (pNameLower === 'production' || pNameLower === 'produksi') &&
              (ePos === 'production' || ePos === 'produksi')
            ) {
              return true;
            }
            return false;
          }).length;

          // 2. Hitung user internal di mock users (khususnya tim Produksi atau role terkait)
          const matchedUsers = mockUsersList.filter((u) => {
            const uRole = (u.role || '').toLowerCase();
            const uDept = (u.department || '').toLowerCase();
            if (
              (pNameLower === 'production' || pNameLower === 'produksi') &&
              (uRole === 'produksi' || uDept.includes('produksi'))
            ) {
              return true;
            }
            if (pNameLower === 'director' && uRole === 'direktur') return true;
            if (pNameLower === 'finance' && uRole === 'finance') return true;
            if (pNameLower === 'sales' && uRole === 'sales') return true;
            if (pNameLower === 'project manager' && uRole === 'project_manager') return true;
            return false;
          }).length;

          // 3. Hitung user yang memilih posisi ini di halaman Profile (misalnya Sales memilih 'Actor')
          const matchedAssigned = countAssignedPositions(p.id, p.name, assignedUsers);

          const dynamicCount = matchedEmps + matchedUsers + matchedAssigned;
          const baseline = p.usedBy ?? 0;

          return {
            ...p,
            usedBy: Math.max(baseline, dynamicCount),
          };
        })
      );
    }

    try {
      const [posRes, mpRes, userRes] = await Promise.allSettled([
        apiClient.get<BackendPosition[]>('/positions'),
        apiClient.get<{ data: Array<{ id: string; position?: string; positionId?: string }> }>('/manpower', {
          params: { page: 1, limit: 100 },
        }),
        apiClient.get<Array<{ id: string; role?: string; positionId?: string }>>('/users/production-team'),
      ]);

      const rawPositions: BackendPosition[] =
        posRes.status === 'fulfilled' && Array.isArray(posRes.value.data)
          ? posRes.value.data
          : [];

      const manpowerList =
        mpRes.status === 'fulfilled' && Array.isArray(mpRes.value.data?.data)
          ? mpRes.value.data.data
          : [];

      const prodUsers =
        userRes.status === 'fulfilled' && Array.isArray(userRes.value.data)
          ? userRes.value.data
          : [];

      const assignedUsers = getAssignedUserPositions();

      return rawPositions.map((item) => {
        const mapped = mapBackendPosition(item);
        const pNameLower = item.name.trim().toLowerCase();

        // 1. Prisma backend foreign-key count
        const dbCount = (item._count?.users ?? 0) + (item._count?.manpower ?? 0);

        // 2. Manpower matching by positionId or string position
        const matchedManpower = manpowerList.filter((m) => {
          if (m.positionId && m.positionId === item.id) return true;
          const mPos = (m.position || '').trim().toLowerCase();
          if (mPos === pNameLower) return true;
          if (
            (pNameLower === 'production' || pNameLower === 'produksi') &&
            (mPos === 'production' || mPos === 'produksi')
          ) {
            return true;
          }
          return false;
        }).length;

        // 3. Count production team users for "Production" / "Produksi"
        const matchedProdUsers =
          pNameLower === 'production' || pNameLower === 'produksi'
            ? prodUsers.filter((u) => u.role === 'PRODUKSI' || !u.role).length
            : 0;

        // 4. Count users that assigned this position in their Profile
        const matchedAssigned = countAssignedPositions(item.id, item.name, assignedUsers);

        mapped.usedBy = Math.max(dbCount, matchedManpower + matchedProdUsers + matchedAssigned);
        return mapped;
      });
    } catch {
      const response = await apiClient.get<BackendPosition[]>('/positions');
      return Array.isArray(response.data) ? response.data.map(mapBackendPosition) : [];
    }
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
    const response = await apiClient.get<BackendPosition>(`/positions/${id}`);
    return mapBackendPosition(response.data);
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
    const response = await apiClient.post<BackendPosition>('/positions', {
      name: data.name.trim(),
      ...(data.status && { isActive: data.status === 'ACTIVE' }),
    });
    return mapBackendPosition(response.data);
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
    const payload: { name?: string; isActive?: boolean } = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.status !== undefined) payload.isActive = data.status === 'ACTIVE';

    const response = await apiClient.patch<BackendPosition>(`/positions/${id}`, payload);
    return mapBackendPosition(response.data);
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
