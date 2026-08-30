'use client';

import React from 'react';
import { ProjectCostItem } from '@/types/project';
import { Trash2, Pencil } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

interface LineItemTableProps {
  items: ProjectCostItem[];
  onEdit?: (item: ProjectCostItem) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export const LineItemTable: React.FC<LineItemTableProps> = ({
  items,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Rincian Item"
        message="Masih belum ada data rincian pekerjaan atau biaya produksi untuk proyek ini."
      />
    );
  }

  const categories = Array.from(new Set(items.map((i) => i.category || 'Rincian Umum')));

  return (
    <div className="space-y-6">
      {categories.map((catName) => {
        const catItems = items.filter((i) => (i.category || 'Rincian Umum') === catName);

        return (
          <div key={catName} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
            {/* Category Header */}
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {catName}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {catItems.length} Item
              </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400 bg-white">
                    <th className="py-2.5 px-4">Deskripsi / Jenis Pekerjaan</th>
                    <th className="py-2.5 px-4">Pelaksana / Toko</th>
                    <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-4 text-center">Jumlah</th>
                    <th className="py-2.5 px-4 text-center">Freq</th>
                    <th className="py-2.5 px-4 text-center">Periode</th>
                    <th className="py-2.5 px-4 text-right">Sub Total</th>
                    {!readOnly && <th className="py-2.5 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {catItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3 px-4 text-slate-500">{item.executor || '-'}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatRupiah(item.unitCost)}</td>
                      <td className="py-3 px-4 text-center font-semibold">{item.quantity} {item.unit}</td>
                      <td className="py-3 px-4 text-center">{item.freq || 1}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{item.period || '-'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(item.totalCost)}
                      </td>
                      {!readOnly && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <button
                                type="button"
                                onClick={() => onEdit(item)}
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit Item"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LineItemTable;
