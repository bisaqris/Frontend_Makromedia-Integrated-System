'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/context/PageTitleContext';
import { Project } from '@/types/project';
import projectService from '@/lib/services/projectService';
import DetailProjectTabs from '@/components/projects/DetailProjectTabs';
import Button from '@/components/ui/Button';
import { Loader2, Pencil } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Role-Specific Detail Tabs Component */}
      <DetailProjectTabs project={project} role={role} onTabChange={setActiveTab} />

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="px-8 rounded-xl font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={() => router.push('/projects')}
        >
          {activeTab === 'payment' || activeTab === 'production_cost' ? 'Back' : 'Cancel'}
        </Button>

        {(role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES') && (
          <Button
            variant="outline"
            className="px-6 rounded-xl font-semibold border-amber-500 text-amber-600 hover:bg-amber-50 flex items-center gap-2"
            onClick={() => router.push(`/projects/${id}/edit`)}
          >
            <Pencil className="w-4 h-4" />
            Edit Project
          </Button>
        )}
      </div>
    </div>
  );
}
