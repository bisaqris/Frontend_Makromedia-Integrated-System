export type ApplicationCostStatus = 'Revise' | 'Pending' | 'Approved';

export type ApplicationCostDocType = 'Production Cost' | 'Quotation' | 'Invoice';

export interface ApplicationCostItem {
  id: string;
  projectId: string;
  projectName: string;
  applicationDocument: ApplicationCostDocType;
  applicationDate: string;
  totalCost: number;
  status: ApplicationCostStatus;
}
