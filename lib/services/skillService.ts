import { apiClient } from '@/lib/apiClient';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '@/types/manpower';

export const skillService = {
    // Get all skills
    async getAll(): Promise<Skill[]> {
        const response = await apiClient.get<Skill[]>('/skills');
        return response.data;
    },

    // Get skill by ID
    async getById(id: string): Promise<Skill> {
        const response = await apiClient.get<Skill>(`/skills/${id}`);
        return response.data;
    },

    // Create new skill
    async create(data: CreateSkillDTO): Promise<Skill> {
        const response = await apiClient.post<Skill>('/skills', data);
        return response.data;
    },

    // Update existing skill
    async update(id: string, data: UpdateSkillDTO): Promise<Skill> {
        const response = await apiClient.patch<Skill>(`/skills/${id}`, data);
        return response.data;
    },

    // Delete skill
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/skills/${id}`);
    },
};