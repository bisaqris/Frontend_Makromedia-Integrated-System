'use client';

import { useEffect, useMemo, useState } from 'react';
import Combobox from '@/components/ui/Combobox';
import { regionService, type Region } from '@/lib/services/regionService';
import { Country, State, City } from 'country-state-city';

export interface RegionValues {
  country?: string;
  province: string;
  city: string;
  subdistrict?: string;
  village?: string;
}

interface AddressRegionFieldsProps {
  country?: string;
  value: RegionValues;
  onChange: (values: Partial<RegionValues>) => void;
  /** Class tambahan untuk tiap field (mis. "md:col-span-6" pada grid 12 kolom) */
  fieldClassName?: string;
  /** Pesan error per field, diteruskan ke Combobox masing-masing */
  errors?: Partial<Record<keyof RegionValues, string>>;
  disabled?: boolean;
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
 * Field alamat berjenjang:
 * - Jika Indonesia: 4 field (Provinsi -> Kota/Kabupaten -> Kecamatan -> Kelurahan) via wilayah.id.
 * - Jika Luar Negeri: 2 field (State / Province -> City) via database negara global (country-state-city).
 */
export default function AddressRegionFields({
  country,
  value,
  onChange,
  fieldClassName,
  errors,
  disabled = false,
}: AddressRegionFieldsProps) {
  const currentCountry = (country || value.country || 'Indonesia').trim();
  const isIndonesia = !currentCountry || currentCountry.toLowerCase() === 'indonesia';

  // --- INDONESIA REGION STATE (wilayah.id) ---
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<RegionList | null>(null);
  const [districts, setDistricts] = useState<RegionList | null>(null);
  const [villages, setVillages] = useState<RegionList | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (disabled || !isIndonesia) return;
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
  }, [disabled, isIndonesia]);

  // Kode wilayah Indonesia
  const provinceCode = isIndonesia ? findCode(provinces, value.province) : '';
  const regencyRegions = regencies?.code === provinceCode ? regencies.regions : [];
  const cityCode = isIndonesia ? findCode(regencyRegions, value.city) : '';
  const districtRegions = districts?.code === cityCode ? districts.regions : [];
  const subdistrictCode = isIndonesia ? findCode(districtRegions, value.subdistrict || '') : '';
  const villageRegions = villages?.code === subdistrictCode ? villages.regions : [];

  const loadingRegencies = isIndonesia && !!provinceCode && regencies?.code !== provinceCode;
  const loadingDistricts = isIndonesia && !!cityCode && districts?.code !== cityCode;
  const loadingVillages = isIndonesia && !!subdistrictCode && villages?.code !== subdistrictCode;

  useEffect(() => {
    if (disabled || !isIndonesia || !provinceCode) return;
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
  }, [disabled, isIndonesia, provinceCode]);

  useEffect(() => {
    if (disabled || !isIndonesia || !cityCode) return;
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
  }, [cityCode, disabled, isIndonesia]);

  useEffect(() => {
    if (disabled || !isIndonesia || !subdistrictCode) return;
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
  }, [disabled, isIndonesia, subdistrictCode]);

  // --- GLOBAL WORLD REGION STATE (country-state-city) ---
  const selectedCountryObj = useMemo(() => {
    if (isIndonesia || !currentCountry) return null;
    const countries = Country.getAllCountries();
    return (
      countries.find(
        (c) =>
          c.name.toLowerCase() === currentCountry.toLowerCase() ||
          c.isoCode.toLowerCase() === currentCountry.toLowerCase()
      ) || null
    );
  }, [isIndonesia, currentCountry]);

  const globalStates = useMemo(() => {
    if (isIndonesia || !selectedCountryObj) return [];
    return State.getStatesOfCountry(selectedCountryObj.isoCode);
  }, [isIndonesia, selectedCountryObj]);

  const selectedStateObj = useMemo(() => {
    if (isIndonesia || !value.province || globalStates.length === 0) return null;
    return (
      globalStates.find(
        (s) =>
          s.name.toLowerCase() === value.province.toLowerCase() ||
          s.isoCode.toLowerCase() === value.province.toLowerCase()
      ) || null
    );
  }, [isIndonesia, value.province, globalStates]);

  const globalCities = useMemo(() => {
    if (isIndonesia || !selectedCountryObj) return [];
    if (selectedStateObj) {
      return City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode);
    }
    if (globalStates.length === 0) {
      return City.getCitiesOfCountry(selectedCountryObj.isoCode) || [];
    }
    return [];
  }, [isIndonesia, selectedCountryObj, selectedStateObj, globalStates.length]);

  const globalStateOptions = useMemo(
    () => globalStates.map((s) => ({ value: s.name, label: s.name })),
    [globalStates]
  );

  const globalCityOptions = useMemo(
    () => globalCities.map((c) => ({ value: c.name, label: c.name })),
    [globalCities]
  );

  // Handlers
  const handleSelectProvince = (name: string) => {
    if (isIndonesia) {
      onChange({ province: name, city: '', subdistrict: '', village: '' });
    } else {
      onChange({ province: name, city: '', subdistrict: '-', village: '-' });
    }
  };

  const handleSelectCity = (name: string) => {
    if (isIndonesia) {
      onChange({ city: name, subdistrict: '', village: '' });
    } else {
      onChange({ city: name, subdistrict: '-', village: '-' });
    }
  };

  const handleSelectSubdistrict = (name: string) => onChange({ subdistrict: name, village: '' });
  const handleSelectVillage = (name: string) => onChange({ village: name });

  const emptyText = isIndonesia
    ? loadError
      ? 'Gagal memuat data wilayah, coba lagi'
      : 'Tidak ditemukan'
    : 'Tidak ditemukan';

  return (
    <>
      <Combobox
        label={isIndonesia ? 'Province' : 'State / Province'}
        placeholder={isIndonesia ? 'Search province...' : 'Search state / province...'}
        options={isIndonesia ? toOptions(provinces) : globalStateOptions}
        value={value.province}
        onChange={handleSelectProvince}
        disabled={disabled}
        loading={isIndonesia && loadingProvinces}
        error={errors?.province}
        emptyText={emptyText}
        className={fieldClassName}
      />

      <Combobox
        label="City"
        placeholder={isIndonesia ? 'Search city/regency...' : 'Search city...'}
        options={isIndonesia ? toOptions(regencyRegions) : globalCityOptions}
        value={value.city}
        onChange={handleSelectCity}
        disabled={
          disabled ||
          (isIndonesia
            ? !provinceCode || loadingRegencies
            : !value.province && globalStateOptions.length > 0)
        }
        loading={isIndonesia && loadingRegencies}
        error={errors?.city}
        emptyText={emptyText}
        className={fieldClassName}
      />

      {isIndonesia && (
        <>
          <Combobox
            label="Subdistrict"
            placeholder="Search subdistrict..."
            options={toOptions(districtRegions)}
            value={value.subdistrict || ''}
            onChange={handleSelectSubdistrict}
            disabled={disabled || !cityCode || loadingDistricts}
            loading={loadingDistricts}
            error={errors?.subdistrict}
            emptyText={emptyText}
            className={fieldClassName}
          />
          <Combobox
            label="Village"
            placeholder="Search village..."
            options={toOptions(villageRegions)}
            value={value.village || ''}
            onChange={handleSelectVillage}
            disabled={disabled || !subdistrictCode || loadingVillages}
            loading={loadingVillages}
            error={errors?.village}
            emptyText={emptyText}
            className={fieldClassName}
          />
        </>
      )}
    </>
  );
}
