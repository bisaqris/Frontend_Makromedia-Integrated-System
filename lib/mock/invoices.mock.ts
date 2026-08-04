import { Invoice } from '@/types/invoice';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    projectId: 'proj-1',
    projectName: 'Peluncuran Produk Innovate Tech 2026',
    clientId: 'cli-1',
    clientName: 'PT Innovate Indonesia',
    issueDate: '2026-05-01',
    dueDate: '2026-05-15',
    status: 'PARTIALLY_PAID',
    subtotal: 315225225,
    taxAmount: 34774775,
    totalAmount: 350000000,
    paidAmount: 250000000,
    items: [
      {
        id: 'iitem-1',
        invoiceId: 'inv-1',
        description: 'Termin 1 (DP 70%) Peluncuran Produk Innovate Tech',
        amount: 250000000,
      },
    ],
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    projectId: 'proj-2',
    projectName: 'Company Profile & Video Direksi',
    clientId: 'cli-2',
    clientName: 'Bank Nusantara',
    issueDate: '2026-05-05',
    dueDate: '2026-05-20',
    status: 'PARTIALLY_PAID',
    subtotal: 225225225,
    taxAmount: 24774775,
    totalAmount: 250000000,
    paidAmount: 200000000,
    items: [
      {
        id: 'iitem-2',
        invoiceId: 'inv-2',
        description: 'Termin 1 Company Profile Bank Nusantara',
        amount: 200000000,
      },
    ],
  },
];
