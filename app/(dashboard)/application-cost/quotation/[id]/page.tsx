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

export default function QuotationApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [item, setItem] = useState<ApplicationCostItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

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
    handleStatusUpdate('Approved', `Dokumen Quotation (${item?.projectName ?? ''}) berhasil disetujui!`, 'success');

  const handleRevise = () =>
    handleStatusUpdate('Revise', `Dokumen Quotation (${item?.projectName ?? ''}) diminta untuk direvisi.`, 'info');

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
  const grandTotal = subTotal - (subTotal * discountPercent) / 100 + pph;
  const bankAccounts = item.bankAccounts ?? [];

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
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {item.mainClient || '-'}
            </h2>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Event / Project</span>
                <span className="col-span-7 font-bold text-slate-800">{item.projectName}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Venue / Kota</span>
                <span className="col-span-7 font-bold text-slate-800">{item.venue || '-'}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Tanggal Event</span>
                <span className="col-span-7 font-bold text-slate-800">
                  {item.eventDateShort || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: INFORMASI KLIEN */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              INFORMASI KLIEN
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {profile?.name || '-'}
            </h2>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Company Name</span>
                <span className="col-span-7 font-bold text-slate-800">{item.mainClient || '-'}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Contact Person</span>
                <span className="col-span-7 font-bold text-slate-800">{item.clientPIC || '-'}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Email</span>
                <span className="col-span-7 font-bold text-slate-800 truncate">
                  {item.clientEmail || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: DOCUMENT NO & CONTRACT AMOUNT */}
          <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-orange-500">{item.documentNumber || '-'}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Diterbitkan: {item.releaseDate || '-'}
              </p>
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
              {lineItems.map((lineItem) => (
                <tr
                  key={lineItem.id}
                  className="bg-white border-b border-slate-100/60 align-top"
                >
                  <td className="py-4 px-4 font-normal text-slate-800">{lineItem.itemName}</td>
                  <td className="py-4 px-4 text-slate-500 text-xs space-y-2">
                    {lineItem.descriptions?.map((description, index) => (
                      <p
                        key={description}
                        className={index === 0 ? 'text-slate-600 mt-6' : 'text-slate-600'}
                      >
                        {description}
                      </p>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-center font-normal text-slate-700 whitespace-nowrap">
                    {formatRupiahWithSpace(lineItem.unitPrice)}
                  </td>
                  <td className="py-4 px-4 text-center font-normal text-slate-700">
                    {lineItem.quantity}
                  </td>
                  <td className="py-4 px-4 text-center font-normal text-slate-700">{lineItem.freq}</td>
                  <td className="py-4 px-4 text-center font-normal text-slate-700">
                    {lineItem.period}
                  </td>
                  <td className="py-4 px-4 text-center font-normal text-slate-800 whitespace-nowrap">
                    {formatRupiahWithSpace(lineItem.subTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="space-y-3 pb-4 border-b border-slate-200/80">
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>Sub Total</span>
            <span className="font-bold text-slate-800">{formatRupiahWithSpace(subTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>Diskon</span>
            <span className="font-bold text-slate-800">{discountPercent}%</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
            <span>PPH</span>
            <span className="font-bold text-slate-800">{formatRupiahWithSpace(pph)}</span>
          </div>
        </div>

        {/* Highlighted Orange Grand Total Box */}
        <div className="bg-orange-50/70 border border-orange-100/80 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm sm:text-base font-bold text-orange-600">Grand Total</span>
          <span className="text-base sm:text-lg font-extrabold text-orange-600">
            {formatRupiahWithSpace(grandTotal)}
          </span>
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
            <li>
              Kesepakatan nilai kontrak dapat dikomunikasikan dengan pihak {profile?.name || '-'}
            </li>
          </ol>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase">SISTEM PEMBAYARAN</h4>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-600 space-y-1">
            <li>
              Demi kelancaran produksi, kami mewajibkan <strong className="font-bold text-slate-800">Deposit / Down Payment (DP)</strong> sesuai kesepakatan dengan PIC {profile?.name || '-'} dengan due date <strong className="font-bold text-slate-800">H-1 sebelum event</strong>
            </li>
            <li>
              Pembayaran / pelunasan <strong className="font-bold text-slate-800">14 hari kalender</strong> sejak invoice kami kirim (invoice kami kirim setelah seluruh pekerjaan selesai kami lakukan)
            </li>
            <li>Segala hal yang berkaitan dengan term & condition tambahan dapat didiskusikan lebih lanjut dengan PIC {profile?.name || '-'}</li>
          </ol>
        </div>
      </div>

      {/* Bank Accounts Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-1 shadow-2xs"
          >
            <span className="text-xs font-semibold text-blue-500 block">{account.bankName}</span>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              a/n <span className="font-bold text-slate-800">{account.accountHolder}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              No. Rekening: <span className="font-bold text-slate-700">{account.accountNumber}</span>
            </p>
          </div>
        ))}
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
                <p className="text-xs text-slate-400">{item.documentNumber || '-'}</p>
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
                  <h2 className="text-xl font-bold text-slate-900">{profile?.name || '-'}</h2>
                  <p className="text-xs text-slate-500">Quotation Document</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-500">{item.documentNumber || '-'}</p>
                  <p className="text-xs text-slate-400">Date: {item.releaseDate || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-700">Project: {item.projectName}</p>
                  <p className="text-slate-500">Location: {item.venue || '-'}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Client: {item.mainClient || '-'}</p>
                  <p className="text-slate-500">Email: {item.clientEmail || '-'}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center font-bold text-sm">
                <span>Total Value:</span>
                <span className="text-blue-600 text-lg">{formatRupiahWithSpace(grandTotal)}</span>
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
