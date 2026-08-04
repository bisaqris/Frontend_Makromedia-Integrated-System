import { User, Role } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'usr-direktur',
    name: 'Pak Pakuwon (Direktur)',
    email: 'direktur@makromedia.co.id',
    role: 'DIREKTUR',
    department: 'CV. Makromedia Visual',
    phone: '081234567890',
  },
  {
    id: 'usr-finance',
    name: 'Ibu Ratna (Finance)',
    email: 'finance@makromedia.co.id',
    role: 'FINANCE',
    department: 'CV. Makromedia Visual',
    phone: '081234567891',
  },
  {
    id: 'usr-sales',
    name: 'Budi Sales (Sales)',
    email: 'sales@makromedia.co.id',
    role: 'SALES',
    department: 'CV. Makromedia Visual',
    phone: '081234567892',
  },
  {
    id: 'usr-project_manager',
    name: 'Andi PM (Project Manager)',
    email: 'pm@makromedia.co.id',
    role: 'PROJECT_MANAGER',
    department: 'CV. Makromedia Visual',
    phone: '081234567893',
  },
  {
    id: 'usr-produksi',
    name: 'Tim Lapangan (Produksi)',
    email: 'produksi@makromedia.co.id',
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
