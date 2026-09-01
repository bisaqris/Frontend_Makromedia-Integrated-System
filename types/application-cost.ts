export type ApplicationCostStatus = 'Revise' | 'Pending' | 'Approved';

export type ApplicationCostDocType = 'Production Cost' | 'Quotation' | 'Invoice';

export interface ApplicationCostCategoryItem {
  id: string;
  itemName: string; // e.g. Project Manager, Kameramen Livecam
  executorName: string; // e.g. Agus Tjahjono, Anton Wisnu Wijaya
  unitPrice: number; // e.g. 100000
  quantity: number; // e.g. 1
  unitLabel: string; // e.g. 'org'
  freq: number; // e.g. 1
  freqUnitLabel: string; // e.g. 'item'
  period: string; // e.g. '3 hari'
  subTotal: number; // e.g. 300000
}

export interface ApplicationCostGroupCategory {
  number: number; // 1 to 9
  categoryName: string; // e.g. Fee SDM Internal, Fee SDM External
  items: ApplicationCostCategoryItem[];
}

export interface ApplicationCostItem {
  id: string;
  projectId: string;
  projectName: string;
  applicationDocument: ApplicationCostDocType;
  applicationDate: string;
  totalCost: number;
  status: ApplicationCostStatus;

  // Detail Info Fields (Matching 1:1 with Design)
  projectOfficer?: string; // e.g. Agus Tjahjono
  venue?: string; // e.g. Malang, East Java
  eventDate?: string; // e.g. 02 Oktober 2026
  mainClient?: string; // e.g. Mr. Bayu
  eoInstance?: string; // e.g. 82 Pro

  // 3 Highlight Metrics
  contractValue?: number; // e.g. 2000000
  estimateCost?: number; // e.g. 800000
  costPercent?: number; // e.g. 40
  estimateProfit?: number; // e.g. 1200000
  profitMargin?: number; // e.g. 60

  // 9 Grouped Categories
  categories?: ApplicationCostGroupCategory[];

  notes?: string;
  signatureUrl?: string;
}
