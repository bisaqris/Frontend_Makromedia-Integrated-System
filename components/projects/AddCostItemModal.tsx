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
  onSave: (item: Omit<ProjectCostItem, 'id' | 'projectId'>) => void | Promise<void>;
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/sync form values when modal opens or editItem changes during render
  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
      setErrors({});
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

  const handleSubmit = async () => {
    const finalCategory = category === NEW_CATEGORY_VALUE ? customCategory.trim() : category.trim();
    const newErrors: Record<string, string> = {};

    if (!finalCategory) {
      newErrors.category = 'Kategori wajib dipilih atau diisi.';
    }
    if (!description.trim()) {
      newErrors.description = 'Deskripsi item biaya wajib diisi.';
    }
    if (unitCost === '' || Number(unitCost) < 0) {
      newErrors.unitCost = 'Biaya satuan tidak boleh negatif.';
    }
    if (Number(quantity) <= 0) {
      newErrors.quantity = 'Jumlah minimal 1.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        category: finalCategory,
        description: description.trim(),
        executor: executor.trim(),
        unitCost: Number(unitCost) || 0,
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        freq: Number(freq) || 1,
        period: period.trim(),
        totalCost: subTotal,
      });
      onClose();
    } catch {
      // The caller reports the API error; keep the entered values available for retry.
    }
  };

  const modalTitle = editItem ? 'Edit Item Production Cost' : 'Tambah Item Production Cost';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="md">
      <div className="space-y-4">
        <Select
          label="Kategori"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setErrors((prev) => ({ ...prev, category: '' }));
          }}
          options={categoryOptions}
          error={errors.category}
        />
        {category === NEW_CATEGORY_VALUE && (
          <Input
            label="Nama Kategori Baru"
            placeholder="misal: Konsumsi"
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.target.value);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            error={errors.category}
            required
          />
        )}
        <Input
          label="Deskripsi"
          placeholder="misal: Rental Sound System 5000W"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => ({ ...prev, description: '' }));
          }}
          error={errors.description}
          required
        />
        <Input
          label="Pelaksana / Vendor"
          placeholder="misal: Vendor Audio Malang"
          value={executor}
          onChange={(e) => setExecutor(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Biaya Satuan (Rp)"
            type="number"
            value={unitCost}
            onChange={(e) => {
              setUnitCost(e.target.value);
              setErrors((prev) => ({ ...prev, unitCost: '' }));
            }}
            error={errors.unitCost}
            required
            min={0}
          />
          <Input
            label="Jumlah (Qty)"
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            error={errors.quantity}
            required
            min={1}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Satuan"
            placeholder="unit / hari / pax"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <Input
            label="Frekuensi"
            type="number"
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
            min={1}
          />
          <Input
            label="Periode"
            placeholder="hari / event"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Subtotal Estimasi:</span>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(subTotal)}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editItem ? 'Simpan Perubahan' : 'Tambah Item'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCostItemModal;
