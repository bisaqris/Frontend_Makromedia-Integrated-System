import { apiClient } from '@/lib/apiClient';
import { CreateManpowerDTO, ManpowerRecord, UpdateManpowerDTO } from '@/types/manpower';
import { mockManpowerRecords } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: ManpowerRecord[] | null = null;
const getMockStore = (): ManpowerRecord[] => (mockStore ??= cloneMock(mockManpowerRecords));

interface BackendManpower {
  id: string;
  name: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  skill?: string | null;
  employmentStatus?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  createdAt?: string;
  skills?: Array<{ skill: { name: string } }>;
}

interface BackendPaginatedManpower {
  data: BackendManpower[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const employmentStatusFromApi = (value?: string | null): ManpowerRecord['employmentStatus'] => {
  switch (value?.toUpperCase()) {
    case 'PART_TIME':
    case 'PARTTIME':
      return 'Parttime';
    case 'INTERNSHIP':
      return 'Internship';
    case 'FREELANCE':
      return 'Freelance';
    default:
      return 'Fulltime';
  }
};

const mapManpower = (record: BackendManpower): ManpowerRecord => ({
  id: record.id,
  fullName: record.name,
  phoneNumber: record.phone ?? '',
  email: record.email ?? undefined,
  position: record.position ?? '',
  employmentStatus: employmentStatusFromApi(record.employmentStatus),
  skills:
    record.skills?.map(({ skill }) => skill.name) ??
    (record.skill ? record.skill.split(',').map((name) => name.trim()).filter(Boolean) : []),
  province: '',
  city: '',
  subdistrict: '',
  village: '',
  detailAddress: '',
  bankName: record.bankName ?? '',
  accountNumber: record.bankAccountNo ?? '',
  accountHolder: '',
  joinDate: record.createdAt?.slice(0, 10) ?? '',
});

const manpowerToApi = (record: Partial<CreateManpowerDTO>) => ({
  ...(record.fullName !== undefined && { name: record.fullName }),
  ...(record.position !== undefined && { position: record.position }),
  ...(record.email !== undefined && { email: record.email || undefined }),
  ...(record.phoneNumber !== undefined && { phone: record.phoneNumber }),
  ...(record.employmentStatus !== undefined && { employmentStatus: record.employmentStatus }),
  ...(record.bankName !== undefined && { bankName: record.bankName }),
  ...(record.accountNumber !== undefined && { bankAccountNo: record.accountNumber }),
  ...(record.skills !== undefined && { skill: record.skills.join(', ') }),
});

export const manpowerService = {
  getAll: async (): Promise<ManpowerRecord[]> => {
    if (USE_MOCK) return cloneMock(getMockStore());
    const response = await apiClient.get<BackendPaginatedManpower>('/manpower', {
      params: { page: 1, limit: 100 },
    });
    return response.data.data.map(mapManpower);
  },

  getById: async (id: string): Promise<ManpowerRecord | null> => {
    if (USE_MOCK) {
      return cloneMock(getMockStore().find((m) => m.id === id) ?? null);
    }
    const response = await apiClient.get<BackendManpower>(`/manpower/${id}`);
    return mapManpower(response.data);
  },

  create: async (data: CreateManpowerDTO): Promise<ManpowerRecord> => {
    if (USE_MOCK) {
      const newRecord: ManpowerRecord = {
        ...data,
        id: `mp-${crypto.randomUUID()}`,
        joinDate: data.joinDate ?? new Date().toISOString().slice(0, 10),
      };
      getMockStore().unshift(newRecord);
      return cloneMock(newRecord);
    }
    const response = await apiClient.post<BackendManpower>('/manpower', manpowerToApi(data));
    return mapManpower(response.data);
  },

  update: async (id: string, data: UpdateManpowerDTO): Promise<ManpowerRecord> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((m) => m.id === id);
      if (index === -1) throw new Error(`Manpower dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }
    const response = await apiClient.patch<BackendManpower>(
      `/manpower/${id}`,
      manpowerToApi(data)
    );
    return mapManpower(response.data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((m) => m.id !== id);
      return;
    }
    await apiClient.delete(`/manpower/${id}`);
  },
};
