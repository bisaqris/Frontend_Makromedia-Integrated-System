'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Printer, Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { applicationCostService } from '@/lib/services/applicationCostService';
import { companyService } from '@/lib/services/companyService';
import { ApplicationCostItem, CompanyProfile } from '@/types/application-cost';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

export default function QuotationPreviewPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [item, setItem] = useState<ApplicationCostItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([applicationCostService.getById(id), companyService.getProfile()])
      .then(([record, companyProfile]) => {
        if (!isMounted) return;
        setItem(record);
        setProfile(companyProfile);
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

  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(50, prev - 10));
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('pdf-preview-sheet');
    if (!element) return;

    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: `${(item?.documentNumber || 'Dokumen').replace(/[\\/]/g, '-')}-${item?.projectName || 'Quotation'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1024,
        onclone: (clonedDoc: Document) => {
          const sheet = clonedDoc.getElementById('pdf-preview-sheet');
          if (sheet) {
            sheet.style.boxShadow = 'none';
            const allEls = sheet.querySelectorAll('*');
            allEls.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.boxShadow = 'none';
              }
            });
          }
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
      showToast.success('PDF Quotation berhasil diunduh!');
    } catch {
      window.print();
    }
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
          <Button type="button" variant="outline" size="md" onClick={() => router.back()}>
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
      {/* Global CSS for Print / PDF Export */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }
        @media print {
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }
          aside,
          header,
          nav,
          footer,
          .print-hide,
          #react-hot-toast,
          [role='status'],
          [aria-live] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          html,
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .pdf-canvas-container {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            min-height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
          }
          .pdf-preview-sheet {
            transform: none !important;
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            background-color: white !important;
            overflow: visible !important;
          }
          .pdf-banner-top {
            margin: 0 0 1.25rem 0 !important;
            width: 100% !important;
            border-radius: 0 !important;
          }
          .pdf-banner-bottom {
            margin: 1rem 0 0 0 !important;
            width: 100% !important;
            border-radius: 0 !important;
          }
          tr,
          .bg-white,
          .rounded-xl,
          .rounded-2xl {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `,
        }}
      />

      {/* PDF Viewport Container */}
      <div className="space-y-0">
        {/* PDF Preview Toolbar Bar */}
        <div className="print-hide bg-white rounded-t-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs select-none">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold">≡</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {item.documentReference || '-'}
            </span>
          </div>

          {/* Center: Zoom Controls */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center">{zoomLevel}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl"
              onClick={handleDownload}
            >
              Unduh
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              onClick={handlePrint}
            >
              Cetak
            </Button>
          </div>
        </div>

        {/* Dark Grey PDF Canvas Container */}
        <div className="pdf-canvas-container bg-[#475569] p-6 sm:p-10 flex justify-center overflow-x-auto rounded-b-2xl border-x border-b border-slate-200 min-h-[850px]">
          {/* White A4 PDF Document Sheet (Web view: rounded sheet with paper padding & shadow) */}
          <div
            id="pdf-preview-sheet"
            className="pdf-preview-sheet bg-white w-full max-w-4xl shadow-2xl p-6 sm:p-8 space-y-4 text-slate-800 transition-transform duration-200 origin-top rounded-xl overflow-hidden"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className="pdf-banner-top w-full rounded-none overflow-hidden mb-3">
              <img
                src="/images/application-cost/quotation-header-banner.png"
                alt="Makromedia Quotation Header Banner"
                className="w-full h-auto block object-contain"
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                <div className="md:col-span-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
                    INFORMASI PROJECT
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">{item.mainClient || '-'}</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Event / Project</span>
                      <span className="font-bold text-slate-800">{item.projectName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Venue / Kota</span>
                      <span className="font-bold text-slate-800">{item.venue || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Tanggal Event</span>
                      <span className="font-bold text-slate-800">{item.eventDateShort || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
                    INFORMASI KLIEN
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">{profile?.name || '-'}</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Company Name</span>
                      <span className="font-bold text-slate-800">{item.mainClient || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Contact Person</span>
                      <span className="font-bold text-slate-800">{item.clientPIC || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Email</span>
                      <span className="font-bold text-slate-800 truncate">{item.clientEmail || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#f97316]">
                      {item.documentNumber || '-'}
                    </p>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Diterbitkan: <span className="font-bold text-slate-700">{item.releaseDate || '-'}</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      CONTRACT AMOUNT
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-[#0066ff]">
                      {formatRupiahWithSpace(contractVal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table 1: RINCIAN PEKERJAAN */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                RINCIAN PEKERJAAN
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">Item / Jenis Pekerjaan</th>
                      <th className="py-2 px-3">Deskripsi</th>
                      <th className="py-2 px-3 text-center">Harga Satuan</th>
                      <th className="py-2 px-3 text-center">Jumlah</th>
                      <th className="py-2 px-3 text-center">Freq</th>
                      <th className="py-2 px-3 text-center">Durasi</th>
                      <th className="py-2 px-3 text-center">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((lineItem) => (
                      <tr key={lineItem.id} className="align-top">
                        <td className="py-2.5 px-3 font-normal text-slate-800">
                          {lineItem.itemName}
                          {lineItem.categoryName && (
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {lineItem.categoryName}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {lineItem.descriptions?.map((description) => (
                            <span key={description} className="block">
                              {description}
                            </span>
                          ))}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {formatRupiahWithSpace(lineItem.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center">{lineItem.quantity}</td>
                        <td className="py-2.5 px-3 text-center">{lineItem.freq}</td>
                        <td className="py-2.5 px-3 text-center">{lineItem.period}</td>
                        <td className="py-2.5 px-3 text-center font-normal whitespace-nowrap">
                          {formatRupiahWithSpace(lineItem.subTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: RINCIAN PEKERJAAN (FULL PRODUCTION PACKAGE) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                RINCIAN PEKERJAAN
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">Item / Jenis Pekerjaan</th>
                      <th className="py-2 px-3">Deskripsi</th>
                      <th className="py-2 px-3 text-center">Harga Satuan</th>
                      <th className="py-2 px-3 text-center">Jumlah</th>
                      <th className="py-2 px-3 text-center">Freq</th>
                      <th className="py-2 px-3 text-center">Durasi</th>
                      <th className="py-2 px-3 text-center">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="align-top">
                      <td className="py-2.5 px-3 font-normal text-slate-800">
                        Full Production Package
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {item.projectName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.venue || '-'}</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {formatRupiahWithSpace(grandTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">1</td>
                      <td className="py-2.5 px-3 text-center">1</td>
                      <td className="py-2.5 px-3 text-center">{lineItems.length} item</td>
                      <td className="py-2.5 px-3 text-center font-normal whitespace-nowrap">
                        {formatRupiahWithSpace(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="space-y-1.5 border-b border-slate-200 pb-2.5 text-xs">
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
              </div>

              {/* Highlighted Orange Grand Total Box */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm font-bold text-orange-600">Grand Total</span>
                <span className="text-base font-extrabold text-orange-600">{formatRupiahWithSpace(grandTotal)}</span>
              </div>
            </div>

            {/* Term of Condition & Sistem Pembayaran Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-blue-600 tracking-wider uppercase text-[11px]">
                  TERM OF CONDITION
                </h4>
                <ol className="list-decimal list-inside text-slate-600 space-y-0.5">
                  <li>
                    Penawaran ini masih bersifat <strong className="font-bold text-slate-800">customize</strong>, dapat berubah sesuai kebutuhan selama project berlangsung
                  </li>
                  <li>
                    Kesepakatan nilai kontrak dapat dikomunikasikan dengan pihak {profile?.name || '-'}
                  </li>
                </ol>
              </div>

              <div className="space-y-1 pt-1">
                <h4 className="font-bold text-slate-800 tracking-wider uppercase text-[11px]">
                  SISTEM PEMBAYARAN
                </h4>
                <ol className="list-decimal list-inside text-slate-600 space-y-0.5">
                  <li>
                    Demi kelancaran produksi, kami mewajibkan <strong className="font-bold text-slate-800">Deposit / Down Payment (DP)</strong> sesuai kesepakatan dengan PIC {profile?.name || '-'} dengan due date <strong className="font-bold text-slate-800">H-1 sebelum event</strong>
                  </li>
                  <li>
                    Pembayaran / pelunasan <strong className="font-bold text-slate-800">14 hari kalender</strong> sejak invoice kami kirim (invoice kami kirim setelah seluruh pekerjaan selesai kami lakukan)
                  </li>
                  <li>
                    Segala hal yang berkaitan dengan term & condition tambahan dapat didiskusikan lebih
                    lanjut dengan PIC {profile?.name || '-'}
                  </li>
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-0.5"
                >
                  <span className="text-[11px] font-semibold text-blue-500 block">
                    {account.bankName}
                  </span>
                  <p className="text-xs text-slate-500 font-normal">
                    a/n <span className="font-bold text-slate-800">{account.accountHolder}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    No. Rekening: <span className="font-bold text-slate-700">{account.accountNumber}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center space-y-2">
                {/* 1. Name at top */}
                <p className="font-bold text-slate-800 text-sm">{item.projectOfficer || '-'}</p>

                {/* 2. Signature Graphic / Custom Signature Image (dynamic placeholder) */}
                <div className="h-14 flex items-center justify-center">
                  {item.signatureUrl ? (
                    <img
                      src={item.signatureUrl}
                      alt="Tanda Tangan Sales Manager"
                      className="max-h-12 w-auto object-contain"
                    />
                  ) : (
                    <svg className="w-24 h-10 text-slate-800 stroke-current fill-none" viewBox="0 0 100 40">
                      <path
                        d="M10,25 C25,5 35,35 45,15 C55,-5 65,30 85,20 C70,40 50,30 30,35"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* 3. Best Regard */}
                <p className="text-slate-700 font-medium text-xs">Best Regard</p>

                {/* 4. Horizontal Line between Best Regard and Sales Manager */}
                <div className="border-t border-slate-300 pt-1">
                  {/* 5. Sales Manager Title */}
                  <p className="font-bold text-slate-800 text-xs">Sales Manager</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 flex flex-col justify-end">
                <div className="inline-flex items-center gap-2 text-slate-700 font-medium justify-start w-full text-xs">
                  <svg className="w-4 h-4 text-slate-800 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>{profile?.instagram || '@makromedia.visual'}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-slate-700 font-medium justify-start w-full text-xs">
                  <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>{profile?.tagline || '-'}</span>
                </div>
              </div>
            </div>

            <div className="pdf-banner-bottom w-full rounded-none overflow-hidden mt-2">
              <img
                src="/images/application-cost/quotation-footer-banner.png"
                alt="Makromedia Quotation Footer Banner"
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="print-hide flex items-center justify-start pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="min-w-[130px] sm:min-w-[150px] px-8 border-slate-300 text-slate-700 font-semibold rounded-xl"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
