export interface InvoiceBankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}

export interface InvoiceSetting {
  pphPercent: number;
  termsOfCondition: string[];
  paymentInstruction?: string;
  bankAccounts: InvoiceBankAccount[];
  signerName?: string;
  signerPosition?: string;
  signerSignatureUrl?: string;
  signerUserId?: string;
  updatedAt?: string;
}
