import { apiClient } from '@/lib/apiClient';
import { UpdateUserProfileDTO, User, UserProfile } from '@/types/user';
import { mockUsers, mockUserProfile } from '@/lib/mock/users.mock';
import { cloneMock, USE_MOCK } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let profileStore: UserProfile | null = null;
const getProfileStore = (): UserProfile => (profileStore ??= cloneMock(mockUserProfile));

const mergeProfile = (base: UserProfile, data: Partial<UserProfile>): UserProfile => ({
  ...base,
  ...data,
  skills: data.skills ?? base.skills,
});

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      return cloneMock(getProfileStore());
    }

    try {
      const response = await apiClient.get<Partial<UserProfile>>('/auth/me');
      const apiProfile = response.data || {};
      const base = getProfileStore();
      profileStore = mergeProfile(base, {
        id: apiProfile.id ?? base.id,
        name: apiProfile.name ?? base.name,
        email: apiProfile.email ?? base.email,
        phone: apiProfile.phone ?? base.phone,
        position: apiProfile.position ?? base.position,
        skills: apiProfile.skills ?? base.skills,
      });
      return cloneMock(profileStore);
    } catch {
      // Fallback ke store/mock biar UI tetap jalan kalo BE belum siap
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
      if (data.email !== undefined) payload.email = data.email;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.position !== undefined) payload.position = data.position;
      if (data.skills !== undefined) payload.skills = data.skills;

      const response = await apiClient.patch<Partial<UserProfile>>('/auth/me', payload);
      const apiProfile = response.data || {};
      profileStore = mergeProfile(getProfileStore(), {
        ...data,
        ...apiProfile,
      });
      return cloneMock(profileStore);
    } catch {
      // Fallback in-memory kalo BE menolak payload atau endpoint beda
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
