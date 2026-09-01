import { ClientCompany, ClientPIC } from '@/types/client';

export interface PicClientRecord {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  companyAddress?: string;
  country?: string;
  province?: string;
  city?: string;
  subdistrict?: string;
  village?: string;
  postalCode?: string;
}

export const initialPicClientRecords: PicClientRecord[] = [
  { id: '1', name: 'Agus T.', company: 'Director', phone: '0821 5410 7123', email: 'agus@makromedia.id', companyAddress: 'Jl. Simpang Sulfat No 12', country: 'Indonesia', province: 'East Java', city: 'Malang', subdistrict: 'Blimbing', village: 'Purwantoro', postalCode: '65126' },
  { id: '2', name: 'Angga D.', company: 'Marketing', phone: '0823 5410 8129', email: 'angga@makromedia.id', companyAddress: 'Jl. Simpang Sulfat No 12', country: 'Indonesia', province: 'East Java', city: 'Malang', subdistrict: 'Blimbing', village: 'Purwantoro', postalCode: '65126' },
  { id: '3', name: 'Fatur Rahman F.', company: 'Marketing', phone: '0822 9910 0987', email: 'fatur@makromedia.id', companyAddress: 'Jl. Raya Darmo No 45', country: 'Indonesia', province: 'East Java', city: 'Surabaya', subdistrict: 'Wonokromo', village: 'Darmo', postalCode: '60241' },
  { id: '4', name: 'Sefin Meidi B. V.', company: 'Editor', phone: '0858 9081 7226', email: 'sefin@makromedia.id', companyAddress: 'Jl. Raya Darmo No 45', country: 'Indonesia', province: 'East Java', city: 'Surabaya', subdistrict: 'Wonokromo', village: 'Darmo', postalCode: '60241' },
  { id: '5', name: 'Andi K.', company: 'Editor', phone: '0888 5422 6129', email: 'andi@gmail.com', companyAddress: 'Jl. Jendral Sudirman No. 45', country: 'Indonesia', province: 'DKI Jakarta', city: 'Jakarta Selatan', subdistrict: 'Kebayoran Baru', village: 'Senayan', postalCode: '12190' },
  { id: '6', name: 'Nur Khoiru R.', company: 'Editor', phone: '0821 5422 7123', email: 'khoiru@gmail.com', companyAddress: 'Jl. Jendral Sudirman No. 45', country: 'Indonesia', province: 'DKI Jakarta', city: 'Jakarta Selatan', subdistrict: 'Kebayoran Baru', village: 'Senayan', postalCode: '12190' },
  { id: '7', name: 'Fania Eka H. W.', company: 'Motion Graphic', phone: '0898 9611 7120', email: 'fania@gmail.com', companyAddress: 'Gedung Nusantara Lt 12', country: 'Indonesia', province: 'DKI Jakarta', city: 'Jakarta Pusat', subdistrict: 'Gambir', village: 'Petojo', postalCode: '10130' },
  { id: '8', name: 'Dona K.', company: 'Motion Graphic', phone: '0858 1111 7121', email: 'dona@gmail.com', companyAddress: 'Gedung Nusantara Lt 12', country: 'Indonesia', province: 'DKI Jakarta', city: 'Jakarta Pusat', subdistrict: 'Gambir', village: 'Petojo', postalCode: '10130' },
  { id: '9', name: 'Budi S.', company: 'Project Manager', phone: '0821 1902 7181', email: 'budi@gmail.com', companyAddress: 'Jl. Sulfat No 10', country: 'Indonesia', province: 'East Java', city: 'Malang', subdistrict: 'Blimbing', village: 'Purwantoro', postalCode: '65126' },
  { id: '10', name: 'Febrian S.', company: 'Project Manager', phone: '0823 8011 3298', email: 'febrian@gmail.com', companyAddress: 'Jl. Sulfat No 10', country: 'Indonesia', province: 'East Java', city: 'Malang', subdistrict: 'Blimbing', village: 'Purwantoro', postalCode: '65126' },
];

export let picClientStore: PicClientRecord[] = [...initialPicClientRecords];

export const getPicClients = () => picClientStore;

export const addPicClient = (newRecord: Omit<PicClientRecord, 'id'>) => {
  const newPic: PicClientRecord = {
    id: `pic-${Date.now()}`,
    ...newRecord,
  };
  picClientStore = [newPic, ...picClientStore];
  return newPic;
};

export const deletePicClient = (id: string) => {
  picClientStore = picClientStore.filter((item) => item.id !== id);
};

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
    npwp: '03.456.789.0-034.000',
    pics: [mockClientPICs[2]],
  },
];
