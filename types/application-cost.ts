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

export interface ApplicationCostLineItem {
  id: string;
  itemName: string; // e.g. Full Production Package
  categoryName?: string; // e.g. Event Telkomsel
  descriptions?: string[]; // e.g. ['2 Kamera', 'Editing Livecam']
  unitPrice: number;
  quantity: number;
  freq: number;
  period: string;
  subTotal: number;
}

export interface ApplicationCostBankAccount {
  id: string;
  bankName: string; // e.g. Bank Central Asia (BCA)
  accountHolder: string; // e.g. Agus Tjahjono, SPD
  accountNumber: string; // e.g. 011–3075–764
}

/** Identitas vendor yang menerbitkan dokumen (letterhead & kop surat). */
export interface CompanyProfile {
  name: string; // e.g. Makromedia Visual
  legalName: string; // e.g. C.V Makromedia Visual
  tagline: string; // e.g. Makromedia Visual Creative
  instagram: string; // e.g. @makromedia.visual
  address: string; // e.g. Malang, Jawa Timur
  email: string; // e.g. makromedia@gmail.com
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
  mainClient?: string; // e.g. PT Innovate Indonesia
  eoInstance?: string; // e.g. 82 Pro

  // Identitas klien pada dokumen (Bill To / INFORMASI KLIEN)
  clientPIC?: string; // e.g. Mr. Bayu
  clientAddress?: string; // e.g. Jalan Sulfat No 10, Malang, Jawa Timur
  clientEmail?: string; // e.g. bayu@82pro.co.id

  // Metadata dokumen
  documentNumber?: string; // e.g. 001/QUO.MAKROMEDIA/11/2026
  documentReference?: string; // e.g. QUO-2026.11.001 – Telkomsel / 82 Pro
  releaseDate?: string; // e.g. 02 November 2026
  dueDate?: string; // e.g. 09 November 2026
  eventDateShort?: string; // e.g. 02 / 11 / 2026
  eventDateLong?: string; // e.g. Senin, 02 November 2026
  paymentTermLabel?: string; // e.g. Payment Term 1

  // 3 Highlight Metrics
  contractValue?: number; // e.g. 2000000
  estimateCost?: number; // e.g. 800000
  costPercent?: number; // e.g. 40
  estimateProfit?: number; // e.g. 1200000
  profitMargin?: number; // e.g. 60

  // Rincian pekerjaan, pembayaran, dan rekening
  lineItems?: ApplicationCostLineItem[];
  discountPercent?: number;
  pph?: number;
  previousPayment?: number;
  bankAccounts?: ApplicationCostBankAccount[];

  // 9 Grouped Categories
  categories?: ApplicationCostGroupCategory[];

  notes?: string;
  signatureUrl?: string;
}
