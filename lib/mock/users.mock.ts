import { User, UserProfile, Role } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'usr-direktur',
    name: 'Pak Pakuwon (Direktur)',
    email: 'direktur@makromedia.id',
    role: 'DIREKTUR',
    department: 'CV. Makromedia Visual',
    phone: '081234567890',
  },
  {
    id: 'usr-finance',
    name: 'Ibu Ratna (Finance)',
    email: 'finance@makromedia.id',
    role: 'FINANCE',
    department: 'CV. Makromedia Visual',
    phone: '081234567891',
  },
  {
    id: 'usr-sales',
    name: 'Budi Sales (Sales)',
    email: 'sales@makromedia.id',
    role: 'SALES',
    department: 'CV. Makromedia Visual',
    phone: '081234567892',
  },
  {
    id: 'usr-project_manager',
    name: 'Andi PM (Project Manager)',
    email: 'pm@makromedia.id',
    role: 'PROJECT_MANAGER',
    department: 'CV. Makromedia Visual',
    phone: '081234567893',
  },
  {
    id: 'usr-produksi',
    name: 'Tim Lapangan (Produksi)',
    email: 'produksi@makromedia.id',
    role: 'PRODUKSI',
    department: 'CV. Makromedia Visual',
    phone: '081234567894',
  },
];

export const mockUserByRole: Record<Role, User> = {
  DIREKTUR: mockUsers[0],
  FINANCE: mockUsers[1],
  SALES: mockUsers[2],
  PROJECT_MANAGER: mockUsers[3],
  PRODUKSI: mockUsers[4],
};

/** Profil user yang sedang login (halaman Profile). */
export const mockUserProfile: UserProfile = {
  id: 'usr-admin',
  name: 'John Doe',
  dateOfBirth: '10 January 2000',
  phone: '081234567890',
  email: 'direktur@makromedia.id',
  position: 'Lead Videographer',
  skills: ['Adobe Premiere', 'After Effects', 'Color Grading', 'Sound Design'],
  province: 'Jawa Timur',
  city: 'Kota Malang',
  subdistrict: 'Klojen',
  village: 'Kauman',
  detailAddress: 'Jl. Merdeka Barat No. 12',
  bankName: 'BCA',
  accountNumber: '89102384910',
};
