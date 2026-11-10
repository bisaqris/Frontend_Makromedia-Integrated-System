import { CompanyProfile } from '@/types/application-cost';
import { mockCompanyProfile } from '@/lib/mock/company.mock';
import { cloneMock } from './mockFlag';

// Identitas vendor penerbit dokumen (kop surat & rekening).
// Menggunakan profil Makromedia Visual hingga endpoint setting company di BE tersedia di DB.
export const companyService = {
  getProfile: async (): Promise<CompanyProfile | null> => {
    return cloneMock(mockCompanyProfile);
  },
};
