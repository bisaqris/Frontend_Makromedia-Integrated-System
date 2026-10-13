import { Manpower, Skill, Position } from '@/types/manpower';

export const mockSkills: Skill[] = [
  { id: 'skl-1', name: 'Director of Photography (DoP)', category: 'Camera' },
  { id: 'skl-2', name: 'Camera Operator / Cameraman', category: 'Camera' },
  { id: 'skl-3', name: 'Video Editor (Premiere / DaVinci)', category: 'Post-Production' },
  { id: 'skl-4', name: 'Lighting Technician / Gaffer', category: 'Lighting' },
  { id: 'skl-5', name: 'Audio Recordist / Sound Engineer', category: 'Audio' },
  { id: 'skl-6', name: 'Drone Pilot (Certified)', category: 'Special Equipment' },
];

export const mockPositions: Position[] = [
  { id: 'pos-1', name: 'Director', category: 'Board of Director' },
  { id: 'pos-2', name: 'Finance', category: 'Finance' },
  { id: 'pos-3', name: 'Sales', category: 'Sales' },
  { id: 'pos-4', name: 'Production', category: 'Production' },
]

export const mockManpower: Manpower[] = [
  {
    id: 'mp-1',
    name: 'Rian Hidayat',
    role: 'Senior Cameraman & Drone Pilot',
    email: 'rian@makromedia.co.id',
    phone: '081299887766',
    dailyRate: 1500000,
    status: 'ASSIGNED',
    skills: [mockSkills[1], mockSkills[5]],
    currentProjectId: 'proj-1',
    currentProjectName: 'Peluncuran Produk Innovate Tech 2026',
  },
  {
    id: 'mp-2',
    name: 'Doni Prasetyo',
    role: 'Director of Photography (DoP)',
    email: 'doni@makromedia.co.id',
    phone: '081388776655',
    dailyRate: 3000000,
    status: 'ASSIGNED',
    skills: [mockSkills[0]],
    currentProjectId: 'proj-2',
    currentProjectName: 'Company Profile & Video Direksi',
  },
  {
    id: 'mp-3',
    name: 'Eko Kurniawan',
    role: 'Sound Engineer & Recordist',
    email: 'eko@makromedia.co.id',
    phone: '081477665544',
    dailyRate: 1200000,
    status: 'AVAILABLE',
    skills: [mockSkills[4]],
  },
];
