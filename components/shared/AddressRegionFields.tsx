'use client';

import { useEffect, useState } from 'react';
import Combobox from '@/components/ui/Combobox';
import { regionService, type Region } from '@/lib/services/regionService';

export interface RegionValues {
  province: string;
  city: string;
  subdistrict: string;
  village: string;
}

interface AddressRegionFieldsProps {
  value: RegionValues;
  onChange: (values: Partial<RegionValues>) => void;
  /** Class tambahan untuk tiap field (mis. "md:col-span-6" pada grid 12 kolom) */
  fieldClassName?: string;
  /** Pesan error per field, diteruskan ke Combobox masing-masing */
  errors?: Partial<Record<keyof RegionValues, string>>;
}

interface RegionList {
  code: string;
  regions: Region[];
}

/** Cocokkan nama wilayah tanpa memperhatikan kapital & spasi di ujung (untuk pre-fill data lama) */
const matches = (name: string, target: string) =>
  name.trim().toLowerCase() === target.trim().toLowerCase();

const findCode = (regions: Region[], name: string) =>
  regions.find((r) => matches(r.name, name))?.code ?? '';

const toOptions = (regions: Region[]) => regions.map((r) => ({ value: r.name, label: r.name }));

/**
 * 4 field alamat berjenjang (Provinsi -> City -> Subdistrict -> Village)
 * dengan search dropdown, data dari https://wilayah.id/ (lewat proxy /api/wilayah).
 * Value yang dihasilkan tetap berupa nama wilayah.
 */
export default function AddressRegionFields({
  value,
  onChange,
  fieldClassName,
  errors,
}: AddressRegionFieldsProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<RegionList | null>(null);
  const [districts, setDistricts] = useState<RegionList | null>(null);
  const [villages, setVillages] = useState<RegionList | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    regionService
      .getProvinces()
      .then((data) => {
        if (!cancelled) {
          setProvinces(data);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Kode wilayah diturunkan dari nama yang dipilih + daftar hasil fetch
  const provinceCode = findCode(provinces, value.province);
  const regencyRegions = regencies?.code === provinceCode ? regencies.regions : [];
  const cityCode = findCode(regencyRegions, value.city);
  const districtRegions = districts?.code === cityCode ? districts.regions : [];
  const subdistrictCode = findCode(districtRegions, value.subdistrict);
  const villageRegions = villages?.code === subdistrictCode ? villages.regions : [];

  const loadingRegencies = !!provinceCode && regencies?.code !== provinceCode;
  const loadingDistricts = !!cityCode && districts?.code !== cityCode;
  const loadingVillages = !!subdistrictCode && villages?.code !== subdistrictCode;

  useEffect(() => {
    if (!provinceCode) return;
    let cancelled = false;
    regionService
      .getRegencies(provinceCode)
      .then((data) => {
        if (!cancelled) setRegencies({ code: provinceCode, regions: data });
      })
      .catch(() => {
        if (!cancelled) setRegencies({ code: provinceCode, regions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  useEffect(() => {
    if (!cityCode) return;
    let cancelled = false;
    regionService
      .getDistricts(cityCode)
      .then((data) => {
        if (!cancelled) setDistricts({ code: cityCode, regions: data });
      })
      .catch(() => {
        if (!cancelled) setDistricts({ code: cityCode, regions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [cityCode]);

  useEffect(() => {
    if (!subdistrictCode) return;
    let cancelled = false;
    regionService
      .getVillages(subdistrictCode)
      .then((data) => {
        if (!cancelled) setVillages({ code: subdistrictCode, regions: data });
      })
      .catch(() => {
        if (!cancelled) setVillages({ code: subdistrictCode, regions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [subdistrictCode]);

  // Saat induk berubah, reset nama wilayah turunannya lewat form
  const handleSelectProvince = (name: string) =>
    onChange({ province: name, city: '', subdistrict: '', village: '' });

  const handleSelectCity = (name: string) => onChange({ city: name, subdistrict: '', village: '' });

  const handleSelectSubdistrict = (name: string) => onChange({ subdistrict: name, village: '' });

  const handleSelectVillage = (name: string) => onChange({ village: name });

  const emptyText = loadError ? 'Gagal memuat data wilayah, coba lagi' : 'Tidak ditemukan';

  return (
    <>
      <Combobox
        label="Province"
        placeholder="Search province..."
        options={toOptions(provinces)}
        value={value.province}
        onChange={handleSelectProvince}
        loading={loadingProvinces}
        error={errors?.province}
        emptyText={emptyText}
        className={fieldClassName}
      />
      <Combobox
        label="City"
        placeholder="Search city/regency..."
        options={toOptions(regencyRegions)}
        value={value.city}
        onChange={handleSelectCity}
        disabled={!provinceCode || loadingRegencies}
        loading={loadingRegencies}
        error={errors?.city}
        emptyText={emptyText}
        className={fieldClassName}
      />
      <Combobox
        label="Subdistrict"
        placeholder="Search subdistrict..."
        options={toOptions(districtRegions)}
        value={value.subdistrict}
        onChange={handleSelectSubdistrict}
        disabled={!cityCode || loadingDistricts}
        loading={loadingDistricts}
        error={errors?.subdistrict}
        emptyText={emptyText}
        className={fieldClassName}
      />
      <Combobox
        label="Village"
        placeholder="Search village..."
        options={toOptions(villageRegions)}
        value={value.village}
        onChange={handleSelectVillage}
        disabled={!subdistrictCode || loadingVillages}
        loading={loadingVillages}
        error={errors?.village}
        emptyText={emptyText}
        className={fieldClassName}
      />
    </>
  );
}
