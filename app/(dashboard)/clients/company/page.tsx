'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, Pencil, Trash2, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import { clientService } from '@/lib/services/clientService';
import { ClientCompany } from '@/types/client';
import ErrorState from '@/components/shared/ErrorState';

export default function ListClientCompanyPage() {
  const [data, setData] = useState<ClientCompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('City');
  const [dataPerPage, setDataPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [companyToDelete, setCompanyToDelete] = useState<ClientCompany | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(() => {
    clientService.getCompanies()
      .then((companies) => {
        setData(companies);
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
        showToast.error('Gagal memuat data Company Client.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cityOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map((item) => item.city).filter((city): city is string => Boolean(city)))
      ).sort(),
    [data]
  );

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.phone ?? '').includes(searchQuery);

    const matchesCity =
      selectedCityFilter === 'City' ||
      (item.city ?? '').toLowerCase() === selectedCityFilter.toLowerCase();

    return matchesSearch && matchesCity;
  });

  const totalFilteredCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / dataPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * dataPerPage;
  const endIndex = Math.min(startIndex + dataPerPage, totalFilteredCount);
  const displayedItems = filteredData.slice(startIndex, endIndex);

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      await clientService.deleteCompany(companyToDelete.id);
      showToast.success(`Company Client "${companyToDelete.name}" berhasil dihapus.`);
      setCompanyToDelete(null);
      await loadData();
    } catch {
      showToast.error(`Gagal menghapus Company Client "${companyToDelete.name}".`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDataPerPageChange = (newLimit: number) => {
    setDataPerPage(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by all..."
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <select
              value={selectedCityFilter}
              onChange={(e) => {
                setSelectedCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-primary shadow-2xs"
            >
              <option value="City">Semua Kota</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link href="/clients/company/new">
            <Button
              variant="primary"
              className="bg-[#0066ff] hover:bg-blue-700 text-white font-semibold rounded-xl px-5 whitespace-nowrap shadow-2xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add New Company</span>
            </Button>
          </Link>
        </div>
      </div>

      {loadError ? (
        <ErrorState
          title="Gagal Memuat Data"
          message="Terjadi kesalahan saat memuat daftar Client Company. Silakan coba lagi."
          onRetry={loadData}
        />
      ) : (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        {/* 1. TAMPILAN DESKTOP (TABLE) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-6">Company Client</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center">City</th>
                <th className="py-4 px-6 text-center">Phone</th>
                <th className="py-4 px-6 text-center">Email</th>
                <th className="py-4 px-6 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? 'Memuat data...' : 'Tidak ada data Client Company yang ditemukan.'}
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-5 px-6 text-center font-normal text-slate-400">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-5 px-6 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-5 px-6 text-slate-600 font-normal max-w-xs truncate" title={item.address}>
                      {item.address || '-'}
                    </td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal">{item.city || '-'}</td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal whitespace-nowrap">
                      {item.phone || '-'}
                    </td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal">{item.email || '-'}</td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/clients/company/${item.id}`}
                          className="text-[#0066ff] hover:opacity-80 transition-opacity cursor-pointer p-1"
                          title="Lihat Detail Company Client"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/clients/company/${item.id}/edit`}
                          className="text-[#f59e0b] hover:opacity-80 transition-opacity cursor-pointer p-1"
                          title="Edit Company Client"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setCompanyToDelete(item)}
                          className="text-red-500 hover:opacity-80 transition-opacity cursor-pointer p-1"
                          title="Hapus Company Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2. TAMPILAN MOBILE (CARD VIEW) */}
        <div className="block md:hidden divide-y divide-slate-100 -mx-2 px-2">
          {displayedItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              {isLoading ? 'Memuat data...' : 'Tidak ada data Client Company yang ditemukan.'}
            </div>
          ) : (
            displayedItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-white space-y-3 border border-slate-100 my-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-sm text-slate-900 leading-snug">{item.name}</span>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {item.city || '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <span className="text-slate-700">{item.address || '-'}</span>
                  <span>{item.email || '-'}</span>
                  <span>{item.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-end text-xs text-slate-500 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/clients/company/${item.id}`}
                      className="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Lihat Detail Company Client"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/clients/company/${item.id}/edit`}
                      className="p-1.5 rounded-lg text-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors"
                      title="Edit Company Client"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCompanyToDelete(item)}
                      className="p-1.5 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Hapus Company Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-normal select-none">
          <div>
            <span>
              Showing {totalFilteredCount === 0 ? 0 : startIndex + 1}
              {totalFilteredCount > 0 ? ` to ${endIndex}` : ''} data out of {totalFilteredCount}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 hidden sm:inline">Show</span>
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

            <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage >= totalPages || totalFilteredCount === 0}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ArrowRight className="w-4 h-4 text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Company Client"
        message={`Apakah Anda yakin ingin menghapus Company Client "${companyToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
}
