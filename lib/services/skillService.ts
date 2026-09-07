import { apiClient } from '@/lib/apiClient';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '@/types/manpower';
import { mockSkills } from '@/lib/mock/manpower.mock';

// Local state for mock CRUD operations (used when API is not available)
let localSkills: Skill[] = mockSkills.map((s, i) => ({
    ...s,
    status: (i % 2 === 0 ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
    usedBy: [2, 1, 0, 3, 1, 2][i] ?? 0,
}));

export const skillService = {
    // Get all skills
    async getAll(): Promise<Skill[]> {
        try {
            const response = await apiClient.get<Skill[]>('/skills');
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            }
        } catch {
            // Fallback to local mock data
        }
        return [...localSkills];
    },

    // Get skill by ID
    async getById(id: string): Promise<Skill> {
        try {
            const response = await apiClient.get<Skill>(`/skills/${id}`);
            return response.data;
        } catch {
            // Fallback to local mock data
        }
        const skill = localSkills.find((s) => s.id === id);
        if (!skill) throw new Error(`Skill with id "${id}" not found`);
        return { ...skill };
    },

    // Create new skill
    async create(data: CreateSkillDTO): Promise<Skill> {
        try {
            const response = await apiClient.post<Skill>('/skills', data);
            return response.data;
        } catch {
            // Fallback: create locally with a generated id
        }
        const newSkill: Skill = {
            id: crypto.randomUUID(),
            name: data.name,
            status: data.status ?? 'ACTIVE',
            usedBy: 0,
            createdAt: new Date().toISOString(),
        };
        localSkills = [...localSkills, newSkill];
        return { ...newSkill };
    },

    // Update existing skill
    async update(id: string, data: UpdateSkillDTO): Promise<Skill> {
        try {
            const response = await apiClient.patch<Skill>(`/skills/${id}`, data);
            return response.data;
        } catch {
            // Fallback: update locally
        }
        const index = localSkills.findIndex((s) => s.id === id);
        if (index === -1) throw new Error(`Skill with id "${id}" not found`);
        const updated: Skill = { ...localSkills[index], ...data };
        localSkills = localSkills.map((s) => (s.id === id ? updated : s));
        return { ...updated };
    },

    // Delete skill
    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/skills/${id}`);
            localSkills = localSkills.filter((s) => s.id !== id);
            return;
        } catch {
            // Fallback: delete locally
        }
        localSkills = localSkills.filter((s) => s.id !== id);
    },
};