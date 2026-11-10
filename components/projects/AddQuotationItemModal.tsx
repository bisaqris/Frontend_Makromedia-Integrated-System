'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ProjectCostItem } from '@/types/project';

interface AddQuotationItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProjectCostItem, 'id' | 'projectId'>) => void;
  editItem?: ProjectCostItem;
}

export const AddQuotationItemModal: React.FC<AddQuotationItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [description, setDescription] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [freq, setFreq] = useState<number | ''>(1);
  const [period, setPeriod] = useState('hari');

  const [descError, setDescError] = useState('');
  const [costError, setCostError] = useState('');

  // Track previous prop states to update state during render synchronously
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
        setDetailDescription(editItem.executor || '');
        setUnitCost(editItem.unitCost || 0);
        setQuantity(editItem.quantity || 1);
        setFreq(editItem.freq || 1);
        setPeriod(editItem.period || 'hari');
      } else {
        setDescription('');
        setDetailDescription('');
        setUnitCost('');
        setQuantity(1);
        setFreq(1);
        setPeriod('hari');
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
      setDescError('Deskripsi penawaran / scope pekerjaan wajib diisi.');
      hasError = true;
    }
    if (unitCost === '' || numericUnitCost < 0) {
      setCostError('Harga satuan penawaran tidak boleh negatif.');
      hasError = true;
    }

    if (hasError) return;

    onSave({
      category: 'Penawaran',
      description: description.trim(),
      executor: detailDescription.trim(),
      unitCost: numericUnitCost,
      quantity: numericQuantity || 1,
      unit: 'Paket',
      freq: numericFreq || 1,
      period: period.trim() || 'hari',
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
      title={editItem ? 'Edit Item Estimasi Quotation' : 'Tambah Item Penawaran Quotation'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Pekerjaan / Layanan <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="misal: Multi-Camera Live Streaming & Switcher System"
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
            Detail Spesifikasi Teknis
          </label>
          <textarea
            rows={2}
            value={detailDescription}
            onChange={(e) => setDetailDescription(e.target.value)}
            placeholder="Kamera Sony FX3 3 unit, Blackmagic ATEM Mini Extreme..."
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frekuensi / Hari
            </label>
            <Input
              type="number"
              value={freq}
              onChange={(e) => {
                const val = e.target.value;
                setFreq(val === '' ? '' : Number(val));
              }}
              min={1}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan Periode
            </label>
            <Input
              placeholder="hari / event / sesi"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Subtotal Estimasi:</span>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(calculatedTotal)}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {editItem ? 'Simpan Perubahan' : 'Tambah ke Quotation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddQuotationItemModal;
