import { InvoiceSetting } from '@/types/invoice-setting';

const STORAGE_KEY = 'makromedia_invoice_setting';

export const cleanSignerName = (name?: string): string => {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)/g, '').trim();
};

export const DEFAULT_INVOICE_SETTING: InvoiceSetting = {
  pphPercent: 2,
  termsOfCondition: [
    'Pembayaran wajib dilakukan paling lambat sesuai tanggal jatuh tempo yang tercantum.',
    'Pembayaran transfer hanya dianggap sah apabila ditransfer ke rekening bank resmi yang tercantum.',
    'Bukti transfer mohon dikirimkan melalui WhatsApp Finance atau email resmi Makromedia.',
  ],
  paymentInstruction:
    'Pembayaran dapat ditransfer melalui rekening yang tercantum di atas. Mohon cantumkan nomor invoice pada berita transfer.',
  signerName: 'Budi Santoso',
  signerPosition: 'Direktur Utama',
  signerSignatureUrl: '',
  bankAccounts: [
    {
      id: 'acc-1',
      bankName: 'Bank Central Asia (BCA)',
      accountHolder: 'PT Makromedia Visual',
      accountNumber: '8220918231',
    },
    {
      id: 'acc-2',
      bankName: 'Bank Mandiri',
      accountHolder: 'PT Makromedia Visual',
      accountNumber: '1420018899210',
    },
  ],
  updatedAt: new Date().toISOString(),
};

let memorySetting: InvoiceSetting = { ...DEFAULT_INVOICE_SETTING };

export const invoiceSettingService = {
  getSetting: (): InvoiceSetting => {
    if (typeof window === 'undefined') return memorySetting;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INVOICE_SETTING));
        return DEFAULT_INVOICE_SETTING;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.pphPercent === 'number') {
        const sanitizedSignerName =
          cleanSignerName(parsed.signerName) || DEFAULT_INVOICE_SETTING.signerName;
        const merged: InvoiceSetting = {
          ...DEFAULT_INVOICE_SETTING,
          ...parsed,
          termsOfCondition:
            Array.isArray(parsed.termsOfCondition) && parsed.termsOfCondition.length > 0
              ? parsed.termsOfCondition
              : DEFAULT_INVOICE_SETTING.termsOfCondition,
          paymentInstruction:
            parsed.paymentInstruction !== undefined
              ? parsed.paymentInstruction
              : DEFAULT_INVOICE_SETTING.paymentInstruction,
          bankAccounts:
            Array.isArray(parsed.bankAccounts) && parsed.bankAccounts.length > 0
              ? parsed.bankAccounts
              : DEFAULT_INVOICE_SETTING.bankAccounts,
          signerName: sanitizedSignerName,
          signerPosition: parsed.signerPosition || DEFAULT_INVOICE_SETTING.signerPosition,
          signerSignatureUrl: parsed.signerSignatureUrl ?? DEFAULT_INVOICE_SETTING.signerSignatureUrl,
          signerUserId: parsed.signerUserId ?? DEFAULT_INVOICE_SETTING.signerUserId,
        };
        if (parsed.signerName !== sanitizedSignerName) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
        memorySetting = merged;
        return merged;
      }
    } catch {
      // fallback
    }
    return memorySetting;
  },

  updateSetting: (updates: Partial<InvoiceSetting>): InvoiceSetting => {
    const current = invoiceSettingService.getSetting();
    const cleanUpdates = { ...updates };
    if (cleanUpdates.signerName !== undefined) {
      cleanUpdates.signerName = cleanSignerName(cleanUpdates.signerName);
    }
    const updated: InvoiceSetting = {
      ...current,
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
    memorySetting = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('makromedia:invoice-setting-updated', { detail: updated }));
      } catch {
        // quota exceeded or SSR
      }
    }
    return updated;
  },
};
