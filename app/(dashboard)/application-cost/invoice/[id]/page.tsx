'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { mockApplicationCosts } from '@/lib/mock/application-cost.mock';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;
  const initialItem =
    mockApplicationCosts.find((item) => item.id === id) ||
    mockApplicationCosts[2] ||
    mockApplicationCosts[0];

  const [notes, setNotes] = useState<string>(initialItem.notes || '');

  const handleApprove = () => {
    const targetIdx = mockApplicationCosts.findIndex((i) => i.id === initialItem.id);
    if (targetIdx !== -1) {
      mockApplicationCosts[targetIdx] = {
        ...mockApplicationCosts[targetIdx],
        status: 'Approved',
        notes,
      };
    }
    showToast.success(`Invoice (${initialItem.projectName}) berhasil disetujui!`);
    router.push('/application-cost');
  };

  const handleRevise = () => {
    const targetIdx = mockApplicationCosts.findIndex((i) => i.id === initialItem.id);
    if (targetIdx !== -1) {
      mockApplicationCosts[targetIdx] = {
        ...mockApplicationCosts[targetIdx],
        status: 'Revise',
        notes,
      };
    }
    showToast.info(`Invoice (${initialItem.projectName}) diminta untuk direvisi.`);
    router.push('/application-cost');
  };

  const handlePreview = () => {
    router.push(`/application-cost/invoice/${id}/preview`);
  };

  const handleCancel = () => {
    router.push('/application-cost');
  };

  const contractVal = initialItem.contractValue || 2000000;

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
            <h3 className="text-base font-bold text-slate-800">82 PRO</h3>
            <p className="text-xs font-bold text-[#0066ff]">Mr. Bayu</p>
            <p className="text-xs text-slate-500 font-normal">
              Jalan Sulfat No 10, Malang, Jawa Timur
            </p>
            <p className="text-xs text-slate-500 font-normal">bayu@82pro.co.id</p>
          </div>

          {/* Column 2: Bill From */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              Bill From
            </span>
            <h3 className="text-base font-bold text-slate-800">Makromedia Visual</h3>
            <p className="text-xs font-bold text-[#0066ff]">Agus Tjahjono</p>
            <p className="text-xs text-slate-500 font-normal">Malang, Jawa Timur</p>
            <p className="text-xs text-slate-500 font-normal">makromedia@gmail.com</p>
          </div>

          {/* Column 3: Invoice No. & Dates (vertical stacked layout) */}
          <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">
                Invoice No.
              </span>
              <p className="text-sm sm:text-base font-bold text-[#f97316]">
                001/INV.MAKROMEDIA/11/2026
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block mb-0.5">Release date</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">02 November 2026</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block mb-0.5">Due date</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">09 November 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Middle 3-Column Project Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Event / Project</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">Telkomsel</p>
          </div>
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Venue / Kota</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">Malang, Jawa Timur</p>
          </div>
          <div>
            <span className="text-sm font-bold text-[#0066ff] block mb-1">Tanggal Pelaksanaan</span>
            <p className="text-base sm:text-lg font-bold text-slate-800">Senin, 02 November 2026</p>
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
            <p className="text-2xl font-bold text-slate-800">Rp 0</p>
            <p className="text-xs text-slate-400 font-normal mt-1">Sudah dibayarkan</p>
          </div>

          {/* Card 3: INVOICE PERIODE INI */}
          <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-6 space-y-1 shadow-2xs">
            <span className="text-xs font-semibold text-[#f97316] uppercase tracking-wider block">
              INVOICE PERIODE INI
            </span>
            <p className="text-2xl font-bold text-[#f97316]">{formatRupiahWithSpace(contractVal)}</p>
            <p className="text-xs text-orange-400 font-normal mt-1">Payment Term 1</p>
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
              <tr className="align-top">
                <td className="py-4 px-4 font-normal text-slate-800">
                  Full Production Package
                  <span className="block text-xs text-slate-400 font-normal">Event Telkomsel</span>
                </td>
                <td className="py-4 px-4 text-slate-600">Event Telkomsel Malang</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Rp 2.000.000</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-center font-normal whitespace-nowrap">
                  Rp 2.000.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 5: Totals Section Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Sub Total</span>
            <span className="font-bold text-slate-800">Rp 2.000.000</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Diskon</span>
            <span className="font-bold text-slate-800">0%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>PPH</span>
            <span className="font-bold text-slate-800">Rp 0</span>
          </div>

          <div className="border-b border-slate-200 pt-1" />

          <div className="flex justify-between items-center text-slate-800 font-bold pt-1">
            <span>Contract Amount</span>
            <span>Rp 2.000.000</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 font-medium">
            <span>Previous Payment</span>
            <span>- Rp 0</span>
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
          <span className="text-lg sm:text-xl font-bold text-[#f97316]">Rp 2.000.000</span>
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
            <strong className="font-bold text-slate-800">Makromedia</strong>. Pembayaran dapat
            dilakukan secara transfer ke rekening yang tertera dibawah.
          </p>
        </div>
      </div>

      {/* Card 7: Bank Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-[#0066ff] block">Bank Central Asia (BCA)</span>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            a/n <span className="font-bold text-slate-800">Agus Tjahjono, SPD</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            No. Rekening: <span className="font-bold text-slate-700">011–3075–764</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-[#0066ff] block">Bank Mandiri</span>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            a/n <span className="font-bold text-slate-800">C.V Makromedia Visual</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            No. Rekening: <span className="font-bold text-slate-700">144–000–010417–1</span>
          </p>
        </div>
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
