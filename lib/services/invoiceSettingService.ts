import { InvoiceSetting } from '@/types/invoice-setting';
import { apiClient } from '@/lib/apiClient';
import { USE_MOCK } from './mockFlag';

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
          signerSignatureUrl:
            parsed.signerSignatureUrl !== undefined
              ? parsed.signerSignatureUrl
              : DEFAULT_INVOICE_SETTING.signerSignatureUrl,
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
      } catch (e) {
        console.warn('Failed to save invoice setting to localStorage, attempting fallback:', e);
        try {
          // If storage limit reached, try storing without oversized signature image
          const fallback = { ...updated, signerSignatureUrl: '' };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        } catch {
          // localStorage completely full
        }
      }
      try {
        window.dispatchEvent(
          new CustomEvent('makromedia:invoice-setting-updated', { detail: updated })
        );
      } catch {
        // ignore
      }

      // Sync to backend asynchronously if not in mock mode
      if (!USE_MOCK) {
        const payload = {
          pphPercent: updated.pphPercent,
          termsOfCondition: updated.termsOfCondition,
          paymentInstruction: updated.paymentInstruction,
          bankAccounts: updated.bankAccounts,
          signerName: updated.signerName,
          signerPosition: updated.signerPosition,
          signerSignatureUrl: updated.signerSignatureUrl,
          signerUserId: updated.signerUserId,
        };
        apiClient.patch('/invoice-settings', payload).catch(() => {
          apiClient.put('/settings/invoice', updated).catch(() => {
            // keep local setting on network failure
          });
        });
      }
    }
    return updated;
  },

  saveSetting: async (updates: Partial<InvoiceSetting>): Promise<InvoiceSetting> => {
    const updated = invoiceSettingService.updateSetting(updates);
    if (!USE_MOCK) {
      const payload = {
        pphPercent: updated.pphPercent,
        termsOfCondition: updated.termsOfCondition,
        paymentInstruction: updated.paymentInstruction,
        bankAccounts: updated.bankAccounts,
        signerName: updated.signerName,
        signerPosition: updated.signerPosition,
        signerSignatureUrl: updated.signerSignatureUrl,
        signerUserId: updated.signerUserId,
      };
      try {
        await apiClient.patch('/invoice-settings', payload);
      } catch {
        try {
          await apiClient.put('/settings/invoice', updated);
        } catch {
          // ignore
        }
      }
    }
    return updated;
  },

  fetchFromBackend: async (): Promise<InvoiceSetting> => {
    if (USE_MOCK) return invoiceSettingService.getSetting();
    try {
      // Try upstream endpoint /invoice-settings first
      let rawData: any = null;
      try {
        const res = await apiClient.get<any>('/invoice-settings');
        rawData = res.data?.data || res.data;
      } catch {
        const res = await apiClient.get<any>('/settings/invoice');
        rawData = res.data?.data || res.data;
      }

      if (rawData && typeof rawData.pphPercent === 'number') {
        const merged: InvoiceSetting = {
          ...DEFAULT_INVOICE_SETTING,
          ...rawData,
          signerName: cleanSignerName(rawData.signerName) || DEFAULT_INVOICE_SETTING.signerName,
          termsOfCondition:
            Array.isArray(rawData.termsOfCondition) && rawData.termsOfCondition.length > 0
              ? rawData.termsOfCondition
              : DEFAULT_INVOICE_SETTING.termsOfCondition,
          paymentInstruction:
            rawData.paymentInstruction !== undefined && rawData.paymentInstruction !== null
              ? rawData.paymentInstruction
              : DEFAULT_INVOICE_SETTING.paymentInstruction,
          bankAccounts:
            Array.isArray(rawData.bankAccounts) && rawData.bankAccounts.length > 0
              ? rawData.bankAccounts
              : DEFAULT_INVOICE_SETTING.bankAccounts,
        };
        memorySetting = merged;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          try {
            window.dispatchEvent(
              new CustomEvent('makromedia:invoice-setting-updated', { detail: merged })
            );
          } catch {
            // ignore
          }
        }
        return merged;
      }
    } catch {
      // fallback to local
    }
    return invoiceSettingService.getSetting();
  },

  getTerms: async (): Promise<string[]> => {
    if (USE_MOCK) return invoiceSettingService.getSetting().termsOfCondition;
    try {
      const setting = await invoiceSettingService.fetchFromBackend();
      if (Array.isArray(setting.termsOfCondition) && setting.termsOfCondition.length > 0) {
        return setting.termsOfCondition;
      }
    } catch {
      // fallback
    }
    return invoiceSettingService.getSetting().termsOfCondition;
  },
};
