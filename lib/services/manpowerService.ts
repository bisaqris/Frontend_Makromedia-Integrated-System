import { apiClient } from '@/lib/apiClient';
import { CreateManpowerDTO, ManpowerRecord, UpdateManpowerDTO } from '@/types/manpower';
import { mockManpowerRecords } from '@/lib/mock/manpower.mock';
import { USE_MOCK, cloneMock } from './mockFlag';
import { skillService } from './skillService';
import { positionService } from './positionService';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let mockStore: ManpowerRecord[] | null = null;
export const getMockManpowerStore = (): ManpowerRecord[] => (mockStore ??= cloneMock(mockManpowerRecords));
const getMockStore = (): ManpowerRecord[] => getMockManpowerStore();

const sanitizeManpower = (
  record: ManpowerRecord,
  activeSkills?: Set<string>,
  activePositions?: Set<string>
): ManpowerRecord => ({
  ...record,
  position:
    activePositions && record.position && !activePositions.has(record.position.trim())
      ? ''
      : record.position,
  skills:
    activeSkills && Array.isArray(record.skills)
      ? record.skills.filter((sk) => activeSkills.has(sk.trim()))
      : record.skills,
});

interface BackendManpower {
  id: string;
  name: string;
  position?: string | null;
  positionRef?: { id: string; name: string; isActive?: boolean } | null;
  email?: string | null;
  phone?: string | null;
  skill?: string | null;
  employmentStatus?: string | null;
  gender?: 'MALE' | 'FEMALE' | string | null;
  dateOfBirth?: string | null;
  province?: string | null;
  city?: string | null;
  subdistrict?: string | null;
  village?: string | null;
  detailAddress?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  accountHolder?: string | null;
  createdAt?: string;
  skills?: Array<{ skill: { name: string; isActive?: boolean } }>;
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
  gender: record.gender === 'FEMALE' ? 'Female' : record.gender === 'MALE' ? 'Male' : undefined,
  dateOfBirth: record.dateOfBirth ? record.dateOfBirth.slice(0, 10) : '',
  position: (record.positionRef && record.positionRef.isActive === false) ? '' : (record.position ?? ''),
  employmentStatus: employmentStatusFromApi(record.employmentStatus),
  skills:
    record.skills
      ?.filter(({ skill }) => skill.isActive !== false)
      .map(({ skill }) => skill.name) ??
    (record.skill ? record.skill.split(',').map((name) => name.trim()).filter(Boolean) : []),
  province: record.province ?? '',
  city: record.city ?? '',
  subdistrict: record.subdistrict ?? '',
  village: record.village ?? '',
  detailAddress: record.detailAddress ?? '',
  bankName: record.bankName ?? '',
  accountNumber: record.bankAccountNo ?? '',
  accountHolder: record.accountHolder ?? '',
  joinDate: record.createdAt?.slice(0, 10) ?? '',
});

const manpowerToApi = (record: Partial<CreateManpowerDTO> & { positionId?: string }) => ({
  ...(record.fullName !== undefined && { name: record.fullName }),
  ...(record.position !== undefined && { position: record.position }),
  ...(record.positionId !== undefined && { positionId: record.positionId }),
  ...(record.email !== undefined && { email: record.email || undefined }),
  ...(record.phoneNumber !== undefined && { phone: record.phoneNumber }),
  ...(record.employmentStatus !== undefined && { employmentStatus: record.employmentStatus }),
  ...(record.gender !== undefined && {
    gender: record.gender ? (record.gender.toUpperCase() as 'MALE' | 'FEMALE') : undefined,
  }),
  ...(record.dateOfBirth !== undefined && {
    dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth).toISOString() : undefined,
  }),
  ...(record.province !== undefined && { province: record.province }),
  ...(record.city !== undefined && { city: record.city }),
  ...(record.subdistrict !== undefined && { subdistrict: record.subdistrict }),
  ...(record.village !== undefined && { village: record.village }),
  ...(record.detailAddress !== undefined && { detailAddress: record.detailAddress }),
  ...(record.bankName !== undefined && { bankName: record.bankName }),
  ...(record.accountNumber !== undefined && { bankAccountNo: record.accountNumber }),
  ...(record.accountHolder !== undefined && { accountHolder: record.accountHolder }),
  ...(record.skills !== undefined && { skill: record.skills.join(', ') }),
});

