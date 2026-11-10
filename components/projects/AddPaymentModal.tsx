'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PaymentHistoryItem } from '@/types/project';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PaymentHistoryItem, 'id'>) => void | Promise<void>;
  editItem?: PaymentHistoryItem;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [prevEditItem, setPrevEditItem] = useState<PaymentHistoryItem | undefined>(editItem);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  const [date, setDate] = useState(editItem ? editItem.date : '');
  const [amount, setAmount] = useState(editItem ? String(editItem.amount) : '');
  const [paymentMethod, setPaymentMethod] = useState(editItem ? editItem.paymentMethod : '');
  const [toAccount, setToAccount] = useState(editItem ? editItem.toAccount : '');
  const [fromAccount, setFromAccount] = useState(editItem ? editItem.fromAccount : '');
  const [notes, setNotes] = useState(editItem ? editItem.notes : '');

  const [dateError, setDateError] = useState('');
  const [amountError, setAmountError] = useState('');

  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
      setDateError('');
      setAmountError('');
      if (editItem) {
        setDate(editItem.date || '');
        setAmount(editItem.amount !== undefined ? String(editItem.amount) : '');
        setPaymentMethod(editItem.paymentMethod || '');
        setToAccount(editItem.toAccount || '');
        setFromAccount(editItem.fromAccount || '');
        setNotes(editItem.notes || '');
      } else {
        setDate('');
        setAmount('');
        setPaymentMethod('');
        setToAccount('');
        setFromAccount('');
        setNotes('');
      }
    }
  }

  const handleSubmit = async () => {
    let hasError = false;
    if (!date) {
      setDateError('Tanggal pembayaran wajib dipilih.');
      hasError = true;
    }
    if (!amount || Number(amount) <= 0) {
      setAmountError('Nominal pembayaran harus lebih besar dari 0.');
      hasError = true;
    }

    if (hasError) return;

    try {
      await onSave({
        date,
        amount: Number(amount) || 0,
        paymentMethod,
        toAccount,
        fromAccount,
        notes,
      });
      onClose();
    } catch {
      // The caller reports the API error; keep the entered values available for retry.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Pembayaran' : 'Catat Pembayaran'}
      maxWidth="md"
    >
      <div className="space-y-4">
        <Input
          label="Tanggal"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (dateError) setDateError('');
          }}
          error={dateError}
          required
        />
        <Input
          label="Nominal (Rp)"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (amountError) setAmountError('');
          }}
          error={amountError}
          required
          min={1}
        />
        <Input
          label="Metode Pembayaran"
          placeholder="Bank Transfer / Cash"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Rekening Pengirim"
            placeholder="BCA 123xxx - PT Client"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
          />
          <Input
            label="Rekening Penerima"
            placeholder="Mandiri 456xxx - Makromedia"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan (Termin 1 / DP 50%)..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editItem ? 'Simpan Perubahan' : 'Catat Pembayaran'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPaymentModal;
