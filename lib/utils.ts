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