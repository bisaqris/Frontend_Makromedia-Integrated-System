export interface ClientPIC {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  npwp?: string;
  pics?: ClientPIC[];
  createdAt?: string;
  updatedAt?: string;
}
