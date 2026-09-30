import { apiClient } from '@/lib/apiClient';
import { Position, CreatePositionDTO, UpdatePositionDTO } from '@/types/manpower';
import { mockPositions } from '@/lib/mock/manpower.mock'; 

let localPositions: Position[] = (mockPositions || []).map((p, i) => ({
    ...p,
    status: (i % 2 === 0 ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
    usedBy: [2, 1, 0, 3, 1, 2][i] ?? 0,
}));

export const positionService = {
    async getAll(): Promise<Position[]> {
        try {
            const response = await apiClient.get('/positions');
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            }
        } catch {
            // Silently fallback to mock data
        }
        return [...localPositions];
    },

    async getById(id: string): Promise<Position> {
        try {
            const response = await apiClient.get(`/positions/${id}`);
            return response.data;
        } catch {
            // fallback to mock data
        }
        const position = localPositions.find((p) => p.id === id);
        if (!position) throw new Error(`Position with id "${id}" not found`);
        return { ...position };
    },

    async create(data: CreatePositionDTO): Promise<Position> {
        try {
            const response = await apiClient.post('/positions', data);
            return response.data;
        } catch {
            // fallback to mock data
        }
        const newPosition: Position = {
            id: crypto.randomUUID(),
            name: data.name,
            status: data.status ?? 'ACTIVE',
            usedBy: 0,
            createdAt: new Date().toISOString(),
        };
        localPositions = [...localPositions, newPosition];
        return { ...newPosition };
    },

    async update(id: string, data: UpdatePositionDTO): Promise<Position> {
        try {
            const response = await apiClient.patch(`/positions/${id}`, data);
            return response.data;
        } catch {
            // fallback to mock data
        }
        const index = localPositions.findIndex((p) => p.id === id);
        if (index === -1) throw new Error(`Position with id "${id}" not found`);
        const updated: Position = { ...localPositions[index], ...data };
        localPositions = localPositions.map((p) => (p.id === id ? updated : p));
        return { ...updated };
    },

    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/positions/${id}`);
            localPositions = localPositions.filter((p) => p.id !== id);
            return;
        } catch {
            // fallback to mock data
        }
        localPositions = localPositions.filter((p) => p.id !== id);
    },
};