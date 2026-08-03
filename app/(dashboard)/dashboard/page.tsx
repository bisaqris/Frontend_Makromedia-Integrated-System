'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/lib/roles';
import { LayoutDashboard, Calendar, FolderKanban, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Selamat datang, {user?.name || 'User'}!</h1>
            <Badge variant="primary">{role ? ROLE_LABELS[role] : ''}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Makromedia Integrated System — Panel Manajemen Proyek Terpadu.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Summary Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Proyek</span>
              <FolderKanban className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">12</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-400">
            <span className="text-emerald-600 font-semibold">+2 proyek</span> bulan ini
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Sedang Berjalan</span>
              <Clock className="w-4 h-4 text-accent" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">8</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-400">
            Aktif dalam pengerjaan
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Proyek Selesai</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">4</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-400">
            Selesai diserahterimakan
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Role Hak Akses</span>
              <LayoutDashboard className="w-4 h-4 text-sky-500" />
            </CardDescription>
            <CardTitle className="text-lg font-bold text-slate-800">{role || 'User'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-400">
            {role === 'DIREKTUR' ? 'Akses penuh ke semua modul' : 'Akses terkonfigurasi'}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
