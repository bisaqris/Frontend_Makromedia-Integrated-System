import { CostCategory, CreateCostCategoryDTO } from '@/types/cost-category';
import { apiClient } from '@/lib/apiClient';
import { USE_MOCK } from './mockFlag';

const STORAGE_KEY = 'makromedia_cost_categories';

const INITIAL_CATEGORIES: CostCategory[] = [
  { id: 'cat-1', name: 'Fee SDM Internal', status: 'ACTIVE', usedCount: 5, createdAt: '2026-01-10' },
  { id: 'cat-2', name: 'Peralatan & Sewa', status: 'ACTIVE', usedCount: 4, createdAt: '2026-01-12' },
  { id: 'cat-3', name: 'Operasional & Konsumsi', status: 'ACTIVE', usedCount: 3, createdAt: '2026-01-15' },
  { id: 'cat-4', name: 'Transportasi & Logistik', status: 'ACTIVE', usedCount: 2, createdAt: '2026-01-18' },
  { id: 'cat-5', name: 'Perizinan & Keamanan', status: 'ACTIVE', usedCount: 1, createdAt: '2026-01-20' },
  { id: 'cat-6', name: 'Dokumentasi & Pascaproduksi', status: 'ACTIVE', usedCount: 2, createdAt: '2026-01-22' },
  { id: 'cat-7', name: 'Biaya Tak Terduga', status: 'INACTIVE', usedCount: 0, createdAt: '2026-01-25' },
];

let memoryCategories: CostCategory[] = [...INITIAL_CATEGORIES];

const loadFromStorage = (): CostCategory[] => {
  if (typeof window === 'undefined') return memoryCategories;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCategories = parsed;
      return parsed;
    }
  } catch {
    // fallback to memory
  }
  return memoryCategories;
};

const saveToStorage = (categories: CostCategory[]) => {
  memoryCategories = categories;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore storage quota error
    }
  }
};

export const costCategoryService = {
  getAll: async (): Promise<CostCategory[]> => {
    if (USE_MOCK) return loadFromStorage();
    try {
      const response = await apiClient.get<CostCategory[]>('/cost-categories');
      if (Array.isArray(response.data)) return response.data;
    } catch {
      // Fallback to local storage if endpoint is not implemented on BE
    }
    return loadFromStorage();
  },

  getActiveNames: async (): Promise<string[]> => {
    if (USE_MOCK) {
      const list = loadFromStorage();
      return list.filter((c) => c.status === 'ACTIVE').map((c) => c.name);
    }
    const all = await costCategoryService.getAll();
    return all.filter((c) => c.status === 'ACTIVE').map((c) => c.name);
  },

  getActiveNamesSync: (): string[] => {
    const list = loadFromStorage();
    return list.filter((c) => c.status === 'ACTIVE').map((c) => c.name);
  },

  create: async (data: CreateCostCategoryDTO): Promise<CostCategory> => {
    const list = loadFromStorage();
    const exists = list.some(
      (c) => c.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (exists) {
      throw new Error(`Kategori "${data.name.trim()}" sudah ada.`);
    }

    const newCategory: CostCategory = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      status: data.status,
      usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newCategory, ...list];
    saveToStorage(updated);
    return newCategory;
  },

  update: async (id: string, data: Partial<CreateCostCategoryDTO>): Promise<CostCategory> => {
    const list = loadFromStorage();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Kategori biaya tidak ditemukan.');
    }

    if (data.name) {
      const duplicate = list.some(
        (c) => c.id !== id && c.name.trim().toLowerCase() === data.name!.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Kategori "${data.name.trim()}" sudah ada.`);
      }
    }

    const updatedItem: CostCategory = {
      ...list[idx],
      ...(data.name && { name: data.name.trim() }),
      ...(data.status && { status: data.status }),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    list[idx] = updatedItem;
    saveToStorage([...list]);
    return updatedItem;
  },

  delete: async (id: string): Promise<void> => {
    const list = loadFromStorage();
    const filtered = list.filter((c) => c.id !== id);
    saveToStorage(filtered);
  },
};
