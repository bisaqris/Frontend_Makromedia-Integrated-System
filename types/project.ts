export type ProjectStatus =
  | 'DRAFT'
  | 'QUOTATION_PENDING'
  | 'QUOTATION_APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'DONE'
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
  freq?: number;
  period?: string;
  totalCost: number;
  executor?: string;
}

export interface ProjectLink {
  id: string;
  title?: string;
  url: string;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  toAccount: string;
  fromAccount: string;
  notes: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  picName: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface Project {
  id: string;
  code: string;
  name: string;
  category?: ProjectCategory;
  clientId: string;
  clientName?: string;
  clientType?: string;
  partnershipModel?: string;
  picClientId?: string;
  picClientName?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  projectStarts?: string;
  deadline?: string;
  venue?: string;
  budget?: number;
  totalPaid?: number;
  restOfBill?: number;
  totalCost?: number;
  deliverablesLink?: string;
  additionalLinks?: ProjectLink[];
  generalBrief?: string;
  costItems?: ProjectCostItem[];
  paymentHistory?: PaymentHistoryItem[];
  tasks?: ProjectTask[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
