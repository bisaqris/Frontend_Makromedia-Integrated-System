import { ProjectCategory } from './project';

export interface FinancialDashboardSummary {
  totalContractValue: number;
  totalPaid: number;
  restOfBill: number;
  totalProjectCost: number;
}

export type ProjectCategoryCounts = Record<ProjectCategory, number>;
