'use client';

import React from 'react';
import { ProjectCostItem } from '@/types/project';
import { Trash2, Pencil } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { showToast } from '@/components/ui/Toast';

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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
            <th className="py-4 px-4 text-center">Nama Item / Jenis Pekerjaan</th>
            <th className="py-4 px-4 text-center">Nama Pelaksana / Toko</th>
            <th className="py-4 px-4 text-center">Harga Satuan</th>
            <th className="py-4 px-4 text-center">Jumlah</th>
            <th className="py-4 px-4 text-center">Freq</th>
            <th className="py-4 px-4 text-center">Periode</th>
            <th className="py-4 px-4 text-center">Sub Total</th>
            {!readOnly && <th className="py-4 px-4 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="text-xs text-slate-700">
          {categories.map((catName, catIdx) => {
            const catItems = items.filter((i) => (i.category || 'Rincian Umum') === catName);
            const cleanCatName = catName.replace(/^\d+\.\s*/, '');
            const categoryTitle = `${catIdx + 1}. ${cleanCatName}`;

            return (
              <React.Fragment key={catName}>
                <tr className="bg-white border-b border-slate-200">
                  <td colSpan={readOnly ? 7 : 8} className="py-3.5 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary tracking-wide">
                        {categoryTitle}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {catItems.length} Item
                      </span>
                    </div>
                  </td>
                </tr>
                {catItems.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-4 px-4 text-slate-500">{item.executor || '-'}</td>
                    <td className="py-4 px-4 text-right font-medium">{formatRupiah(item.unitCost)}</td>
                    <td className="py-4 px-4 text-center font-semibold">{item.quantity} {item.unit}</td>
                    <td className="py-4 px-4 text-center">{item.freq || 1}</td>
                    <td className="py-4 px-4 text-center text-slate-500">{item.period || '-'}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatRupiah(item.totalCost)}
                    </td>
                    {!readOnly && (
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit ? onEdit(item) : showToast.info('Edit item')}
                            className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete ? onDelete(item.id) : showToast.info('Hapus item')}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LineItemTable;
