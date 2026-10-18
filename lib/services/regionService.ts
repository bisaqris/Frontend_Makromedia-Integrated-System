export interface Region {
  code: string;
  name: string;
}

interface WilayahResponse {
  data?: Region[];
}

// Diakses lewat rewrite di next.config.ts -> https://wilayah.id/api/:path*
const BASE_URL = '/api/wilayah';

// Cache in-memory per session, data wilayah jarang berubah
const cache = new Map<string, Region[]>();

async function fetchRegions(path: string): Promise<Region[]> {
  const cached = cache.get(path);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/${path}.json`);
  if (!res.ok) {
    throw new Error(`Gagal memuat data wilayah (${res.status})`);
  }

  const json: WilayahResponse = await res.json();
  const regions: Region[] = Array.isArray(json?.data) ? json.data : [];

  cache.set(path, regions);
  return regions;
}

export const regionService = {
  getProvinces: () => fetchRegions('provinces'),
  getRegencies: (provinceCode: string) => fetchRegions(`regencies/${provinceCode}`),
  getDistricts: (regencyCode: string) => fetchRegions(`districts/${regencyCode}`),
  getVillages: (districtCode: string) => fetchRegions(`villages/${districtCode}`),
};
