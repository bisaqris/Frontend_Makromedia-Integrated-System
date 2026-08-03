export type ProjectStatus =
  | 'DRAFT'
  | 'QUOTATION_PENDING'
  | 'QUOTATION_APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProjectCostItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  costItems?: ProjectCostItem[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
