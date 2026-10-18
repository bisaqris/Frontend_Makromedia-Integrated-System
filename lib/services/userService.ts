import { apiClient } from '@/lib/apiClient';
import { UpdateUserProfileDTO, User, UserProfile } from '@/types/user';
import { mockUsers, mockUserProfile } from '@/lib/mock/users.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let profileStore: UserProfile | null = null;
const getProfileStore = (): UserProfile => (profileStore ??= cloneMock(mockUserProfile));

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) return cloneMock(getProfileStore());
    const response = await apiClient.get<UserProfile>('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateUserProfileDTO): Promise<UserProfile> => {
    if (USE_MOCK) {
      profileStore = { ...getProfileStore(), ...data };
      return cloneMock(profileStore);
    }
    const response = await apiClient.patch<UserProfile>('/profile', data);
    return response.data;
  },

  /** User dengan role PROJECT_MANAGER, untuk dropdown filter & form project. */
  getProjectManagers: async (): Promise<User[]> => {
    if (USE_MOCK) return cloneMock(mockUsers.filter((u) => u.role === 'PROJECT_MANAGER'));
    const response = await apiClient.get<User[]>('/users', {
      params: { role: 'PROJECT_MANAGER' },
    });
    return response.data;
  },
};
