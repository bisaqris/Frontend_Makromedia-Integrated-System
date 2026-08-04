import { ProjectCategory } from '@/types/project';

export interface FinancialDashboardSummary {
  totalContractValue: number;
  totalPaid: number;
  restOfBill: number;
  totalProjectCost: number;
}

export const mockDashboardFinance: FinancialDashboardSummary = {
  totalContractValue: 1200000000,
  totalPaid: 750000000,
  restOfBill: 450000000,
  totalProjectCost: 620000000,
};

export const mockDashboardCategories: Record<ProjectCategory, number> = {
  Event: 10,
  'Corporate Video': 4,
  'Film Production': 2,
  'Content Video/Marketing': 6,
  Wedding: 3,
};
