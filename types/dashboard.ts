import { ProjectCategory } from './project';

export interface FinancialDashboardSummary {
  totalContractValue: number;
  totalPaid: number;
  restOfBill: number;
  totalProjectCost: number;
}

export type ProjectCategoryCounts = Record<ProjectCategory, number>;

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'EVENT' | 'TASK' | 'INVOICE_DUE';
  projectId: string;
  category?: ProjectCategory;
}
