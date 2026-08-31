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

  // Synchronous state updates on prop changes (React 19 / Next 16 clean pattern)
  const [prevEditItem, setPrevEditItem] = useState<ProjectCostItem | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
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
    if (!description.trim()) return;

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

  const isEditing = !!editItem;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Item Invoice' : 'Tambah Item Invoice'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Item Tagihan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Item Tagihan <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="misal: Full Production Package / Termin 1 DP"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Sub-label / Subtitle Item */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sub-judul / Label Event (Opsional)
          </label>
          <Input
            placeholder="misal: Event Telkomsel"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
          />
        </div>

        {/* Deskripsi Pekerjaan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Pekerjaan
          </label>
          <Input
            placeholder="misal: Event Telkomsel Malang"
            value={detailDescription}
            onChange={(e) => setDetailDescription(e.target.value)}
          />
        </div>

        {/* Harga Satuan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Harga Satuan (Rp) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="misal: 2000000"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value ? Number(e.target.value) : '')}
            required
            min={0}
          />
        </div>

        {/* Grid: Jumlah & Freq & Periode */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Freq
            </label>
            <Input
              type="number"
              value={freq}
              onChange={(e) => setFreq(e.target.value ? Number(e.target.value) : '')}
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Periode
            </label>
            <Input
              placeholder="misal: 1 / hari"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>

        {/* Calculated Sub Total Box */}
        <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Sub Total Invoice:</span>
          <span className="text-sm font-extrabold text-accent">
            Rp {calculatedTotal.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isEditing ? 'Simpan Perubahan' : 'Tambah Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddInvoiceItemModal;
