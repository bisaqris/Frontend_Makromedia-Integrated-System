'use client';

import { useState, useEffect, useMemo } from 'react';
import { skillService } from '@/lib/services/skillService';
import { Skill, CreateSkillDTO } from '@/types/manpower';
import SkillModal from '@/components/manpower/SkillModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Wrench,
    Loader2,
} from 'lucide-react';

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Delete State
    const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const fetchSkills = async () => {
        setLoading(true);
        setSkills([]); 
        setLoading(false);
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    // Filtered List
    const filteredSkills = useMemo(() => {
        return skills.filter((skill) =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [skills, searchTerm]);

    // Handle Add/Edit Open
    const handleOpenAdd = () => {
        setEditingSkill(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (skill: Skill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    // Handle Submit Form
    const handleSubmit = async (formData: CreateSkillDTO) => {
        setSubmitting(true);

        if (editingSkill) {
            // Mode edit: update item yang match id-nya
            setSkills((prev) =>
                prev.map((s) =>
                    s.id === editingSkill.id ? { ...s, ...formData } : s
                )
            );
            toast.success('Skill berhasil diperbarui');
        } else {
            // Mode tambah: generate id sementara (misal pakai timestamp)
            const newSkill: Skill = {
                id: crypto.randomUUID(), // atau Date.now().toString()
                status: 'ACTIVE',
                ...formData,
            } as Skill;
            setSkills((prev) => [...prev, newSkill]);
            toast.success('Skill baru berhasil ditambahkan');
        }

        setSubmitting(false);
        setIsModalOpen(false);
    };

    // Handle Delete Confirmation
    const handleDeleteConfirm = async () => {
        if (!deletingSkill) return;
        setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id));
        toast.success('Skill berhasil dihapus (sementara)');
        setIsDeleteOpen(false);
        setDeletingSkill(null);
    };

    return (
        <div className="space-y-6">
            {/* Header Bar: Full Width Search & Action Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between w-full">
                {/* Search Bar */}
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
                    <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama skill atau kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                    <div className="text-xs text-zinc-400 whitespace-nowrap border-l border-zinc-200 pl-3">
                        Total <span className="font-semibold text-zinc-800">{filteredSkills.length}</span> skill
                    </div>
                </div>

                {/* Action Button - Disamakan ukurannya dengan Search Bar */}
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Skill
                </button>
            </div>

            {/* Table Container Section */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="rounded-full bg-zinc-100 p-4">
                            <Wrench className="h-7 w-7 text-zinc-400" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-zinc-900">
                            Skill tidak ditemukan
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400 max-w-sm">
                            Belum ada data skill terdaftar dalam sistem.
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500">
                            <tr>
                                <th scope="col" className="px-6 py-4">Skill Name</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredSkills.map((skill) => (
                                <tr key={skill.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                                <Wrench className="h-4 w-4" />
                                            </div>
                                            {skill.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${skill.status === 'INACTIVE'
                                                ? 'bg-zinc-100 text-zinc-600'
                                                : 'bg-emerald-50 text-emerald-700'
                                                }`}
                                        >
                                            {skill.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(skill)}
                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                                                title="Edit Skill"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingSkill(skill);
                                                    setIsDeleteOpen(true);
                                                }}
                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                )}
            </div>

            {/* Modal Components */}
            <SkillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingSkill}
                isLoading={submitting}
            />

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Hapus Skill"
                message={`Apakah Anda yakin ingin menghapus skill "${deletingSkill?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
            />
        </div>
    );
}