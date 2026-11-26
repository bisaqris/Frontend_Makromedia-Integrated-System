export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
};

/** Ambil pesan error dari response API (axios) dengan aman, tanpa `any`. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data =
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: unknown } }).response?.data
      : undefined;
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}

/** Format tanggal ke format teks Bahasa Indonesia, misal: "15 Desember 2004" */
export const formatDateID = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const cleanStr = String(dateStr).trim();
  if (!cleanStr) return '-';

  // Format YYYY-MM-DD
  const dateOnly = cleanStr.includes('T') ? cleanStr.split('T')[0] : cleanStr;
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return cleanStr;
};

/** Format tanggal untuk nilai <input type="date"> (YYYY-MM-DD) */
export const toInputDateFormat = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = String(dateStr).trim();
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

/** Format angka ke format nominal bertitik (contoh: 1500000 -> "1.500.000") */
export const formatNominal = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(Number(clean));
};

/** Parse string nominal bertitik kembali ke number murni (contoh: "1.500.000" -> 1500000) */
export const parseNominal = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const clean = String(value).replace(/\D/g, '');
  return clean ? Number(clean) : 0;
};

/** Validasi apakah string merupakan format URL web yang valid (wajib diawali http:// atau https://) */
export const isValidUrl = (urlString?: string | null): boolean => {
  if (!urlString) return false;
  const clean = urlString.trim();
  if (!clean) return false;

  // Harus diawali http:// atau https://
  if (!/^https?:\/\//i.test(clean)) return false;

  try {
    const parsed = new URL(clean);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

/** Normalisasi URL memastikan diawali https:// jika belum ada protokol */
export const normalizeUrl = (urlString?: string | null): string => {
  if (!urlString) return '';
  const clean = urlString.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `https://${clean}`;
};
