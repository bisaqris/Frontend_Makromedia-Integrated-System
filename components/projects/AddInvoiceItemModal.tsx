'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ProjectCostItem } from '@/types/project';

interface AddInvoiceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProjectCostItem, 'id' | 'projectId'>) => void;
  editItem?: ProjectCostItem;
}

export const AddInvoiceItemModal: React.FC<AddInvoiceItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [description, setDescription] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [freq, setFreq] = useState<number | ''>(1);
  const [period, setPeriod] = useState('1');

  const [descError, setDescError] = useState('');
  const [costError, setCostError] = useState('');

  // Synchronous state updates on prop changes (React 19 / Next 16 clean pattern)
  const [prevEditItem, setPrevEditItem] = useState<ProjectCostItem | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
      setDescError('');
      setCostError('');
      if (editItem) {
        setDescription(editItem.description || '');
        setCategoryLabel(editItem.category || '');
        setDetailDescription(editItem.executor || '');
        setUnitCost(editItem.unitCost || 0);
        setQuantity(editItem.quantity || 1);
        setFreq(editItem.freq || 1);
        setPeriod(editItem.period || '1');
      } else {
        setDescription('');
        setCategoryLabel('');
        setDetailDescription('');
        setUnitCost('');
        setQuantity(1);
        setFreq(1);
        setPeriod('1');
      }
    }
  }

  const numericUnitCost = typeof unitCost === 'number' ? unitCost : 0;
  const numericQuantity = typeof quantity === 'number' ? quantity : 0;
  const numericFreq = typeof freq === 'number' ? freq : 1;
  const calculatedTotal = numericUnitCost * numericQuantity * (numericFreq || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!description.trim()) {
      setDescError('Deskripsi layanan/item wajib diisi.');
      hasError = true;
    }
    if (unitCost === '' || numericUnitCost < 0) {
      setCostError('Harga satuan tidak boleh negatif.');
      hasError = true;
    }

    if (hasError) return;

    onSave({
      category: categoryLabel.trim() || 'Invoice',
      description: description.trim(),
      executor: detailDescription.trim(),
      unitCost: numericUnitCost,
      quantity: numericQuantity || 1,
      unit: 'Paket',
      freq: numericFreq || 1,
      period: period.trim() || '1',
      totalCost: calculatedTotal,
    });

    onClose();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Item Tagihan Invoice' : 'Tambah Item Tagihan Invoice'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategori / Group Item
          </label>
          <Input
            placeholder="misal: Pra-Produksi / Jasa Shooting / Post-Production"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Layanan / Item <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="misal: Jasa Video Shooting 3 Hari Full Team"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descError) setDescError('');
            }}
            error={descError}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan Tambahan / Spesifikasi
          </label>
          <textarea
            rows={2}
            value={detailDescription}
            onChange={(e) => setDetailDescription(e.target.value)}
            placeholder="Spesifikasi gear, resolusi 4K, crew 5 orang..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Satuan (Rp) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="0"
              value={unitCost}
              onChange={(e) => {
                const val = e.target.value;
                setUnitCost(val === '' ? '' : Number(val));
                if (costError) setCostError('');
              }}
              error={costError}
              required
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qty (Jumlah) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === '' ? '' : Number(val));
              }}
              required
              min={1}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Subtotal Item:</span>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(calculatedTotal)}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {editItem ? 'Simpan Perubahan' : 'Tambah ke Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddInvoiceItemModal;
