import { apiClient } from '@/lib/apiClient';
import { UpdateUserProfileDTO, User, UserProfile } from '@/types/user';
import { mockUsers, mockUserProfile } from '@/lib/mock/users.mock';
import { cloneMock, USE_MOCK } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let profileStore: UserProfile | null = null;
const getProfileStore = (): UserProfile => (profileStore ??= cloneMock(mockUserProfile));

interface BackendUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  subdistrict?: string | null;
  village?: string | null;
  postalCode?: string | null;
  detailAddress?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  accountHolder?: string | null;
  position?: { id: string; name: string } | null;
  skills?: Array<{ skill: { id: string; name: string } }>;
}

const mergeProfile = (base: UserProfile, data: Partial<UserProfile>): UserProfile => ({
  ...base,
  ...data,
  skills: data.skills ?? base.skills,
});

const mapBackendProfile = (api: BackendUserProfile, base: UserProfile): UserProfile => ({
  ...base,
  id: api.id,
  name: api.name,
  email: api.email,
  phone: api.phone ?? base.phone,
  dateOfBirth: api.dateOfBirth ? api.dateOfBirth.slice(0, 10) : base.dateOfBirth,
  country: api.country ?? base.country,
  province: api.province ?? base.province,
  city: api.city ?? base.city,
  subdistrict: api.subdistrict ?? base.subdistrict,
  village: api.village ?? base.village,
  postalCode: api.postalCode ?? base.postalCode,
  detailAddress: api.detailAddress ?? base.detailAddress,
  bankName: api.bankName ?? base.bankName,
  accountNumber: api.bankAccountNo ?? base.accountNumber,
  accountHolder: api.accountHolder ?? base.accountHolder,
  position: api.position?.name ?? base.position,
  skills: api.skills?.map((s) => s.skill.name) ?? base.skills,
});

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      return cloneMock(getProfileStore());
    }

    try {
      const response = await apiClient.get<BackendUserProfile>('/auth/me');
      const base = getProfileStore();
      profileStore = mapBackendProfile(response.data, base);
      return cloneMock(profileStore);
    } catch {
      return cloneMock(getProfileStore());
    }
  },

  updateProfile: async (data: UpdateUserProfileDTO): Promise<UserProfile> => {
    if (USE_MOCK) {
      profileStore = mergeProfile(getProfileStore(), data);
      return cloneMock(profileStore);
    }

    try {
      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.dateOfBirth !== undefined) payload.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined;
      if (data.country !== undefined) payload.country = data.country;
      if (data.province !== undefined) payload.province = data.province;
      if (data.city !== undefined) payload.city = data.city;
      if (data.subdistrict !== undefined) payload.subdistrict = data.subdistrict;
      if (data.village !== undefined) payload.village = data.village;
      if (data.postalCode !== undefined) payload.postalCode = data.postalCode;
      if (data.detailAddress !== undefined) payload.detailAddress = data.detailAddress;
      if (data.bankName !== undefined) payload.bankName = data.bankName;
      if (data.accountNumber !== undefined) payload.bankAccountNo = data.accountNumber;
      if (data.accountHolder !== undefined) payload.accountHolder = data.accountHolder;

      const response = await apiClient.patch<BackendUserProfile>('/auth/me', payload);
      const base = getProfileStore();
      profileStore = mapBackendProfile(response.data, base);
      return cloneMock(profileStore);
    } catch {
      profileStore = mergeProfile(getProfileStore(), data);
      return cloneMock(profileStore);
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    if (USE_MOCK) return;
    await apiClient.patch('/auth/me/password', { oldPassword, newPassword });
  },

  /** User dengan role PROJECT_MANAGER, untuk dropdown filter & form project. */
  getProjectManagers: async (): Promise<User[]> => {
    if (USE_MOCK) return cloneMock(mockUsers.filter((u) => u.role === 'PROJECT_MANAGER'));

    try {
      const response = await apiClient.get<User[]>('/users/project-managers');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // ignore
    }

    try {
      const response = await apiClient.get<User[]>('/users');
      const list = Array.isArray(response.data) ? response.data : [];
      const pms = list.filter((u) => u.role === 'PROJECT_MANAGER');
      if (pms.length > 0) return pms;
    } catch {
      // ignore
    }

    return [];
  },
};
