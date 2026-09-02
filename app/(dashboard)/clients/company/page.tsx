'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, Pencil, Trash2, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { getCompanyClients, deleteCompanyClient, CompanyClientRecord } from '@/lib/mock/clients.mock';

export default function ListClientCompanyPage() {
  const [data, setData] = useState<CompanyClientRecord[]>(() => getCompanyClients());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('City');
  const [dataPerPage, setDataPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered data based on search query and city dropdown
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery);

    const matchesCity =
      selectedCityFilter === 'City' || item.city.toLowerCase() === selectedCityFilter.toLowerCase();

    return matchesSearch && matchesCity;
  });

  const totalFilteredCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / dataPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * dataPerPage;
  const endIndex = Math.min(startIndex + dataPerPage, totalFilteredCount);
  const displayedItems = filteredData.slice(startIndex, endIndex);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Company Client "${name}"?`)) {
      deleteCompanyClient(id);
      setData([...getCompanyClients()]);
      showToast.success(`Company Client "${name}" berhasil dihapus.`);
    }
  };

  const handleDataPerPageChange = (newLimit: number) => {
    setDataPerPage(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controls Bar (Search Input on Left, City Filter & Add Button on Right) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Search Input Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by project..."
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors shadow-2xs"
          />
        </div>

        {/* Right: City Select Filter & + Add Company Client Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <select
              value={selectedCityFilter}
              onChange={(e) => {
                setSelectedCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-primary transition-colors cursor-pointer shadow-2xs"
            >
              <option value="City">City</option>
              <option value="Malang">Malang</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Semarang">Semarang</option>
              <option value="Madiun">Madiun</option>
              <option value="Solo">Solo</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Sukabumi">Sukabumi</option>
              <option value="Tegal">Tegal</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link href="/clients/company/new">
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#0066ff] hover:bg-blue-700 text-white font-semibold rounded-xl px-5 whitespace-nowrap shadow-2xs"
            >
              Add Company Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center">City</th>
                <th className="py-4 px-6 text-center">Phone Number</th>
                <th className="py-4 px-6 text-center">Email</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data Client Company yang ditemukan.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-5 px-6 font-medium text-slate-800">{item.name}</td>
                    <td className="py-5 px-6 text-slate-600 font-normal">{item.address}</td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal">{item.city}</td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td className="py-5 px-6 text-center text-slate-600 font-normal">{item.email}</td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Eye Icon (Blue) */}
                        <button
                          type="button"
                          onClick={() => showToast.info(`Detail Company: ${item.name} (${item.city})`)}
                          className="text-[#0066ff] hover:opacity-80 transition-opacity cursor-pointer p-1"
                          title="Lihat Detail Company Client"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Icon (Yellow/Orange) */}
                        <button
                          type="button"
                          onClick={() => showToast.info(`Edit Company Client: ${item.name}`)}
                          className="text-[#f59e0b] hover:opacity-80 transition-opacity cursor-pointer p-1"
                          title="Edit Company Client"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Trash Icon (Red) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
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

        {/* Table Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-normal select-none">
          <div>
            <span>
              Showing {totalFilteredCount === 0 ? 0 : startIndex + 1}
              {totalFilteredCount > 0 ? ` to ${endIndex}` : ''} data out of {totalFilteredCount}
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
    </div>
  );
}
