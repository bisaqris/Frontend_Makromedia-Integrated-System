import { apiClient } from '@/lib/apiClient';
import { CompanyProfile } from '@/types/application-cost';
import { mockCompanyProfile } from '@/lib/mock/company.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

export const companyService = {
  getProfile: async (): Promise<CompanyProfile> => {
    if (USE_MOCK) return cloneMock(mockCompanyProfile);
    const response = await apiClient.get<CompanyProfile>('/company-profile');
    return response.data;
  },
};
