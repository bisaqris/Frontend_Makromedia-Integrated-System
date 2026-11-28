'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ProjectCostItem } from '@/types/project';
import { formatNominal } from '@/lib/utils';
import { costCategoryService } from '@/lib/services/costCategoryService';

interface AddCostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProjectCostItem, 'id' | 'projectId'>) => void | Promise<void>;
  existingCategories?: string[];
  editItem?: ProjectCostItem;
}

export const AddCostItemModal: React.FC<AddCostItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [masterCategories, setMasterCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      costCategoryService
        .getActiveNames()
        .then((names) => {
          setMasterCategories(names ?? []);
        })
        .catch(() => {
          setMasterCategories([]);
        });
    }
  }, [isOpen]);

  const availableCategories = useMemo(() => {
    const list = [...masterCategories];
    if (editItem?.category && !list.includes(editItem.category)) {
      list.unshift(editItem.category);
    }
    return list;
  }, [masterCategories, editItem]);

  const [prevEditItem, setPrevEditItem] = useState<ProjectCostItem | undefined>(editItem);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  const [category, setCategory] = useState(
    editItem ? editItem.category || '' : ''
  );
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
        setDescription(editItem.description || '');
        setExecutor(editItem.executor || '');
        setUnitCost(editItem.unitCost !== undefined ? String(editItem.unitCost) : '');
        setQuantity(editItem.quantity !== undefined ? String(editItem.quantity) : '1');
        setUnit(editItem.unit || '');
        setFreq(editItem.freq !== undefined ? String(editItem.freq) : '1');
        setPeriod(editItem.period || '');
      } else {
        setCategory('');
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

  // Once categories load, if creating a new item and category is empty, default to the first available category if exists
  useEffect(() => {
    if (isOpen && !editItem && !category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
  }, [isOpen, editItem, category, availableCategories]);

  const categoryOptions = useMemo(
    () => availableCategories.map((c) => ({ value: c, label: c })),
    [availableCategories]
  );

  const subTotal = (Number(unitCost) || 0) * (Number(quantity) || 0) * (Number(freq) || 1);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = async () => {
    const finalCategory = category.trim();
    const newErrors: Record<string, string> = {};

    if (!finalCategory) {
      newErrors.category = 'Kategori wajib dipilih.';
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
          placeholder={categoryOptions.length === 0 ? 'Belum ada kategori biaya' : 'Pilih kategori...'}
          options={categoryOptions}
          error={errors.category}
          helperText={
            categoryOptions.length === 0
              ? '*Belum ada kategori aktif. Silakan tambahkan kategori di menu Setting Category Cost terlebih dahulu.'
              : undefined
          }
        />
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
            type="text"
            placeholder="0"
            value={formatNominal(unitCost)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              setUnitCost(raw);
              setErrors((prev) => ({ ...prev, unitCost: '' }));
            }}
            error={errors.unitCost}
            required
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
