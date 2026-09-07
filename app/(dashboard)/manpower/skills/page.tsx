"use client";

import { useState, useEffect, useMemo } from "react";
import { skillService } from "@/lib/services/skillService";
import { Skill, CreateSkillDTO } from "@/types/manpower";
import SkillModal from "@/components/manpower/SkillModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import RoleGuard from "@/components/auth/RoleGuard";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wrench,
  Loader2,
  Users,
} from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all skills from API
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getAll();
      setSkills(data);
    } catch {
      toast.error("Gagal memuat data skill. Silakan coba lagi.");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Filtered List
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // Handle Submit Form (Create / Update)
  const handleSubmit = async (formData: CreateSkillDTO) => {
    setSubmitting(true);
    try {
      if (editingSkill) {
        // Mode edit: panggil PATCH /skills/:id
        const updated = await skillService.update(editingSkill.id, formData);
        setSkills((prev) =>
          prev.map((s) => (s.id === editingSkill.id ? updated : s)),
        );
        toast.success("Skill berhasil diperbarui");
      } else {
        // Mode tambah: panggil POST /skills
        const created = await skillService.create(formData);
        setSkills((prev) => [...prev, created]);
        toast.success("Skill baru berhasil ditambahkan");
      }
      setIsModalOpen(false);
    } catch {
      toast.error(
        editingSkill
          ? "Gagal memperbarui skill. Silakan coba lagi."
          : "Gagal menambahkan skill. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingSkill) return;
    setDeleting(true);
    try {
      await skillService.delete(deletingSkill.id);
      setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id));
      toast.success("Skill berhasil dihapus");
      setIsDeleteOpen(false);
      setDeletingSkill(null);
    } catch {
      toast.error("Gagal menghapus skill. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <RoleGuard allowed={["DIREKTUR"]} fallbackMode="message">
      <div className="space-y-6">
        {/* Header Bar: Full Width Search & Action Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between w-full">
          {/* Search Bar */}
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <div className="text-xs text-zinc-400 whitespace-nowrap border-l border-zinc-200 pl-3">
              Total{" "}
              <span className="font-semibold text-zinc-800">
                {filteredSkills.length}
              </span>{" "}
              skill
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Skill
          </button>
        </div>

        {/* Table Container Section */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
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
                {searchTerm
                  ? `Tidak ada skill yang cocok dengan "${searchTerm}".`
                  : "Belum ada data skill terdaftar dalam sistem."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Skill Name
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Used By
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="max-w-30 px-6 py-4 font-medium text-zinc-900">
                        {skill.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          skill.status === "INACTIVE"
                            ? "bg-zinc-100 text-zinc-600 border-zinc-400"
                            : "bg-emerald-50 text-emerald-700 border-emerald-400"
                        }`}
                      >
                        {skill.status === "INACTIVE" ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-72 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-600">
                        <span className="text-sm font-medium">
                          {skill.usedBy ?? 0}
                        </span>
                        <span>people</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right w-32">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                          title="Edit Skill"
                        >
                          <Pencil className="h-4 w-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingSkill(skill);
                            setIsDeleteOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus Skill"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingSkill(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Hapus Skill"
          message={`Apakah Anda yakin ingin menghapus skill "${deletingSkill?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          isLoading={deleting}
        />
      </div>
    </RoleGuard>
  );
}
