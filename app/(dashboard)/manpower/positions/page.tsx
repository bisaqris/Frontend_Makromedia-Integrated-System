'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { positionService } from '@/lib/services/positionService';
import { Position, CreatePositionDTO } from '@/types/manpower';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { toast } from 'react-hot-toast';
import {
  Search,
  Pencil,
  Trash2,
  Wrench,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type PositionFormValues = z.infer<typeof positionSchema>;

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Form & Editing States
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Delete State
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  });

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await positionService.getAll();
      setPositions(data || []);
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    if (editingPosition) {
      reset({
        name: editingPosition.name,
        status: editingPosition.status || 'ACTIVE',
      });
    } else {
      reset({
        name: '',
        status: 'ACTIVE',
      });
    }
  }, [editingPosition, reset]);

  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      const matchesSearch = position.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === 'ALL' || (position.status || 'ACTIVE') === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [positions, searchTerm, selectedStatus]);

  const totalData = filteredPositions.length;
  const totalPages = Math.ceil(totalData / pageSize) || 1;

  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPositions.slice(start, start + pageSize);
  }, [filteredPositions, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, pageSize]);

  const handleReset = () => {
    setEditingPosition(null);
    reset({
      name: '',
      status: 'ACTIVE',
    });
  };

  const handleEditClick = (position: Position) => {
    setEditingPosition(position);
  };

  const onFormSubmit = async (formData: PositionFormValues) => {
    try {
      setSubmitting(true);
      if (editingPosition) {
        await positionService.update(editingPosition.id, formData as CreatePositionDTO);
        toast.success('Position berhasil diperbarui');
      } else {
        await positionService.create(formData as CreatePositionDTO);
        toast.success('Position baru berhasil ditambahkan');
      }
      handleReset();
      fetchPositions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPosition) return;
    try {
      await positionService.delete(deletingPosition.id);
      toast.success('Position berhasil dihapus');
      if (editingPosition?.id === deletingPosition.id) {
        handleReset();
      }
      fetchPositions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus position');
    } finally {
      setIsDeleteOpen(false);
      setDeletingPosition(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Split Screen Grid Layout (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI - Table & Mobile Cards */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          
          {/* Search Bar + Separated Filter Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex items-center gap-3 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="relative flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 shrink-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer text-center"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Wrench className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                  Position tidak ditemukan
                </h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Belum ada data position terdaftar dalam sistem.
                </p>
              </div>
            ) : (
              <>
                {/* 1. TAMPILAN TABLE (Hanya muncul di Layar Desktop md ke atas) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-center text-sm border-collapse">
                    <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500">
                      <tr>
                        <th scope="col" className="px-4 py-3.5 text-center">Position Name</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Used By</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {paginatedPositions.map((position) => (
                        <tr key={position.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-zinc-900 text-left">
                            {position.name}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                                position.status === 'INACTIVE'
                                  ? 'border-zinc-300 bg-zinc-50 text-zinc-400'
                                  : 'border-emerald-400 bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {position.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-zinc-600 text-xs font-medium">
                            {position.usedBy ?? 0} people
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(position)}
                                className="rounded-lg p-1 text-amber-500 hover:bg-amber-50 transition-colors"
                                title="Edit Position"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingPosition(position);
                                  setIsDeleteOpen(true);
                                }}
                                className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Hapus Position"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. TAMPILAN CARD VIEW (Khusus Layar Mobile di bawah md) */}
                <div className="block md:hidden divide-y divide-zinc-100 p-2">
                  {paginatedPositions.map((position) => (
                    <div
                      key={position.id}
                      className="p-3.5 rounded-xl bg-white space-y-3 border border-zinc-100 my-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-zinc-900">
                          {position.name}
                        </span>
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            position.status === 'INACTIVE'
                              ? 'border-zinc-300 bg-zinc-50 text-zinc-400'
                              : 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {position.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-50">
                        <span>Used by: <strong className="text-zinc-800">{position.usedBy ?? 0} people</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(position)}
                            className="rounded-lg p-1.5 text-amber-500 bg-amber-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingPosition(position);
                              setIsDeleteOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-rose-500 bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 bg-white text-xs">
                  <div className="text-zinc-500 font-medium">
                    Showing {paginatedPositions.length} data out of {totalData}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
                      >
                        {[5, 10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span>data per page</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex h-7 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex h-7 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* KOLOM KANAN - Form Inline */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-600">
              {editingPosition ? 'Edit Position' : 'Add Position'}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-5">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Position Name
                </label>
                <input
                  type="text"
                  placeholder="e.g Videographer"
                  {...register('name')}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label
                      onClick={() => field.onChange('ACTIVE')}
                      className={`relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                        field.value === 'ACTIVE'
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            field.value === 'ACTIVE'
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {field.value === 'ACTIVE' && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-900">
                          Active
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5 leading-tight">
                          Bisa dipakai manpower
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => field.onChange('INACTIVE')}
                      className={`relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                        field.value === 'INACTIVE'
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            field.value === 'INACTIVE'
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {field.value === 'INACTIVE' && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-900">
                          Inactive
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5 leading-tight">
                          Tidak muncul di manpower
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              />

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-zinc-200 px-6 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Position"
        message={`Apakah Anda yakin ingin menghapus position "${deletingPosition?.name}"?`}
        confirmText="Hapus"
      />
    </div>
  );
}