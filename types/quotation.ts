export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'REVISED';

export interface QuotationItem {
  id: string;
  quotationId: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  clientName?: string;
  date: string;
  validUntil: string;
  status: QuotationStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  items?: QuotationItem[];
  notes?: string;
  createdAt?: string;
}
