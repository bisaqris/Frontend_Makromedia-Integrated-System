'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { applicationCostService } from '@/lib/services/applicationCostService';
import { ApplicationCostItem, ApplicationCostStatus } from '@/types/application-cost';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

export default function ProductionCostDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [item, setItem] = useState<ApplicationCostItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    applicationCostService
      .getById(id)
      .then((record) => {
        if (!isMounted) return;
        setItem(record);
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
    handleStatusUpdate('Approved', `Pengajuan Biaya Produksi (${item?.projectName ?? ''}) berhasil disetujui!`, 'success');

  const handleRevise = () =>
    handleStatusUpdate('Revise', `Pengajuan Biaya Produksi (${item?.projectName ?? ''}) diminta untuk direvisi.`, 'info');

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
  const estimateCostVal = item.estimateCost ?? 0;
  const costPercentVal = item.costPercent ?? 0;
  const estimateProfitVal = item.estimateProfit ?? 0;
  const profitMarginVal = item.profitMargin ?? 0;

  const categories = item.categories ?? [];

  return (
    <div className="space-y-6 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Nama Project Officer</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.projectOfficer || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Venue / Lokasi</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.venue || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Nama Project / Event</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.projectName || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Tanggal Pelaksanaan</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.eventDate || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Nama Klien Utama</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.mainClient || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Nama EO / Instansi</span>
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {item.eoInstance || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3.5 shadow-2xs">
          {/* Baris 1: 2 Cards Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Contract Value</span>
              <p className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatRupiahWithSpace(contractVal)}
              </p>
            </div>

            <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Estimate Production Cost</span>
              <p className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatRupiahWithSpace(estimateCostVal)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Presentase: {costPercentVal}%</p>
            </div>
          </div>

          {/* Baris 2: 1 Card Full Width */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Estimasi Keuntungan Projek</span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">
              {formatRupiahWithSpace(estimateProfitVal)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Margin: {profitMarginVal}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 font-semibold text-slate-600 text-left">Nama Item / Jenis Pekerjaan</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-left">Nama Pelaksana / Toko</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Harga Satuan</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Jumlah</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Freq</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Periode</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Sub Total</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-slate-700">
              {categories.map((cat) => (
                <React.Fragment key={cat.number}>
                  {/* Group Header Title */}
                  <tr className="border-b border-slate-100 bg-white">
                    <td colSpan={7} className="py-4 px-4 font-bold text-blue-600 text-xs sm:text-sm">
                      {cat.number}. {cat.categoryName}
                    </td>
                  </tr>

                  {/* Items list inside group */}
                  {cat.items.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-slate-50/50 transition-colors border-b border-slate-50"
                    >
                      <td className="py-4 px-4 text-slate-700 font-normal">{item.itemName}</td>
                      <td className="py-4 px-4 text-slate-700 font-normal">{item.executorName}</td>
                      <td className="py-4 px-4 text-center text-slate-700 font-normal whitespace-nowrap">
                        {formatRupiahWithSpace(item.unitPrice)}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700 font-normal whitespace-nowrap">
                        {item.quantity} {item.unitLabel}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700 font-normal whitespace-nowrap">
                        {item.freq} {item.freqUnitLabel}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700 font-normal whitespace-nowrap">
                        {item.period}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-800 font-normal whitespace-nowrap">
                        {formatRupiahWithSpace(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex justify-end gap-12 text-xs font-semibold text-slate-700 pb-2 border-b border-slate-200">
            <span className="w-24 text-right">Presentase</span>
            <span className="w-36 text-right">Total</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm font-bold text-accent">Total Biaya Project:</span>
            <div className="flex gap-12">
              <span className="w-24 text-right text-sm font-bold text-accent">{costPercentVal}%</span>
              <span className="w-36 text-right text-sm font-bold text-accent">
                {formatRupiahWithSpace(estimateCostVal)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-bold text-accent">Total Profit:</span>
            <div className="flex gap-12">
              <span className="w-24 text-right text-sm font-bold text-accent">{profitMarginVal}%</span>
              <span className="w-36 text-right text-sm font-bold text-accent">
                {formatRupiahWithSpace(estimateProfitVal)}
              </span>
            </div>
          </div>
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

      {/* Action Buttons Row (Cancel, Revise, Approve) WITHOUT Preview Button */}
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
            className="min-w-[130px] sm:min-w-[150px] px-8 bg-primary text-white font-semibold rounded-xl"
            onClick={handleApprove}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
