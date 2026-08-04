import { ProjectCostItem } from '@/types/project';

export const mockProductionCosts: ProjectCostItem[] = [
  {
    id: 'cost-1',
    projectId: 'proj-1',
    category: 'Equipment Rental',
    description: 'Sewa Kamera Sony FX6 & Lensa Cine Set (4 Hari)',
    quantity: 3,
    unit: 'Unit',
    unitCost: 2500000,
    totalCost: 30000000,
  },
  {
    id: 'cost-2',
    projectId: 'proj-1',
    category: 'Manpower / Crew',
    description: 'Honor Director of Photography & Cameraman (5 Hari)',
    quantity: 4,
    unit: 'Person',
    unitCost: 15000000,
    totalCost: 60000000,
  },
  {
    id: 'cost-3',
    projectId: 'proj-1',
    category: 'Catering & Akomodasi',
    description: 'Konsumsi Tim Lapangan & Transportasi Crew',
    quantity: 50,
    unit: 'Pax',
    unitCost: 1800000,
    totalCost: 90000000,
  },
];
