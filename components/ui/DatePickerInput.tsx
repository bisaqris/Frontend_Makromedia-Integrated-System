'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateID } from '@/lib/utils';

export interface DatePickerInputProps {
  id?: string;
  name?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  className?: string;
}

/**
 * Komponen DatePickerInput:
 * Menampilkan tanggal rapi berbahasa Indonesia (contoh: "20 Desember 2000"),
 * namun nilai underlying state & form submit tetap format standar komputer (YYYY-MM-DD).
 */
export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  id,
  name,
  value,
  onChange,
  min,
  max,
  placeholder = 'Pilih tanggal...',
  disabled = false,
  required = false,
  error = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayFormatted = value ? formatDateID(value) : '';

  const handleClick = () => {
    if (disabled || !inputRef.current) return;
    try {
      inputRef.current.showPicker?.();
    } catch {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full h-[42px] bg-white border rounded-xl px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-colors group ${
        error
          ? 'border-red-500'
          : 'border-slate-200 hover:border-primary focus-within:border-primary'
      } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} ${className}`}
    >
      {/* Underlying transparent date input */}
      <input
        ref={inputRef}
        type="date"
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Styled visible layer */}
      <span
        className={`truncate select-none ${
          displayFormatted ? 'text-slate-800 font-normal' : 'text-slate-400'
        }`}
      >
        {displayFormatted || placeholder}
      </span>

      <Calendar className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0 ml-2 pointer-events-none" />
    </div>
  );
};

export default DatePickerInput;
