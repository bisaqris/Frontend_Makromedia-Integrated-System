'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ProjectCostItem } from '@/types/project';

interface AddCostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProjectCostItem, 'id' | 'projectId'>) => void;
  existingCategories: string[];
  editItem?: ProjectCostItem;
}

const NEW_CATEGORY_VALUE = '__new__';

export const AddCostItemModal: React.FC<AddCostItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCategories,
  editItem,
}) => {
  const [prevEditItem, setPrevEditItem] = useState<ProjectCostItem | undefined>(editItem);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  const [category, setCategory] = useState(editItem ? editItem.category || '' : existingCategories[0] || '');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState(editItem ? editItem.description || '' : '');
  const [executor, setExecutor] = useState(editItem ? editItem.executor || '' : '');
  const [unitCost, setUnitCost] = useState(editItem && editItem.unitCost !== undefined ? String(editItem.unitCost) : '');
  const [quantity, setQuantity] = useState(editItem && editItem.quantity !== undefined ? String(editItem.quantity) : '1');
  const [unit, setUnit] = useState(editItem ? editItem.unit || '' : '');
  const [freq, setFreq] = useState(editItem && editItem.freq !== undefined ? String(editItem.freq) : '1');
  const [period, setPeriod] = useState(editItem ? editItem.period || '' : '');

  // Reset/sync form values when modal opens or editItem changes during render
  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
      if (editItem) {
        setCategory(editItem.category || '');
        setCustomCategory('');
        setDescription(editItem.description || '');
        setExecutor(editItem.executor || '');
        setUnitCost(editItem.unitCost !== undefined ? String(editItem.unitCost) : '');
        setQuantity(editItem.quantity !== undefined ? String(editItem.quantity) : '1');
        setUnit(editItem.unit || '');
        setFreq(editItem.freq !== undefined ? String(editItem.freq) : '1');
        setPeriod(editItem.period || '');
      } else {
        setCategory(existingCategories[0] || '');
        setCustomCategory('');
        setDescription('');
        setExecutor('');
        setUnitCost('');
        setQuantity('1');
        setUnit('');
        setFreq('1');
        setPeriod('');
      }
    }
  }

  const categoryOptions = useMemo(
    () => [
      ...existingCategories.map((c) => ({ value: c, label: c })),
      { value: NEW_CATEGORY_VALUE, label: '+ Kategori Baru...' },
    ],
    [existingCategories]
  );

  const subTotal = (Number(unitCost) || 0) * (Number(quantity) || 0) * (Number(freq) || 1);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = () => {
    const finalCategory = category === NEW_CATEGORY_VALUE ? customCategory : category;
    if (!finalCategory || !description) return;
    onSave({
      category: finalCategory,
      description,
      executor,
      unitCost: Number(unitCost) || 0,
      quantity: Number(quantity) || 0,
      unit,
      freq: Number(freq) || 1,
      period,
      totalCost: subTotal,
    });
    onClose();
  };

  const modalTitle = editItem ? 'Edit Item Production Cost' : 'Tambah Item Production Cost';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="md">
      <div className="space-y-4">
        <Select
          label="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />
        {category === NEW_CATEGORY_VALUE && (
          <Input
            label="Nama Kategori Baru"
            placeholder="misal: Konsumsi"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}
        <Input
          label="Nama Item / Jenis Pekerjaan"
          placeholder="misal: Honor Kameramen"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          label="Nama Pelaksana / Toko"
          placeholder="misal: Rian Hidayat"
          value={executor}
          onChange={(e) => setExecutor(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Harga Satuan (Rp)"
            type="number"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Jumlah"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              label="Satuan"
              placeholder="Orang/Set"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Freq"
            type="number"
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
          />
          <Input
            label="Periode"
            placeholder="Event/Package"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sub Total</span>
          <span className="text-sm font-bold text-slate-900">{formatRupiah(subTotal)}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button variant="primary" onClick={handleSubmit}>Simpan</Button>
      </div>
    </Modal>
  );
};

export default AddCostItemModal;
