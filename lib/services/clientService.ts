import { apiClient } from '@/lib/apiClient';
import {
  ClientCompany,
  ClientPIC,
  CreateClientCompanyDTO,
  CreateClientPICDTO,
} from '@/types/client';
import { mockClientCompanies, mockClientPICs } from '@/lib/mock/clients.mock';
import { USE_MOCK, cloneMock } from './mockFlag';

// Store in-memory untuk mode mock (direset saat halaman di-reload).
let companyStore: ClientCompany[] | null = null;
let picStore: ClientPIC[] | null = null;
const getCompanies = (): ClientCompany[] =>
  (companyStore ??= cloneMock(mockClientCompanies));
const getPICs = (): ClientPIC[] => (picStore ??= cloneMock(mockClientPICs));

export const clientService = {
  getCompanies: async (): Promise<ClientCompany[]> => {
    if (USE_MOCK) return cloneMock(getCompanies());
    const response = await apiClient.get<ClientCompany[]>('/clients/companies');
    return response.data;
  },

  createCompany: async (data: CreateClientCompanyDTO): Promise<ClientCompany> => {
    if (USE_MOCK) {
      const companies = getCompanies();
      const newCompany: ClientCompany = {
        ...data,
        id: `cli-${crypto.randomUUID()}`,
        code: `CLI-${String(companies.length + 1).padStart(3, '0')}`,
      };
      companies.unshift(newCompany);
      return cloneMock(newCompany);
    }
    const response = await apiClient.post<ClientCompany>('/clients/companies', data);
    return response.data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      companyStore = getCompanies().filter((c) => c.id !== id);
      picStore = getPICs().filter((p) => p.clientId !== id);
      return;
    }
    await apiClient.delete(`/clients/companies/${id}`);
  },

  getPICs: async (): Promise<ClientPIC[]> => {
    if (USE_MOCK) return cloneMock(getPICs());
    const response = await apiClient.get<ClientPIC[]>('/clients/pics');
    return response.data;
  },

  createPIC: async (data: CreateClientPICDTO): Promise<ClientPIC> => {
    if (USE_MOCK) {
      const clientId =
        data.clientId ?? getCompanies().find((c) => c.name === data.company)?.id ?? '';
      const newPic: ClientPIC = { ...data, id: `pic-${crypto.randomUUID()}`, clientId };
      getPICs().unshift(newPic);
      return cloneMock(newPic);
    }
    const response = await apiClient.post<ClientPIC>('/clients/pics', data);
    return response.data;
  },

  deletePIC: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      picStore = getPICs().filter((p) => p.id !== id);
      return;
    }
    await apiClient.delete(`/clients/pics/${id}`);
  },
};
