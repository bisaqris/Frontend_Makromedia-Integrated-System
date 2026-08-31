'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PaymentHistoryItem } from '@/types/project';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PaymentHistoryItem, 'id'>) => void;
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

  if (isOpen !== prevIsOpen || editItem !== prevEditItem) {
    setPrevIsOpen(isOpen);
    setPrevEditItem(editItem);
    if (isOpen) {
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

  const handleSubmit = () => {
    if (!date || !amount) return;
    onSave({
      date,
      amount: Number(amount) || 0,
      paymentMethod,
      toAccount,
      fromAccount,
      notes,
    });
    onClose();
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
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Nominal (Rp)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          label="Metode Pembayaran"
          placeholder="Bank Transfer"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ke Rekening"
            placeholder="BCA 123... (Makromedia)"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
          />
          <Input
            label="Dari Rekening"
            placeholder="Mandiri 888... (Client)"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
          />
        </div>
        <Input
          label="Catatan / Berita"
          placeholder="misal: DP 70%"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Simpan
        </Button>
      </div>
    </Modal>
  );
};

export default AddPaymentModal;
