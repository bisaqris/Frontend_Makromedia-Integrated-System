export type CostCategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CostCategory {
  id: string;
  name: string;
  status: CostCategoryStatus;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCostCategoryDTO {
  name: string;
  status: CostCategoryStatus;
}
