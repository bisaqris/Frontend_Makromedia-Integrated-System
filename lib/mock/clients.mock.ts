import { ClientCompany, ClientPIC } from '@/types/client';

export const mockClientPICs: ClientPIC[] = [
  {
    id: 'pic-1',
    clientId: 'cli-1',
    name: 'Budi Santoso',
    email: 'budi@innovate.co.id',
    phone: '08111222333',
    position: 'Marketing Manager',
  },
  {
    id: 'pic-2',
    clientId: 'cli-2',
    name: 'Siti Rahma',
    email: 'siti@banknusantara.co.id',
    phone: '08122333444',
    position: 'Head of Corporate Communications',
  },
  {
    id: 'pic-3',
    clientId: 'cli-3',
    name: 'Ahmad Fauzi',
    email: 'ahmad@senivisual.org',
    phone: '08133444555',
    position: 'Program Director',
  },
];

export const mockClientCompanies: ClientCompany[] = [
  {
    id: 'cli-1',
    name: 'PT Innovate Indonesia',
    code: 'CLI-001',
    email: 'info@innovate.co.id',
    phone: '021-5550100',
    address: 'Jl. Jendral Sudirman No. 45',
    city: 'Jakarta Selatan',
    npwp: '01.234.567.8-012.000',
    pics: [mockClientPICs[0]],
  },
  {
    id: 'cli-2',
    name: 'Bank Nusantara',
    code: 'CLI-002',
    email: 'contact@banknusantara.co.id',
    phone: '021-5550200',
    address: 'Gedung Nusantara Tower Lt. 12',
    city: 'Jakarta Pusat',
    npwp: '02.345.678.9-023.000',
    pics: [mockClientPICs[1]],
  },
  {
    id: 'cli-3',
    name: 'Yayasan Seni Visual',
    code: 'CLI-003',
    email: 'secretariat@senivisual.org',
    phone: '022-4200300',
    address: 'Jl. Dago No. 102',
    city: 'Bandung',
    pics: [mockClientPICs[2]],
  },
];
