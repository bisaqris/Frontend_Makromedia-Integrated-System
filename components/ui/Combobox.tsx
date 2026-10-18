'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
  emptyText?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

/**
 * Searchable dropdown (combobox) tanpa dependency eksternal.
 * Mengetik untuk mencari, panah ↑/↓ untuk navigasi, Enter untuk memilih, Escape untuk menutup.
 */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder,
      disabled = false,
      loading = false,
      error,
      helperText,
      emptyText = 'Tidak ditemukan',
      required,
      id,
      className,
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const listId = inputId ? `${inputId}-listbox` : undefined;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedLabel = options.find((opt) => opt.value === value)?.label ?? value;

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, query]);

    const close = () => {
      setOpen(false);
      setQuery('');
    };

    const openList = () => {
      if (disabled || loading) return;
      setOpen(true);
      setQuery('');
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    };

    const select = (optionValue: string) => {
      onChange(optionValue);
      close();
    };

    // Tutup saat klik di luar komponen
    useEffect(() => {
      if (!open) return;
      const handlePointerDown = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          close();
        }
      };
      document.addEventListener('mousedown', handlePointerDown);
      return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [open]);

    // Pastikan opsi aktif terlihat di dalam area scroll
    useEffect(() => {
      if (!open) return;
      const el = listRef.current?.querySelector('[data-active="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIndex, filtered.length]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          openList();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[activeIndex]) select(filtered[activeIndex].value);
          break;
        case 'Escape':
          close();
          break;
        default:
          break;
      }
    };

    return (
      <div className={twMerge('w-full flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-gray-500 select-none">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div ref={containerRef} className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            disabled={disabled}
            value={open ? query : selectedLabel}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onFocus={openList}
            onClick={openList}
            onKeyDown={handleKeyDown}
            placeholder={loading ? 'Memuat...' : placeholder}
            className={twMerge(
              clsx(
                'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                'transition-all duration-150 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20',
                'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
                'pr-9',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-200'
              )
            )}
          />
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ChevronDown size={16} className={clsx('transition-transform', open && 'rotate-180')} />
            )}
          </div>

          {open && (
            <ul
              id={listId}
              ref={listRef}
              className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {loading ? (
                <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Memuat data wilayah...
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-400">{emptyText}</li>
              ) : (
                filtered.map((opt, index) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      data-active={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(opt.value)}
                      className={clsx(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                        index === activeIndex ? 'bg-primary/10 text-primary' : 'text-slate-700'
                      )}
                    >
                      <Check
                        size={14}
                        className={clsx('shrink-0', opt.value === value ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Combobox.displayName = 'Combobox';

export default Combobox;
