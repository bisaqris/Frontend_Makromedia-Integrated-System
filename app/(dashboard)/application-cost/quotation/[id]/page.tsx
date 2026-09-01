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

export default function QuotationApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;
  const initialItem = mockApplicationCosts.find((item) => item.id === id) || mockApplicationCosts[1] || mockApplicationCosts[0];

  const [notes, setNotes] = useState<string>(initialItem.notes || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const handleApprove = () => {
    const targetIdx = mockApplicationCosts.findIndex((i) => i.id === initialItem.id);
    if (targetIdx !== -1) {
      mockApplicationCosts[targetIdx] = {
        ...mockApplicationCosts[targetIdx],
        status: 'Approved',
        notes,
      };
    }
    showToast.success(`Dokumen Quotation (${initialItem.projectName}) berhasil disetujui!`);
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
    showToast.info(`Dokumen Quotation (${initialItem.projectName}) diminta untuk direvisi.`);
    router.push('/application-cost');
  };

  const handleCancel = () => {
    router.push('/application-cost');
  };

  const contractVal = initialItem.contractValue || 2000000;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: INFORMASI PROJECT */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              INFORMASI PROJECT
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">82 PRO</h2>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Event / Project</span>
                <span className="col-span-7 font-bold text-slate-800">Telkomsel</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Venue / Kota</span>
                <span className="col-span-7 font-bold text-slate-800">Malang, Jawa Timur</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Tanggal Event</span>
                <span className="col-span-7 font-bold text-slate-800">02 / 11 / 2026</span>
              </div>
            </div>
          </div>

          {/* Column 2: INFORMASI KLIEN */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              INFORMASI KLIEN
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Makromedia Visual</h2>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Company Name</span>
                <span className="col-span-7 font-bold text-slate-800">Telkomsel</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Contact Person</span>
                <span className="col-span-7 font-bold text-slate-800">Malang, Jawa Timur</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Email</span>
                <span className="col-span-7 font-bold text-slate-800 truncate">bayu@82pro.co.id</span>
              </div>
            </div>
          </div>

          {/* Column 3: DOCUMENT NO & CONTRACT AMOUNT */}
          <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-orange-500">001/QUO.MAKROMEDIA/11/2026</p>
              <p className="text-xs text-slate-400 mt-0.5">Diterbitkan: 02 November 2026</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                CONTRACT AMOUNT
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600">
                {formatRupiahWithSpace(contractVal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card: RINCIAN PEKERJAAN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">RINCIAN PEKERJAAN</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Item / Jenis Pekerjaan</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Deskripsi</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-600">Harga Satuan</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-600">Jumlah</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-600">Freq</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-600">Periode</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-600">Sub Total</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-slate-700">
              {/* Row 1: Livecam */}
              <tr className="bg-white border-b border-slate-100/60 align-top">
                <td className="py-4 px-4 font-normal text-slate-800">Livecam</td>
                <td className="py-4 px-4 text-slate-500 text-xs space-y-2">
                  <p className="text-slate-600 mt-6">2 Kamera</p>
                  <p className="text-slate-600">Editing Livecam</p>
                  <p className="text-slate-600">Switcher</p>
                </td>
                <td className="py-4 px-4 text-center font-normal text-slate-700 whitespace-nowrap">
                  Rp 1.000.000
                </td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-800 whitespace-nowrap">
                  Rp 1.000.000
                </td>
              </tr>

              {/* Row 2: Foto Dokumentasi */}
              <tr className="bg-white border-b border-slate-100/60 align-top">
                <td className="py-4 px-4 font-normal text-slate-800">Foto Dokumentasi</td>
                <td className="py-4 px-4 text-slate-500 text-xs"></td>
                <td className="py-4 px-4 text-center font-normal text-slate-700 whitespace-nowrap">
                  Rp 1.000.000
                </td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-700">1</td>
                <td className="py-4 px-4 text-center font-normal text-slate-800 whitespace-nowrap">
                  Rp 1.000.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="space-y-3 pb-4 border-b border-slate-200/80">
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>Sub Total</span>
            <span className="font-bold text-slate-800">Rp 2.000.000</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>Diskon</span>
            <span className="font-bold text-slate-800">0%</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>PPH</span>
            <span className="font-bold text-slate-800">Rp 0</span>
          </div>
        </div>

        {/* Highlighted Orange Grand Total Box */}
        <div className="bg-orange-50/70 border border-orange-100/80 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm sm:text-base font-bold text-orange-600">Grand Total</span>
          <span className="text-base sm:text-lg font-extrabold text-orange-600">Rp 2.000.000</span>
        </div>
      </div>

      {/* Term of Condition & Sistem Pembayaran Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-blue-600 tracking-wider uppercase">TERM OF CONDITION</h4>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-600 space-y-1">
            <li>
              Penawaran ini masih bersifat <strong className="font-bold text-slate-800">customize</strong>, dapat berubah sesuai kebutuhan selama project berlangsung
            </li>
            <li>Kesepakatan nilai kontrak dapat dikomunikasikan dengan pihak Makromedia</li>
          </ol>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase">SISTEM PEMBAYARAN</h4>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-600 space-y-1">
            <li>
              Demi kelancaran produksi, kami mewajibkan <strong className="font-bold text-slate-800">Deposit / Down Payment (DP)</strong> sesuai kesepakatan dengan PIC Makromedia dengan due date <strong className="font-bold text-slate-800">H-1 sebelum event</strong>
            </li>
            <li>
              Pembayaran / pelunasan <strong className="font-bold text-slate-800">14 hari kalender</strong> sejak invoice kami kirim (invoice kami kirim setelah seluruh pekerjaan selesai kami lakukan)
            </li>
            <li>Segala hal yang berkaitan dengan term & condition tambahan dapat didiskusikan lebih lanjut dengan PIC Makromedia</li>
          </ol>
        </div>
      </div>

      {/* Bank Accounts Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bank BCA */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-blue-500 block">Bank Central Asia (BCA)</span>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            a/n <span className="font-bold text-slate-800">Agus Tjahjono, SPD</span>
          </p>
          <p className="text-xs text-slate-500 font-medium">
            No. Rekening: <span className="font-bold text-slate-700">011–3075–764</span>
          </p>
        </div>

        {/* Bank Mandiri */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-blue-500 block">Bank Mandiri</span>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            a/n <span className="font-bold text-slate-800">C.V Makromedia Visual</span>
          </p>
          <p className="text-xs text-slate-500 font-medium">
            No. Rekening: <span className="font-bold text-slate-700">144–000–010417–1</span>
          </p>
        </div>
      </div>

      {/* Notes Box Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-2 shadow-2xs">
        <label className="block text-xs font-semibold text-slate-700">Notes</label>
        <textarea
          rows={3}
          placeholder="Notes approval..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Action Buttons Row (Cancel, Revise, Preview, Approve) */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="min-w-[130px] sm:min-w-[150px] px-8 border-slate-300 text-slate-700 font-semibold rounded-xl"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="min-w-[130px] sm:min-w-[150px] px-8 border-orange-300 text-orange-500 hover:bg-orange-50 font-semibold rounded-xl"
            onClick={handleRevise}
          >
            Revise
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Printer className="w-4 h-4" />}
            className="min-w-[130px] sm:min-w-[150px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            onClick={() => router.push(`/application-cost/quotation/${id}/preview`)}
          >
            Preview
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="min-w-[130px] sm:min-w-[150px] px-8 bg-primary text-white font-semibold rounded-xl"
            onClick={handleApprove}
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Preview Document Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Preview Dokumen Quotation</h3>
                <p className="text-xs text-slate-400">001/QUO.MAKROMEDIA/11/2026</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Content */}
            <div className="border border-slate-200 rounded-xl p-6 space-y-6 bg-slate-50/50">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Makromedia Visual</h2>
                  <p className="text-xs text-slate-500">Quotation Document</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-500">001/QUO.MAKROMEDIA/11/2026</p>
                  <p className="text-xs text-slate-400">Date: 02/11/2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-700">Project: Telkomsel</p>
                  <p className="text-slate-500">Location: Malang, Jawa Timur</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Client: 82 PRO</p>
                  <p className="text-slate-500">Email: bayu@82pro.co.id</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center font-bold text-sm">
                <span>Total Value:</span>
                <span className="text-blue-600 text-lg">Rp 2.000.000</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Tutup Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