export const manpowerService = {
  getAll: async (): Promise<ManpowerRecord[]> => {
    let records: ManpowerRecord[];
    if (USE_MOCK) {
      records = cloneMock(getMockStore());
    } else {
      const response = await apiClient.get<BackendPaginatedManpower>('/manpower', {
        params: { page: 1, limit: 100 },
      });
      records = response.data.data.map(mapManpower);
    }
    try {
      const [actSkills, actPositions] = await Promise.all([
        skillService.getActiveNames(),
        positionService.getActiveNames(),
      ]);
      const skillSet = new Set(actSkills.map((s) => s.trim()));
      const posSet = new Set(actPositions.map((p) => p.trim()));
      return records.map((r) => sanitizeManpower(r, skillSet, posSet));
    } catch {
      return records;
    }
  },

  getById: async (id: string): Promise<ManpowerRecord | null> => {
    let record: ManpowerRecord | null = null;
    if (USE_MOCK) {
      record = cloneMock(getMockStore().find((m) => m.id === id) ?? null);
    } else {
      const response = await apiClient.get<BackendManpower>(`/manpower/${id}`);
      record = mapManpower(response.data);
    }
    if (!record) return null;
    try {
      const [actSkills, actPositions] = await Promise.all([
        skillService.getActiveNames(),
        positionService.getActiveNames(),
      ]);
      const skillSet = new Set(actSkills.map((s) => s.trim()));
      const posSet = new Set(actPositions.map((p) => p.trim()));
      return sanitizeManpower(record, skillSet, posSet);
    } catch {
      return record;
    }
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

    const payload: ReturnType<typeof manpowerToApi> = manpowerToApi(data);
    if (!payload.positionId && data.position) {
      try {
        const positions = await positionService.getAll();
        const matched = positions.find(
          (p) => p.name.trim().toLowerCase() === data.position?.trim().toLowerCase()
        );
        if (matched) {
          payload.positionId = matched.id;
        }
      } catch {
        // ignore
      }
    }

    const response = await apiClient.post<BackendManpower>('/manpower', payload);
    const created = mapManpower(response.data);

    if (Array.isArray(data.skills) && data.skills.length > 0) {
      try {
        const allSkills = await skillService.getAll();
        const skillIds = data.skills
          .map((skName) => allSkills.find((s) => s.name.trim().toLowerCase() === skName.trim().toLowerCase())?.id)
          .filter(Boolean) as string[];
        if (skillIds.length > 0) {
          await apiClient.put(`/manpower/${created.id}/skills`, { skillIds });
        }
      } catch {
        // ignore
      }
    }

    return created;
  },

  update: async (id: string, data: UpdateManpowerDTO): Promise<ManpowerRecord> => {
    if (USE_MOCK) {
      const store = getMockStore();
      const index = store.findIndex((m) => m.id === id);
      if (index === -1) throw new Error(`Manpower dengan id "${id}" tidak ditemukan.`);
      store[index] = { ...store[index], ...data };
      return cloneMock(store[index]);
    }

    const payload: ReturnType<typeof manpowerToApi> = manpowerToApi(data);
    if (!payload.positionId && data.position) {
      try {
        const positions = await positionService.getAll();
        const matched = positions.find(
          (p) => p.name.trim().toLowerCase() === data.position?.trim().toLowerCase()
        );
        if (matched) {
          payload.positionId = matched.id;
        }
      } catch {
        // ignore
      }
    }

    const response = await apiClient.patch<BackendManpower>(
      `/manpower/${id}`,
      payload
    );
    const updated = mapManpower(response.data);

    if (Array.isArray(data.skills)) {
      try {
        const allSkills = await skillService.getAll();
        const skillIds = data.skills
          .map((skName) => allSkills.find((s) => s.name.trim().toLowerCase() === skName.trim().toLowerCase())?.id)
          .filter(Boolean) as string[];
        await apiClient.put(`/manpower/${id}/skills`, { skillIds });
      } catch {
        // ignore
      }
    }

    return updated;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      mockStore = getMockStore().filter((m) => m.id !== id);
      return;
    }
    await apiClient.delete(`/manpower/${id}`);
  },
};
