import { AddressFields } from './client';

export type Role = 'SALES' | 'FINANCE' | 'PROJECT_MANAGER' | 'PRODUKSI' | 'DIREKTUR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  createdAt?: string;
}

/** Profil pengguna yang sedang login (halaman Profile). */
export interface UserProfile extends AddressFields {
  id: string;
  name: string;
  dateOfBirth?: string;
  phone: string;
  email: string;
  detailAddress?: string;
  position?: string;
  skills: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  photoUrl?: string;
}

export type UpdateUserProfileDTO = Partial<Omit<UserProfile, 'id'>>;

export interface AuthResponse {
  token: string;
  user: User;
}
