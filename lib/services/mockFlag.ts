/**
 * Satu-satunya saklar sumber data aplikasi.
 *
 * - `NEXT_PUBLIC_USE_MOCK` tidak diset (default) -> semua service memakai data di `lib/mock`.
 * - `NEXT_PUBLIC_USE_MOCK=0`                     -> semua service memakai API asli lewat `apiClient`.
 *
 * Tidak ada fallback diam-diam: saat mock OFF dan API gagal, error dibiarkan naik
 * supaya kegagalan backend terlihat, bukan tertutup data dummy.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== '0';

/** Salinan dalam data mock agar mutasi UI tidak mengubah konstanta di `lib/mock`. */
export const cloneMock = <T>(value: T): T => structuredClone(value);
