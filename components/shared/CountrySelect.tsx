'use client';

import React, { useMemo } from 'react';
import Combobox, { ComboboxOption } from '@/components/ui/Combobox';
import { Country } from 'country-state-city';

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function CountrySelect({
  value,
  onChange,
  error,
  disabled,
  className,
  required = true,
}: CountrySelectProps) {
  const options: ComboboxOption[] = useMemo(() => {
    const all = Country.getAllCountries().map((c) => ({
      value: c.name,
      label: `${c.flag} ${c.name}`,
    }));
    // Pin Indonesia to the top for easy selection
    const idIdx = all.findIndex((c) => c.value.toLowerCase() === 'indonesia');
    if (idIdx > -1) {
      const [idItem] = all.splice(idIdx, 1);
      return [idItem, ...all];
    }
    return all;
  }, []);

  return (
    <Combobox
      label="Country"
      placeholder="Pilih atau cari Negara..."
      options={options}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
      emptyText="Negara tidak ditemukan"
    />
  );
}
