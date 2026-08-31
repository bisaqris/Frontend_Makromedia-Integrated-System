'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/context/PageTitleContext';
import { Project } from '@/types/project';
import projectService from '@/lib/services/projectService';
import DetailProjectTabs from '@/components/projects/DetailProjectTabs';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        {/* Role-Specific Detail Tabs Component */}
        <DetailProjectTabs project={project} role={role} />
      </div>

      <div className="flex justify-start">
        <Button
          variant="outline"
          className="px-8 rounded-xl font-semibold"
          onClick={() => router.push('/projects')}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
