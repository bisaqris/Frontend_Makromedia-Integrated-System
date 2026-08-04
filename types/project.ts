export type ProjectStatus =
  | 'DRAFT'
  | 'QUOTATION_PENDING'
  | 'QUOTATION_APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProjectCategory =
  | 'Event'
  | 'Corporate Video'
  | 'Film Production'
  | 'Content Video/Marketing'
  | 'Wedding';

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
  category?: ProjectCategory;
  clientId: string;
  clientName?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  totalPaid?: number;
  restOfBill?: number;
  totalCost?: number;
  color?: string;
  costItems?: ProjectCostItem[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
