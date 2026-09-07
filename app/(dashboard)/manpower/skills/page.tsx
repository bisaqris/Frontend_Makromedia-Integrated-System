'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { skillService } from '@/lib/services/skillService';
import { Skill, CreateSkillDTO } from '@/types/manpower';
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

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type SkillFormValues = z.infer<typeof skillSchema>;

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Form & Editing States
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Delete State
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillService.getAll();
      setSkills(data || []);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (editingSkill) {
      reset({
        name: editingSkill.name,
        status: editingSkill.status || 'ACTIVE',
      });
    } else {
      reset({
        name: '',
        status: 'ACTIVE',
      });
    }
  }, [editingSkill, reset]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === 'ALL' || (skill.status || 'ACTIVE') === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [skills, searchTerm, selectedStatus]);

  const totalData = filteredSkills.length;
  const totalPages = Math.ceil(totalData / pageSize) || 1;

  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, pageSize]);

  const handleReset = () => {
    setEditingSkill(null);
    reset({
      name: '',
      status: 'ACTIVE',
    });
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkill(skill);
  };

  const onFormSubmit = async (formData: SkillFormValues) => {
    try {
      setSubmitting(true);
      if (editingSkill) {
        await skillService.update(editingSkill.id, formData as CreateSkillDTO);
        toast.success('Skill berhasil diperbarui');
      } else {
        await skillService.create(formData as CreateSkillDTO);
        toast.success('Skill baru berhasil ditambahkan');
      }
      handleReset();
      fetchSkills();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSkill) return;
    try {
      await skillService.delete(deletingSkill.id);
      toast.success('Skill berhasil dihapus');
      if (editingSkill?.id === deletingSkill.id) {
        handleReset();
      }
      fetchSkills();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus skill');
    } finally {
      setIsDeleteOpen(false);
      setDeletingSkill(null);
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
            <div className="flex items-center gap-3 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="relative flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm shrink-0">
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
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Wrench className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                  Skill tidak ditemukan
                </h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Belum ada data skill terdaftar dalam sistem.
                </p>
              </div>
            ) : (
              <>
                {/* 1. TAMPILAN TABLE (Hanya muncul di Layar Desktop md ke atas) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-center text-sm border-collapse">
                    <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500">
                      <tr>
                        <th scope="col" className="px-4 py-3.5 text-center">Skill Name</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Used By</th>
                        <th scope="col" className="px-4 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {paginatedSkills.map((skill) => (
                        <tr key={skill.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-zinc-900 text-center">
                            {skill.name}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                                skill.status === 'INACTIVE'
                                  ? 'border-zinc-300 bg-zinc-50 text-zinc-400'
                                  : 'border-emerald-400 bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {skill.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-zinc-600 text-xs font-medium">
                            {skill.usedBy ?? 0} people
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(skill)}
                                className="rounded-lg p-1 text-amber-500 hover:bg-amber-50 transition-colors"
                                title="Edit Skill"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingSkill(skill);
                                  setIsDeleteOpen(true);
                                }}
                                className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Hapus Skill"
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
                  {paginatedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-xl bg-white space-y-3 border border-zinc-100 shadow-sm my-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-zinc-900">
                          {skill.name}
                        </span>
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            skill.status === 'INACTIVE'
                              ? 'border-zinc-300 bg-zinc-50 text-zinc-400'
                              : 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {skill.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-50">
                        <span>Used by: <strong className="text-zinc-800">{skill.usedBy ?? 0} people</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(skill)}
                            className="rounded-lg p-1.5 text-amber-500 bg-amber-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingSkill(skill);
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
                    Showing {paginatedSkills.length} data out of {totalData}
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
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-600">
              {editingSkill ? 'Edit Skill' : 'Add Skill'}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-5">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Skill Name
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
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
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
        title="Hapus Skill"
        message={`Apakah Anda yakin ingin menghapus skill "${deletingSkill?.name}"?`}
        confirmText="Hapus"
      />
    </div>
  );
}