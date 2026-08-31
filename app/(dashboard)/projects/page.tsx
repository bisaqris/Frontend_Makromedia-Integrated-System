'use client';

import React, { useState, useEffect, useCallback, startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Project, ProjectCategory } from '@/types/project';
import projectService from '@/lib/services/projectService';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/shared/ConfirmModal';
import EmptyState from '@/components/shared/EmptyState';
import { showToast } from '@/components/ui/Toast';
import { Eye, Pencil, Trash2, Plus, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDateID = (dateStr?: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const date = new Date(year, month, day);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatEventDate = (start?: string, end?: string) => {
  if (!start) return '-';
  if (!end || start === end) return formatDateID(start);
  return `${formatDateID(start)} s/d ${formatDateID(end)}`;
};

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Category' },
  { value: 'Event', label: 'Event' },
  { value: 'Corporate Video', label: 'Corporate Video' },
  { value: 'Film Production', label: 'Film Production' },
  { value: 'Content Video/Marketing', label: 'Content Video/Marketing' },
  { value: 'Wedding', label: 'Wedding' },
];

const PM_OPTIONS = [
  { value: 'ALL', label: 'All Project Manager' },
  { value: 'usr-project_manager', label: 'Andi PM (Project Manager)' },
];

export default function ListProjectPage() {
  const router = useRouter();
  const { role } = useAuth();

  const isFinancialRole = role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES';

  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPM, setSelectedPM] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectService.getProjects({
        search,
        category: selectedCategory as ProjectCategory | 'ALL',
        projectManagerId: selectedPM,
        page,
        limit,
      });
      startTransition(() => {
        setProjects(res.data);
        setTotal(res.total);
        setIsLoading(false);
      });
    } catch {
      startTransition(() => {
        setIsLoading(false);
      });
      showToast.error('Gagal mengambil daftar proyek.');
    }
  }, [search, selectedCategory, selectedPM, page, limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(deleteId);
      showToast.success('Proyek berhasil dihapus.');
      setDeleteId(null);
      fetchProjects();
    } catch {
      showToast.error('Gagal menghapus proyek.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DONE':
        return <Badge variant="success">DONE</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">ON PROGRESS</Badge>;
      default:
        return <Badge variant="info">NEW</Badge>;
    }
  };

  const getCategoryBadgeVariant = (cat?: string) => {
    switch (cat) {
      case 'Event':
        return 'primary';
      case 'Corporate Video':
        return 'success';
      case 'Film Production':
        return 'warning';
      case 'Content Video/Marketing':
        return 'accent';
      case 'Wedding':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar Outer Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by project..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>

          {/* Select Filters & Add Project Button */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
            {/* Category Filter (All roles) */}
            <div className="w-full sm:w-44">
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                options={CATEGORY_OPTIONS}
                className="py-2 text-xs bg-white border-slate-200 rounded-xl font-medium"
              />
            </div>

            {/* PM Filter (ONLY for DIREKTUR, SALES, FINANCE) */}
            {isFinancialRole && (
              <div className="w-full sm:w-52">
                <Select
                  value={selectedPM}
                  onChange={(e) => {
                    setSelectedPM(e.target.value);
                    setPage(1);
                  }}
                  options={PM_OPTIONS}
                  className="py-2 text-xs bg-white border-slate-200 rounded-xl font-medium"
                />
              </div>
            )}

            {/* Add Project Button (ONLY for DIREKTUR, SALES, FINANCE) */}
            {isFinancialRole && (
              <Link href="/projects/new" className="shrink-0">
                <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Project
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* DataTable */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-sm font-medium">Memuat data proyek...</span>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Tidak Ada Proyek Ditemukan"
            message="Coba ubah kata kunci pencarian atau filter yang digunakan."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-800 text-center bg-white whitespace-nowrap">
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Project Manager</th>
                  <th className="py-3.5 px-4">Contract Value</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 text-slate-800">
                      {proj.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={getCategoryBadgeVariant(proj.category)} size="sm">
                        {proj.category || 'Event'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      {proj.projectManagerName || '-'}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-800">
                      {formatRupiah(proj.budget || 0)}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatEventDate(proj.startDate, proj.endDate)}
                    </td>
                    <td className="py-4 px-4 text-center">{getStatusBadge(proj.status)}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Eye icon (Blue colored) */}
                        <Link
                          href={`/projects/${proj.id}`}
                          className="p-1 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Pencil (Amber) & Trash2 (Rose) icons (ONLY for DIREKTUR, SALES, FINANCE) */}
                        {isFinancialRole && (
                          <>
                            <button
                              type="button"
                              onClick={() => router.push(`/projects/${proj.id}`)}
                              className="p-1 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(proj.id)}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls matching 02__Project_List.png */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{projects.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(page * limit, total)}</span> out of{' '}
            <span className="font-semibold text-slate-700">{total}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>data per page</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
