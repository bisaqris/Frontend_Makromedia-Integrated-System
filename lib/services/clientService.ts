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

interface BackendCompanyClient {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  subdistrict?: string | null;
  village?: string | null;
  postalCode?: string | null;
  clients?: BackendClient[];
}

interface BackendClient {
  id: string;
  companyClientId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  subdistrict?: string | null;
  village?: string | null;
  postalCode?: string | null;
  company?: { id: string; name: string };
}

const mapPIC = (pic: BackendClient): ClientPIC => ({
  id: pic.id,
  clientId: pic.companyClientId,
  name: pic.name,
  company: pic.company?.name,
  email: pic.email ?? '',
  phone: pic.phone ?? '',
  companyAddress: pic.address ?? undefined,
  country: pic.country ?? undefined,
  province: pic.province ?? undefined,
  city: pic.city ?? undefined,
  subdistrict: pic.subdistrict ?? undefined,
  village: pic.village ?? undefined,
  postalCode: pic.postalCode ?? undefined,
});

const mapCompany = (company: BackendCompanyClient): ClientCompany => ({
  id: company.id,
  code: company.id,
  name: company.name,
  email: company.email ?? undefined,
  phone: company.phone ?? undefined,
  address: company.address ?? undefined,
  country: company.country ?? undefined,
  province: company.province ?? undefined,
  city: company.city ?? undefined,
  subdistrict: company.subdistrict ?? undefined,
  village: company.village ?? undefined,
  postalCode: company.postalCode ?? undefined,
  pics: company.clients?.map(mapPIC),
});

export const clientService = {
  getCompanies: async (): Promise<ClientCompany[]> => {
    if (USE_MOCK) return cloneMock(getCompanies());
    const response = await apiClient.get<BackendCompanyClient[]>('/company-clients');
    return response.data.map(mapCompany);
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
    const response = await apiClient.post<BackendCompanyClient>('/company-clients', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country,
      province: data.province,
      city: data.city,
      subdistrict: data.subdistrict,
      village: data.village,
      postalCode: data.postalCode,
    });
    return mapCompany(response.data);
  },

  deleteCompany: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      companyStore = getCompanies().filter((c) => c.id !== id);
      picStore = getPICs().filter((p) => p.clientId !== id);
      return;
    }
    await apiClient.delete(`/company-clients/${id}`);
  },

  getPICs: async (): Promise<ClientPIC[]> => {
    if (USE_MOCK) return cloneMock(getPICs());
    const response = await apiClient.get<BackendClient[]>('/clients');
    return response.data.map(mapPIC);
  },

  createPIC: async (data: CreateClientPICDTO): Promise<ClientPIC> => {
    if (USE_MOCK) {
      const company = getCompanies().find(
        (item) => item.id === data.clientId || item.id === data.company || item.name === data.company
      );
      const clientId = data.clientId ?? company?.id ?? '';
      const newPic: ClientPIC = {
        ...data,
        company: company?.name ?? data.company,
        id: `pic-${crypto.randomUUID()}`,
        clientId,
      };
      getPICs().unshift(newPic);
      return cloneMock(newPic);
    }
    const companies = await clientService.getCompanies();
    const company = companies.find(
      (item) => item.id === data.clientId || item.name === data.company
    );
    if (!company) {
      throw new Error(`Perusahaan "${data.company ?? ''}" tidak ditemukan.`);
    }

    const response = await apiClient.post<BackendClient>('/clients', {
      companyClientId: company.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.companyAddress,
      country: data.country,
      province: data.province,
      city: data.city,
      subdistrict: data.subdistrict,
      village: data.village,
      postalCode: data.postalCode,
    });
    return mapPIC(response.data);
  },

  deletePIC: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      picStore = getPICs().filter((p) => p.id !== id);
      return;
    }
    await apiClient.delete(`/clients/${id}`);
  },
};
