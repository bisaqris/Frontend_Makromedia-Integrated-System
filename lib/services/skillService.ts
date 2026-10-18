import { apiClient } from '@/lib/apiClient';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '@/types/manpower';
import { mockSkills } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: Skill[] | null = null;
const getMockStore = (): Skill[] => (mockStore ??= cloneMock(mockSkills));

export const skillService = {
  async getAll(): Promise<Skill[]> {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<Skill[]>('/skills');
    return response.data;
  },

  async getById(id: string): Promise<Skill> {
    if (USE_MOCK) {
      const skill = getMockStore().find((s) => s.id === id);
      if (!skill) throw new Error(`Skill dengan id "${id}" tidak ditemukan.`);
      return cloneMock(skill);
    }
    const response = await apiClient.get<Skill>(`/skills/${id}`);
    return response.data;
  },

  async create(data: CreateSkillDTO): Promise<Skill> {
    if (USE_MOCK) {
      const newSkill: Skill = {
        ...data,
        id: crypto.randomUUID(),
        status: data.status ?? 'ACTIVE',
        usedBy: 0,
        createdAt: new Date().toISOString(),
      };
      getMockStore().push(newSkill);
      return cloneMock(newSkill);
    }
    const response = await apiClient.post<Skill>('/skills', data);
    return response.data;
  },

  async update(id: string, data: UpdateSkillDTO): Promise<Skill> {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Skill dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<Skill>(`/skills/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((s) => s.id !== id);
      return;
    }
    await apiClient.delete(`/skills/${id}`);
  },
};
