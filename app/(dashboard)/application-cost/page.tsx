'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { mockApplicationCosts } from '@/lib/mock/application-cost.mock';
import { ApplicationCostStatus } from '@/types/application-cost';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

const getApplicationDetailUrl = (
  documentType: string,
  refId: string
): string => {
  switch (documentType) {
    case 'Production Cost':
      return `/application-cost/production-cost/${refId}`;
    case 'Quotation':
      return `/application-cost/quotation/${refId}`;
    case 'Invoice':
      return `/application-cost/invoice/${refId}`;
    default:
      return '/application-cost';
  }
};

export default function ApplicationCostPage() {
  const [dataPerPage, setDataPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalData = mockApplicationCosts.length;
  const totalPages = Math.max(1, Math.ceil(totalData / dataPerPage));

  // Ensure current page is bounded
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * dataPerPage;
  const endIndex = Math.min(startIndex + dataPerPage, totalData);

  const displayedItems = mockApplicationCosts.slice(startIndex, endIndex);

  const handleDataPerPageChange = (newLimit: number) => {
    setDataPerPage(newLimit);
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: ApplicationCostStatus) => {
    if (status === 'Revise') {
      return (
        <span className="inline-block px-3.5 py-0.5 rounded-full text-xs font-medium bg-orange-50/80 text-orange-500 border border-orange-100/60">
          Revise
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-block px-3.5 py-0.5 rounded-full text-xs font-medium bg-amber-50/80 text-amber-600 border border-amber-100/60">
          Pending
        </span>
      );
    }
    // Approved
    return (
      <span className="inline-block px-3.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50/80 text-emerald-600 border border-emerald-100/60">
        Approved
      </span>
    );
  };

  return (
    <div className="pb-12">
      {/* Main Table Card matching design 1:1 without header title */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
                <th className="py-4 px-6 text-center font-bold text-slate-700">Project Name</th>
                <th className="py-4 px-6 text-center font-bold text-slate-700">Application Document</th>
                <th className="py-4 px-6 text-center font-bold text-slate-700">Application Date</th>
                <th className="py-4 px-6 text-center font-bold text-slate-700">Total Cost</th>
                <th className="py-4 px-6 text-center font-bold text-slate-700">Status</th>
                <th className="py-4 px-6 text-center font-bold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-slate-700">
              {displayedItems.map((item) => (
                <tr
                  key={item.id}
                  className="bg-white hover:bg-slate-50/50 transition-colors border-b border-slate-100/60"
                >
                  <td className="py-6 px-6 font-medium text-slate-800 text-left">{item.projectName}</td>
                  <td className="py-6 px-6 text-slate-700 text-center font-normal">{item.applicationDocument}</td>
                  <td className="py-6 px-6 text-slate-700 text-center font-normal">{item.applicationDate}</td>
                  <td className="py-6 px-6 text-slate-800 text-center font-medium whitespace-nowrap">
                    {formatRupiahWithSpace(item.totalCost)}
                  </td>
                  <td className="py-6 px-6 text-center">{renderStatusBadge(item.status)}</td>
                  <td className="py-6 px-6 text-center">
                    <Link
                      href={getApplicationDetailUrl(item.applicationDocument, item.id)}
                      className="w-6 h-6 rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Lihat Detail Application Cost"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination matching design 1:1 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-normal select-none">
          <div>
            <span>
              Showing {totalData === 0 ? 0 : displayedItems.length} data out of {totalData}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Show</span>
              <div className="relative inline-block">
                <select
                  value={dataPerPage}
                  onChange={(e) => handleDataPerPageChange(Number(e.target.value))}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-slate-500">data per page</span>
            </div>

            {/* Pagination Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage >= totalPages}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ArrowRight className="w-4 h-4 text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
