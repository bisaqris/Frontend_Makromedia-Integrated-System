export interface AddressFields {
  country?: string;
  province?: string;
  city?: string;
  subdistrict?: string;
  village?: string;
  postalCode?: string;
}

export interface ClientPIC extends AddressFields {
  id: string;
  clientId: string;
  name: string;
  /** Nama perusahaan (denormalisasi untuk tampilan cepat). */
  company?: string;
  email: string;
  phone: string;
  position?: string;
  companyAddress?: string;
}

export interface ClientCompany extends AddressFields {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  npwp?: string;
  pics?: ClientPIC[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateClientCompanyDTO = Omit<ClientCompany, 'id' | 'code' | 'pics'>;

export type CreateClientPICDTO = Omit<ClientPIC, 'id' | 'clientId'> & {
  clientId?: string;
};
