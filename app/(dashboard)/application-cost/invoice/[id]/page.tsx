'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { applicationCostService } from '@/lib/services/applicationCostService';
import { companyService } from '@/lib/services/companyService';
import {
  ApplicationCostItem,
  ApplicationCostStatus,
  CompanyProfile,
} from '@/types/application-cost';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [item, setItem] = useState<ApplicationCostItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([applicationCostService.getById(id), companyService.getProfile()])
      .then(([record, companyProfile]) => {
        if (!isMounted) return;
        setItem(record);
        setProfile(companyProfile);
        setNotes(record?.notes || '');
      })
      .catch(() => {
        if (isMounted) setItem(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (
    status: ApplicationCostStatus,
    message: string,
    tone: 'success' | 'info'
  ) => {
    try {
      await applicationCostService.update(id, { status, notes });
      showToast[tone](message);
      router.push('/application-cost');
    } catch {
      showToast.error('Gagal memperbarui status pengajuan.');
    }
  };

  const handleApprove = () =>
    handleStatusUpdate('Approved', `Invoice (${item?.projectName ?? ''}) berhasil disetujui!`, 'success');

  const handleRevise = () =>
    handleStatusUpdate('Revise', `Invoice (${item?.projectName ?? ''}) diminta untuk direvisi.`, 'info');

  const handlePreview = () => {
    router.push(`/application-cost/invoice/${id}/preview`);
  };

  const handleCancel = () => {
    router.push('/application-cost');
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading data...</div>;

  if (!item) {
    return (
      <div className="space-y-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs text-center text-slate-500">
          Data application cost dengan ID &quot;{id}&quot; tidak ditemukan.
        </div>
        <div className="flex items-center justify-start">
          <Button type="button" variant="outline" size="md" onClick={handleCancel}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const contractVal = item.contractValue ?? 0;
  const lineItems = item.lineItems ?? [];
  const subTotal = lineItems.reduce((sum, lineItem) => sum + lineItem.subTotal, 0);
  const discountPercent = item.discountPercent ?? 0;
  const pph = item.pph ?? 0;
  const previousPayment = item.previousPayment ?? 0;
  const invoiceAmount = contractVal;
  const bankAccounts = item.bankAccounts ?? [];

  return (
    <div className="space-y-6 pb-16">
      {/* Card 1: Top 3-Column Info (Bill To, Bill From, Invoice No.) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Column 1: Bill To */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              Bill To
            </span>
            <h3 className="text-base font-bold text-slate-800">{item.mainClient || '-'}</h3>
            <p className="text-xs font-bold text-[#0066ff]">{item.clientPIC || '-'}</p>
            <p className="text-xs text-slate-500 font-normal">{item.clientAddress || '-'}</p>
            <p className="text-xs text-slate-500 font-normal">{item.clientEmail || '-'}</p>
          </div>

          {/* Column 2: Bill From */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              Bill From
            </span>
            <h3 className="text-base font-bold text-slate-800">{profile?.name || '-'}</h3>
            <p className="text-xs font-bold text-[#0066ff]">{item.projectOfficer || '-'}</p>
            <p className="text-xs text-slate-500 font-normal">{profile?.address || '-'}</p>
            <p className="text-xs text-slate-500 font-normal">{profile?.email || '-'}</p>
          </div>

          {/* Column 3: Invoice No. & Dates (vertical stacked layout) */}
          <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">
                Invoice No.
              </span>
              <p className="text-sm sm:text-base font-bold text-[#f97316]">
                {item.documentNumber || '-'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block mb-0.5">Release date</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{item.releaseDate || '-'}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block mb-0.5">Due date</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{item.dueDate || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Middle 3-Column Project Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Event / Project</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">{item.projectName}</p>
          </div>
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Venue / Kota</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">{item.venue || '-'}</p>
          </div>
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Tanggal Pelaksanaan</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">
              {item.eventDateLong || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Metric Cards Row (3 Cards) wrapped in container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CONTRACT AMOUNT */}
          <div className="bg-[#0066ff] rounded-xl p-6 text-white space-y-1 shadow-2xs">
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider block">
              CONTRACT AMOUNT
            </span>
            <p className="text-2xl font-bold text-white">{formatRupiahWithSpace(contractVal)}</p>
            <p className="text-xs text-white/80 font-normal mt-1">Nilai kontrak total</p>
          </div>

          {/* Card 2: PREVIOUS PAYMENT */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              PREVIOUS PAYMENT
            </span>
            <p className="text-2xl font-bold text-slate-800">
              {formatRupiahWithSpace(previousPayment)}
            </p>
            <p className="text-xs text-slate-400 font-normal mt-1">Sudah dibayarkan</p>
          </div>

          {/* Card 3: INVOICE PERIODE INI */}
          <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-6 space-y-1 shadow-2xs">
            <span className="text-xs font-semibold text-[#f97316] uppercase tracking-wider block">
              INVOICE PERIODE INI
            </span>
            <p className="text-2xl font-bold text-[#f97316]">{formatRupiahWithSpace(invoiceAmount)}</p>
            <p className="text-xs text-orange-400 font-normal mt-1">
              {item.paymentTermLabel || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: RINCIAN PEKERJAAN Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold text-[#0066ff] tracking-wider uppercase">
          RINCIAN PEKERJAAN
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Item / Jenis Pekerjaan</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4 text-center">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4 text-center">Freq</th>
                <th className="py-3 px-4 text-center">Periode</th>
                <th className="py-3 px-4 text-center">Sub Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((lineItem) => (
                <tr key={lineItem.id} className="align-top">
                  <td className="py-4 px-4 font-normal text-slate-800">
                    {lineItem.itemName}
                    {lineItem.categoryName && (
                      <span className="block text-xs text-slate-400 font-normal">
                        {lineItem.categoryName}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {lineItem.descriptions?.map((description) => (
                      <span key={description} className="block">
                        {description}
                      </span>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {formatRupiahWithSpace(lineItem.unitPrice)}
                  </td>
                  <td className="py-4 px-4 text-center">{lineItem.quantity}</td>
                  <td className="py-4 px-4 text-center">{lineItem.freq}</td>
                  <td className="py-4 px-4 text-center">{lineItem.period}</td>
                  <td className="py-4 px-4 text-center font-normal whitespace-nowrap">
                    {formatRupiahWithSpace(lineItem.subTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 5: Totals Section Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Sub Total</span>
            <span className="font-bold text-slate-800">{formatRupiahWithSpace(subTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Diskon</span>
            <span className="font-bold text-slate-800">{discountPercent}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>PPH</span>
            <span className="font-bold text-slate-800">{formatRupiahWithSpace(pph)}</span>
          </div>

          <div className="border-b border-slate-200 pt-1" />

          <div className="flex justify-between items-center text-slate-800 font-bold pt-1">
            <span>Contract Amount</span>
            <span>{formatRupiahWithSpace(contractVal)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 font-medium">
            <span>Previous Payment</span>
            <span>- {formatRupiahWithSpace(previousPayment)}</span>
          </div>
        </div>

        {/* Highlighted Light Orange Box */}
        <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-4 sm:p-5 flex justify-between items-center">
          <div>
            <span className="text-sm sm:text-base font-bold text-[#f97316] block">
              Invoice Amount
            </span>
            <span className="text-xs text-orange-400 font-normal">For This Period</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-[#f97316]">
            {formatRupiahWithSpace(invoiceAmount)}
          </span>
        </div>
      </div>

      {/* Card 6: TERM OF CONDITION Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-3 shadow-2xs text-xs sm:text-sm">
        <h4 className="font-bold text-[#0066ff] tracking-wider uppercase text-xs">
          TERM OF CONDITION
        </h4>
        <div className="text-slate-600 space-y-2 leading-relaxed">
          <p>
            Invoice ini adalah <strong className="font-bold text-slate-800">Proforma Invoice</strong>{' '}
            atau pengajuan DP (Payment Term 1) senilai{' '}
            <strong className="font-bold text-slate-800">... % dari nilai kontrak</strong> sementara.
            Apabila terdapat perubahan nilai kontrak saat event selesai, akan dikondisikan selanjutnya.
          </p>
          <p>
            Pengajuan Term 1 senilai ... % sudah sesuai kesepakatan antara ... dengan{' '}
            <strong className="font-bold text-slate-800">{profile?.name || '-'}</strong>. Pembayaran dapat
            dilakukan secara transfer ke rekening yang tertera dibawah.
          </p>
        </div>
      </div>

      {/* Card 7: Bank Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-2xs"
          >
            <span className="text-xs font-semibold text-[#0066ff] block">{account.bankName}</span>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              a/n <span className="font-bold text-slate-800">{account.accountHolder}</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              No. Rekening: <span className="font-bold text-slate-700">{account.accountNumber}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Card 8: Notes Textarea Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-2 shadow-2xs">
        <label htmlFor="invoice-notes" className="text-xs font-medium text-slate-500 block">
          Notes
        </label>
        <textarea
          id="invoice-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes approval..."
          className="w-full min-h-[100px] bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors resize-y"
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="min-w-[130px] sm:min-w-[150px] px-8 border-slate-300 text-slate-700 font-semibold rounded-xl"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="min-w-[130px] sm:min-w-[150px] px-8 border-orange-300 text-[#f97316] hover:bg-orange-50 font-semibold rounded-xl"
            onClick={handleRevise}
          >
            Revise
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Printer className="w-4 h-4" />}
            className="min-w-[130px] sm:min-w-[150px] px-8 bg-[#0066ff] hover:bg-blue-700 text-white font-semibold rounded-xl"
            onClick={handlePreview}
          >
            Preview
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="min-w-[130px] sm:min-w-[150px] px-8 bg-[#0066ff] hover:bg-blue-700 text-white font-semibold rounded-xl"
            onClick={handleApprove}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
