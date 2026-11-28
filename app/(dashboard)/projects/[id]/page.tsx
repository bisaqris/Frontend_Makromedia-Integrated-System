'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/context/PageTitleContext';
import { Project } from '@/types/project';
import projectService from '@/lib/services/projectService';
import DetailProjectTabs from '@/components/projects/DetailProjectTabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import { Loader2, Pencil, CheckCircle2 } from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useAuth();
  const { setPageTitle } = usePageTitle();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isDoneModalOpen, setIsDoneModalOpen] = useState<boolean>(false);
  const [isMarkingDone, setIsMarkingDone] = useState<boolean>(false);

  const canManageProject =
    role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES' || role === 'PROJECT_MANAGER';

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      const data = await projectService.getProjectById(id);
      setProject(data);
      setIsLoading(false);
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      setPageTitle('Detail Project', project.name);
    }
    return () => {
      setPageTitle(null, null);
    };
  }, [project, setPageTitle]);

  const handleMarkProjectDone = async () => {
    if (!project) return;
    try {
      setIsMarkingDone(true);
      const updated = await projectService.updateProject(project.id, { status: 'DONE' });
      setProject((prev) => (prev ? { ...prev, status: 'DONE' } : updated));
      setIsDoneModalOpen(false);
      showToast.success(`Proyek "${project.name}" berhasil ditandai selesai (DONE).`);
    } catch {
      showToast.error('Gagal memperbarui status proyek.');
    } finally {
      setIsMarkingDone(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium">Memuat detail proyek...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12">
        <h3 className="text-base font-bold text-slate-800">Proyek Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500">ID proyek yang Anda cari tidak tersedia dalam database.</p>
        <Button variant="outline" onClick={() => router.push('/projects')}>
          Kembali ke List Project
        </Button>
      </div>
    );
  }

  const isProjectDone = project.status === 'DONE' || project.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">{project.name}</h2>
      </div>

      {/* Role-Specific Detail Tabs Component */}
      <DetailProjectTabs project={project} role={role} onTabChange={setActiveTab} />

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="md"
          className="min-w-[130px] px-8 py-2.5 rounded-xl font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => router.push('/projects')}
        >
          {activeTab === 'payment' || activeTab === 'production_cost' ? 'Back' : 'Cancel'}
        </Button>

        <div className="flex items-center gap-2.5">
          {canManageProject && !isProjectDone && (
            <button
              type="button"
              onClick={() => router.push(`/projects/${id}/edit`)}
              className="min-w-[130px] px-6 py-2.5 rounded-xl font-semibold border border-orange-400 text-orange-500 bg-white hover:bg-orange-50 hover:border-orange-500 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
            >
              <Pencil className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="whitespace-nowrap font-semibold">Edit Project</span>
            </button>
          )}

          {canManageProject && (
            isProjectDone ? (
              <span className="min-w-[130px] px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 select-none">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">Project Selesai</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsDoneModalOpen(true)}
                className="min-w-[130px] px-6 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span className="whitespace-nowrap font-semibold">Done Project</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Confirm Done Project Modal */}
      <Modal
        isOpen={isDoneModalOpen}
        onClose={() => setIsDoneModalOpen(false)}
        title="Selesaikan Proyek (Done Project)?"
        maxWidth="sm"
      >
        <div className="flex items-start gap-3.5 py-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Apakah Anda yakin ingin menyelesaikan proyek &quot;{project.name}&quot;?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Status proyek akan diubah menjadi <strong className="text-emerald-600">DONE</strong>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={() => setIsDoneModalOpen(false)} disabled={isMarkingDone}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkProjectDone}
            disabled={isMarkingDone}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isMarkingDone ? 'Memproses...' : 'Ya, Selesaikan Proyek'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
