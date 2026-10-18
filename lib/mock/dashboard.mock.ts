import { ProjectCategoryCounts } from '@/types/dashboard';

/**
 * Jumlah baseline project per kategori (data historis sebelum daftar project berjalan).
 * Dashboard menambahkan jumlah project aktif di atas angka ini.
 */
export const mockDashboardCategories: ProjectCategoryCounts = {
  Event: 10,
  'Corporate Video': 4,
  'Film Production': 2,
  'Content Video/Marketing': 6,
  Wedding: 3,
};
