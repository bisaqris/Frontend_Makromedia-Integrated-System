'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types/project';
import projectService from '@/lib/services/projectService';
import DetailProjectTabs from '@/components/projects/DetailProjectTabs';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useAuth();

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

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-700">{project.code}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{project.startDate} s/d {project.endDate}</span>
              </span>
              {project.venue && (
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{project.venue}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Detail Tabs Component */}
      <DetailProjectTabs project={project} role={role} />
    </div>
  );
}
