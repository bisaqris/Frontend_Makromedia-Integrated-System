import { apiClient } from '@/lib/apiClient';
import { UpdateUserProfileDTO, User, UserProfile } from '@/types/user';
import { mockUsers, mockUserProfile } from '@/lib/mock/users.mock';
import { cloneMock, USE_MOCK } from './mockFlag';

const getStoredAvatar = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('makromedia_user_avatar') || undefined;
};

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let profileStore: UserProfile | null = null;
const getProfileStore = (): UserProfile => {
  const store = (profileStore ??= cloneMock(mockUserProfile));
  const storedAvatar = getStoredAvatar();
  if (storedAvatar) store.photoUrl = storedAvatar;
  return store;
};

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
  phone: api.phone ?? '',
  dateOfBirth: api.dateOfBirth ? api.dateOfBirth.slice(0, 10) : '',
  country: api.country ?? '',
  province: api.province ?? '',
  city: api.city ?? '',
  subdistrict: api.subdistrict ?? '',
  village: api.village ?? '',
  postalCode: api.postalCode ?? '',
  detailAddress: api.detailAddress ?? '',
  bankName: api.bankName ?? '',
  accountNumber: api.bankAccountNo ?? '',
  accountHolder: api.accountHolder ?? '',
  position: api.position?.name ?? '',
  skills: Array.isArray(api.skills) ? api.skills.map((s) => s.skill.name) : [],
  photoUrl: getStoredAvatar() ?? base.photoUrl,
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
    if (data.photoUrl !== undefined && typeof window !== 'undefined') {
      if (data.photoUrl) {
        localStorage.setItem('makromedia_user_avatar', data.photoUrl);
      } else {
        localStorage.removeItem('makromedia_user_avatar');
      }
    }

    if (USE_MOCK) {
      profileStore = mergeProfile(getProfileStore(), data);
      return cloneMock(profileStore);
    }

    try {
      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.dateOfBirth !== undefined) {
        if (!data.dateOfBirth) {
          payload.dateOfBirth = null;
        } else {
          const d = new Date(data.dateOfBirth);
          payload.dateOfBirth = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
        }
      }
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
      if (data.positionId !== undefined) payload.positionId = data.positionId;
      if (data.skillIds !== undefined) payload.skillIds = data.skillIds;

      const response = await apiClient.patch<BackendUserProfile>('/auth/me', payload);
      const base = getProfileStore();
      profileStore = mapBackendProfile(response.data, base);
      return cloneMock(profileStore);
    } catch (err) {
      throw err;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    if (USE_MOCK) return;
    await apiClient.patch('/auth/me/password', { oldPassword, newPassword });
  },

  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK) return cloneMock(mockUsers);

    try {
      const response = await apiClient.get<User[]>('/users');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return cloneMock(mockUsers);
    }
  },

  /** User dengan role PROJECT_MANAGER, untuk dropdown filter & form project. */
  getProjectManagers: async (): Promise<User[]> => {
    if (USE_MOCK) return cloneMock(mockUsers.filter((u) => u.role === 'PROJECT_MANAGER'));

    try {
      const response = await apiClient.get<User[]>('/users/project-managers');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      // Fallback jika endpoint tidak tersedia
      try {
        const response = await apiClient.get<User[]>('/users');
        const list = Array.isArray(response.data) ? response.data : [];
        return list.filter((u) => u.role === 'PROJECT_MANAGER');
      } catch {
        return [];
      }
    }
  },

  /** User dengan role PRODUKSI aktif, untuk assign task produksi. */
  getProductionTeam: async (): Promise<User[]> => {
    if (USE_MOCK) return cloneMock(mockUsers.filter((u) => u.role === 'PRODUKSI'));

    try {
      const response = await apiClient.get<User[]>('/users/production-team');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      try {
        const response = await apiClient.get<User[]>('/users');
        const list = Array.isArray(response.data) ? response.data : [];
        return list.filter((u) => u.role === 'PRODUKSI');
      } catch {
        return cloneMock(mockUsers.filter((u) => u.role === 'PRODUKSI'));
      }
    }
  },
};
