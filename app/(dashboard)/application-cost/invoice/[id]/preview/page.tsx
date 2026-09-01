'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Printer, Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { mockApplicationCosts } from '@/lib/mock/application-cost.mock';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;
  const initialItem =
    mockApplicationCosts.find((item) => item.id === id) ||
    mockApplicationCosts[2] ||
    mockApplicationCosts[0];

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
      filename: `INV-2026.11.001-${initialItem.projectName || 'Invoice'}.pdf`,
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
      showToast.success('PDF Invoice berhasil diunduh!');
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  const handleCancel = () => {
    router.push('/application-cost');
  };

  const contractVal = initialItem.contractValue || 2000000;

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
          {/* Left: Document Title */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold">≡</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              INV-2026.11.001 – Telkomsel / 82 Pro
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

          {/* Right: Unduh & Cetak Buttons */}
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
            {/* Top Header Banner Image */}
            <div className="pdf-banner-top w-full rounded-none overflow-hidden mb-5">
              <img
                src="/images/application-cost/invoice-header-banner.png"
                alt="Makromedia Invoice Header Banner"
                className="w-full h-auto block object-contain"
              />
            </div>

            {/* Top Info Section Card (Bill To, Bill From, Invoice No.) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                {/* Column 1: Bill To */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
                    Bill To
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">82 PRO</h3>
                  <p className="text-xs font-bold text-[#0066ff]">Mr. Bayu</p>
                  <p className="text-xs text-slate-500 font-normal">
                    Jalan Sulfat No 10, Malang, Jawa Timur
                  </p>
                  <p className="text-xs text-slate-500 font-normal">bayu@82pro.co.id</p>
                </div>

                {/* Column 2: Bill From */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
                    Bill From
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">Makromedia Visual</h3>
                  <p className="text-xs font-bold text-[#0066ff]">Agus Tjahjono</p>
                  <p className="text-xs text-slate-500 font-normal">Malang, Jawa Timur</p>
                  <p className="text-xs text-slate-500 font-normal">makromedia@gmail.com</p>
                </div>

                {/* Column 3: Invoice No. & Dates (vertical stacked layout) */}
                <div className="md:col-span-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-0.5">
                      Invoice No.
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#f97316]">
                      001/INV.MAKROMEDIA/11/2026
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-0.5">Release date</span>
                    <p className="text-xs font-bold text-slate-800">02 November 2026</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-0.5">Due date</span>
                    <p className="text-xs font-bold text-slate-800">09 November 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle 3-Column Amount Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                    Contract Amount
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#0066ff]">
                    {formatRupiahWithSpace(contractVal)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                    Previous Payment
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#0066ff]">Rp0</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                    Invoice This Period
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#0066ff]">
                    {formatRupiahWithSpace(contractVal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Table: RINCIAN PEKERJAAN */}
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
                      <th className="py-2 px-3 text-center">Periode</th>
                      <th className="py-2 px-3 text-center">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="align-top">
                      <td className="py-2.5 px-3 font-normal text-slate-800">
                        Full Production Package
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Event Telkomsel
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Event Telkomsel Malang</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">Rp 2.000.000</td>
                      <td className="py-2.5 px-3 text-center">1</td>
                      <td className="py-2.5 px-3 text-center">1</td>
                      <td className="py-2.5 px-3 text-center">1</td>
                      <td className="py-2.5 px-3 text-center font-normal whitespace-nowrap">
                        Rp 2.000.000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="space-y-1.5 text-xs">
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

                <div className="flex justify-between items-center text-slate-800 font-bold pt-0.5">
                  <span>Contract Amount</span>
                  <span>Rp 2.000.000</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-medium">
                  <span>Previous Payment</span>
                  <span>- Rp 0</span>
                </div>
              </div>

              {/* Highlighted Light Orange Box */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-orange-600 block">
                    Invoice Amount
                  </span>
                  <span className="text-[11px] text-orange-400 font-normal">For This Period</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-orange-600">
                  Rp 2.000.000
                </span>
              </div>
            </div>

            {/* Term of Condition Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <h4 className="font-bold text-blue-600 tracking-wider uppercase text-[11px]">
                TERM OF CONDITION
              </h4>
              <div className="text-slate-600 space-y-1.5 leading-relaxed text-[11px]">
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

            {/* Bank Accounts Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-0.5">
                <span className="text-[11px] font-semibold text-blue-500 block">Bank Central Asia (BCA)</span>
                <p className="text-xs text-slate-500 font-normal">
                  a/n <span className="font-bold text-slate-800">Agus Tjahjono, SPD</span>
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  No. Rekening: <span className="font-bold text-slate-700">011–3075–764</span>
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-0.5">
                <span className="text-[11px] font-semibold text-blue-500 block">Bank Mandiri</span>
                <p className="text-xs text-slate-500 font-normal">
                  a/n <span className="font-bold text-slate-800">C.V Makromedia Visual</span>
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  No. Rekening: <span className="font-bold text-slate-700">144–000–010417–1</span>
                </p>
              </div>
            </div>

            {/* Signature & Social Footer Section matching screenshot 1:1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Left: Signature Box Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center space-y-2">
                {/* 1. Name at top */}
                <p className="font-bold text-slate-800 text-sm">Agus Tjahjono, SPD</p>

                {/* 2. Signature Graphic / Custom Signature Image (dynamic placeholder) */}
                <div className="h-14 flex items-center justify-center">
                  {initialItem.signatureUrl ? (
                    <img
                      src={initialItem.signatureUrl}
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

              {/* Right: Social Media Contacts Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 flex flex-col justify-end">
                <div className="inline-flex items-center gap-2 text-slate-700 font-medium justify-start w-full text-xs">
                  <svg className="w-4 h-4 text-slate-800 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>@makromedia.visual</span>
                </div>
                <div className="inline-flex items-center gap-2 text-slate-700 font-medium justify-start w-full text-xs">
                  <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Makromedia Visual Creative</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Banner Image */}
            <div className="pdf-banner-bottom w-full rounded-none overflow-hidden mt-2">
              <img
                src="/images/application-cost/quotation-footer-banner.png"
                alt="Makromedia Invoice Footer Banner"
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
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
