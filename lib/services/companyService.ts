import { CompanyProfile } from '@/types/application-cost';
import { mockCompanyProfile } from '@/lib/mock/company.mock';
import { cloneMock, USE_MOCK } from './mockFlag';

// Company profile persistence has not been implemented in the backend yet.
export const companyService = {
  getProfile: async (): Promise<CompanyProfile | null> => {
    if (!USE_MOCK) return null;
    return cloneMock(mockCompanyProfile);
  },
};
