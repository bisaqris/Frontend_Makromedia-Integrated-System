import { apiClient } from '@/lib/apiClient';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '@/types/manpower';
import { mockSkills } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';
import { getMockManpowerStore } from './manpowerService';

const STORAGE_KEY = 'makromedia_skills';

let mockStore: Skill[] | null = null;

const loadMockStore = (): Skill[] => {
  if (typeof window === 'undefined') return cloneMock(mockSkills);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSkills));
      return cloneMock(mockSkills);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return cloneMock(mockSkills);
};

const saveMockStore = (items: Skill[]) => {
  mockStore = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
};

const getMockStore = (): Skill[] => {
  if (!mockStore) {
    mockStore = loadMockStore();
  }
  return mockStore;
};

interface BackendSkill {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { manpower: number; users?: number };
}

const mapBackendSkill = (item: BackendSkill): Skill => ({
  id: item.id,
  name: item.name,
  status: item.isActive ? 'ACTIVE' : 'INACTIVE',
  usedBy: (item._count?.manpower ?? 0) + (item._count?.users ?? 0),
  createdAt: item.createdAt,
});

export const skillService = {
  async getAll(): Promise<Skill[]> {
    if (USE_MOCK) {
      const store = getMockStore();
      const mockEmps = getMockManpowerStore();
      return cloneMock(
        store.map((s) => {
          const sNameLower = s.name.trim().toLowerCase();
          const matchedEmps = mockEmps.filter((e) =>
            (e.skills || []).some((sk) => {
              const skLower = sk.trim().toLowerCase();
              return skLower === sNameLower || sNameLower.includes(skLower) || skLower.includes(sNameLower);
            })
          ).length;
          const baseline = s.usedBy ?? 0;
          return {
            ...s,
            usedBy: Math.max(baseline, matchedEmps),
          };
        })
      );
    }

    try {
      const [skillRes, mpRes] = await Promise.allSettled([
        apiClient.get<BackendSkill[]>('/manpower/skills'),
        apiClient.get<{ data: Array<{ id: string; skill?: string; skills?: Array<{ skill: { id: string; name: string } }> }> }>('/manpower', {
          params: { page: 1, limit: 100 },
        }),
      ]);

      const rawSkills: BackendSkill[] =
        skillRes.status === 'fulfilled' && Array.isArray(skillRes.value.data)
          ? skillRes.value.data
          : [];

      const manpowerList =
        mpRes.status === 'fulfilled' && Array.isArray(mpRes.value.data?.data)
          ? mpRes.value.data.data
          : [];

      return rawSkills.map((item) => {
        const mapped = mapBackendSkill(item);
        const sNameLower = item.name.trim().toLowerCase();

        const dbCount = (item._count?.manpower ?? 0) + (item._count?.users ?? 0);

        const matchedManpower = manpowerList.filter((m) => {
          if (m.skills && m.skills.some((sk) => sk.skill?.id === item.id || sk.skill?.name?.trim().toLowerCase() === sNameLower)) {
            return true;
          }
          if (m.skill) {
            const parts = m.skill.split(',').map((x) => x.trim().toLowerCase());
            return parts.some((part) => part === sNameLower || sNameLower.includes(part) || part.includes(sNameLower));
          }
          return false;
        }).length;

        mapped.usedBy = Math.max(dbCount, matchedManpower);
        return mapped;
      });
    } catch {
      const response = await apiClient.get<BackendSkill[]>('/manpower/skills');
      return Array.isArray(response.data) ? response.data.map(mapBackendSkill) : [];
    }
  },

  async getActive(): Promise<Skill[]> {
    const all = await skillService.getAll();
    return all.filter((s) => s.status === 'ACTIVE');
  },

  async getActiveNames(): Promise<string[]> {
    const active = await skillService.getActive();
    return active.map((s) => s.name);
  },

  async getById(id: string): Promise<Skill> {
    if (USE_MOCK) {
      const skill = getMockStore().find((s) => s.id === id);
      if (!skill) throw new Error(`Skill dengan id "${id}" tidak ditemukan.`);
      return cloneMock(skill);
    }
    const skills = await skillService.getAll();
    const skill = skills.find((item) => item.id === id);
    if (!skill) throw new Error(`Skill dengan id "${id}" tidak ditemukan.`);
    return skill;
  },

  async create(data: CreateSkillDTO): Promise<Skill> {
    if (USE_MOCK) {
      const store = getMockStore();
      const newSkill: Skill = {
        ...data,
        id: crypto.randomUUID(),
        status: data.status ?? 'ACTIVE',
        usedBy: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [...store, newSkill];
      saveMockStore(updated);
      return cloneMock(newSkill);
    }
    const response = await apiClient.post<BackendSkill>('/manpower/skills', {
      name: data.name.trim(),
      ...(data.status && { isActive: data.status === 'ACTIVE' }),
    });
    return mapBackendSkill(response.data);
  },

  async update(id: string, data: UpdateSkillDTO): Promise<Skill> {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Skill dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      saveMockStore([...store]);
      return cloneMock(store[index]);
    }
    const payload: { name?: string; isActive?: boolean } = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.status !== undefined) payload.isActive = data.status === 'ACTIVE';

    const response = await apiClient.patch<BackendSkill>(`/manpower/skills/${id}`, payload);
    return mapBackendSkill(response.data);
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      const store = getMockStore();
      const filtered = store.filter((s) => s.id !== id);
      saveMockStore(filtered);
      return;
    }
    await apiClient.delete(`/manpower/skills/${id}`);
  },
};
