import { apiClient } from '@/lib/apiClient';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '@/types/manpower';
import { mockSkills } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

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

export const skillService = {
  async getAll(): Promise<Skill[]> {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<Skill[]>('/manpower/skills');
    return response.data;
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
    const response = await apiClient.post<Skill>('/manpower/skills', {
      name: data.name,
      status: data.status ?? 'ACTIVE',
      category: data.category,
    });
    return response.data;
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
    const response = await apiClient.patch<Skill>(`/manpower/skills/${id}`, data);
    return response.data;
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
