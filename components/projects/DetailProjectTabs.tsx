'use client';

import React, { useState } from 'react';
import { Project, ProjectCostItem, ProjectTask, PaymentHistoryItem } from '@/types/project';
import { Role } from '@/types/user';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LineItemTable from '@/components/shared/LineItemTable';
import EmptyState from '@/components/shared/EmptyState';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { showToast } from '@/components/ui/Toast';
import {
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Calendar as CalendarIcon,
  CreditCard,
  Download,
} from 'lucide-react';

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

interface DetailProjectTabsProps {
  project: Project;
  role: Role | null;
}

export const DetailProjectTabs: React.FC<DetailProjectTabsProps> = ({ project, role }) => {
  // Active Main Tab state
  const isProduksi = role === 'PRODUKSI';
  const isPM = role === 'PROJECT_MANAGER';
  const isFinancialRole = role === 'DIREKTUR' || role === 'FINANCE' || role === 'SALES';

  // Determine Tab List per Role
  const mainTabOptions = React.useMemo(() => {
    if (isFinancialRole) {
      return [
        { id: 'info', label: 'Project Information' },
        { id: 'payment', label: 'Payment Status' },
        { id: 'task', label: 'Production Task' },
      ];
    }
    if (isPM) {
      return [
        { id: 'info', label: 'Project Information' },
        { id: 'production_cost', label: 'Production Cost' },
        { id: 'task', label: 'Production Task' },
      ];
    }
    // PRODUKSI (Production Team) -> ONLY 2 TABS
    return [
      { id: 'info', label: 'Project Information' },
      { id: 'task', label: 'Production Task' },
    ];
  }, [isFinancialRole, isPM]);

  const [activeMainTab, setActiveMainTab] = useState<string>(mainTabOptions[0].id);

  // SubTab state inside Payment Status (for DIREKTUR, SALES, FINANCE)
  const [activePaymentSubTab, setActivePaymentSubTab] = useState<'cost' | 'quotation' | 'invoice'>('cost');

  // Local state for interactive editing of Brief, Tasks, Cost Items
  const [generalBrief, setGeneralBrief] = useState(project.generalBrief || '');
  const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks || []);
  const [costItems] = useState<ProjectCostItem[]>(project.costItems || []);
  const [paymentHistory] = useState<PaymentHistoryItem[]>(project.paymentHistory || []);

  const handleSaveBrief = (newBrief: string) => {
    setGeneralBrief(newBrief);
    showToast.success('General Brief berhasil diperbarui.');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' }
          : t
      )
    );
    showToast.info('Status task diperbarui.');
  };

  // Financial calculations
  const contractValue = project.budget || 0;
  const totalPaid = project.totalPaid || 0;
  const restOfBill = project.restOfBill || Math.max(0, contractValue - totalPaid);
  const totalProjectCost = costItems.reduce((acc, c) => acc + (c.totalCost || 0), 0);
  const totalProfit = Math.max(0, contractValue - totalProjectCost);

  const totalPaidPercent = contractValue ? Math.round((totalPaid / contractValue) * 100) : 0;
  const profitPercent = contractValue ? Math.round((totalProfit / contractValue) * 100) : 0;
  const costPercent = contractValue ? Math.round((totalProjectCost / contractValue) * 100) : 0;

  // Task progress stats
  const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalTasksCount = tasks.length;
  const taskProgressPercent = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Main Tab Bar Navigation directly inside single container */}
      <Tabs
        tabs={mainTabOptions}
        activeTab={activeMainTab}
        onChange={setActiveMainTab}
        variant="pills"
      />

      {/* ========================================================================= */}
      {/* TAB 1: PROJECT INFORMATION */}
      {/* ========================================================================= */}
      {activeMainTab === 'info' && (
        <div className="space-y-6">
          {/* Box 1: Internal Data */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Internal Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Project Category</span>
                <div className="mt-1">
                  <Badge variant="primary" size="sm">{project.category || 'Event'}</Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Project Manager</span>
                <p className="text-sm font-bold text-slate-800">{project.projectManagerName || 'Belum ditugaskan'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: Client Data */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Client Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Client Type</span>
                <p className="text-sm font-bold text-slate-800">{project.clientType || 'Corporate'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Partnership Model</span>
                <p className="text-sm font-bold text-slate-800">{project.partnershipModel || 'Direct'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Company Name</span>
                <p className="text-sm font-bold text-slate-800">{project.clientName || 'PT Client'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">PIC Client</span>
                <p className="text-sm font-bold text-slate-800">{project.picClientName || '-'}</p>
              </div>
            </div>
          </div>

          {/* Box 3: Project Data */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Project Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Project Name</span>
                <p className="text-base font-bold text-slate-900">{project.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Event Date</span>
                <p className="text-sm font-bold text-slate-800">{formatEventDate(project.startDate, project.endDate)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Project Date Start</span>
                <p className="text-sm font-bold text-slate-800">{formatDateID(project.projectStarts || project.startDate)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Project Deadlines</span>
                <p className="text-sm font-bold text-slate-800">{formatDateID(project.deadline || project.endDate)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Venue / Location</span>
                <p className="text-sm font-bold text-slate-800">{project.venue || '-'}</p>
              </div>
              {!isProduksi && (
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Contract Value</span>
                  <p className="text-base font-bold text-slate-900">{formatRupiah(project.budget || 0)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Box 4: Progress Link */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Progress Link
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Deliverables Link</span>
                {project.deliverablesLink ? (
                  <a
                    href={project.deliverablesLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline text-sm font-bold underline flex items-center gap-1.5 break-all"
                  >
                    <span>{project.deliverablesLink}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm italic">Belum ada link terlampir</p>
                )}
              </div>

              {project.additionalLinks && project.additionalLinks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-medium block mb-1">Additional Links</span>
                  {project.additionalLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline text-sm font-bold flex items-center gap-1 break-all"
                    >
                      <span>{link.url || '-'}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 (ROLE DIREKTUR, SALES, FINANCE): PAYMENT STATUS */}
      {/* ========================================================================= */}
      {activeMainTab === 'payment' && isFinancialRole && (
        <div className="space-y-6">
          {/* Top Card: Payment History */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Payment History
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast.info('Form Tambah Pembayaran')}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Catat Pembayaran
              </Button>
            </div>

            {paymentHistory.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="w-6 h-6 text-slate-400" />}
                title="Masih Belum Ada Riwayat Pembayaran"
                message="Pembayaran dari client untuk proyek ini belum pernah dicatat."
              />
            ) : (
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase">
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4 text-right">Nominal</th>
                      <th className="py-2.5 px-4">Metode</th>
                      <th className="py-2.5 px-4">Ke Rekening</th>
                      <th className="py-2.5 px-4">Dari Rekening</th>
                      <th className="py-2.5 px-4">Berita / Catatan</th>
                      <th className="py-2.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {paymentHistory.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-800">{pay.date}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {formatRupiah(pay.amount)}
                        </td>
                        <td className="py-3 px-4">{pay.paymentMethod}</td>
                        <td className="py-3 px-4 text-slate-500">{pay.toAccount}</td>
                        <td className="py-3 px-4 text-slate-500">{pay.fromAccount}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{pay.notes}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => showToast.info('Edit Pembayaran')}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast.info('Hapus Pembayaran')}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Summary Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Pembayaran</span>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  {formatRupiah(totalPaid)}{' '}
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">
                    {totalPaidPercent}%
                  </span>
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Sisa Pembayaran</span>
                <p className="text-base font-extrabold text-amber-600 mt-0.5">
                  {formatRupiah(restOfBill)}
                </p>
              </div>
            </div>
          </div>

          {/* SubTabs Box */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentSubTab('cost')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activePaymentSubTab === 'cost'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Production Cost
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentSubTab('quotation')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activePaymentSubTab === 'quotation'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Quotation
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentSubTab('invoice')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activePaymentSubTab === 'invoice'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Invoice
                </button>
              </div>

              {/* Action buttons top right */}
              <div className="flex items-center gap-2">
                {activePaymentSubTab === 'invoice' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => showToast.success('Data Quotation berhasil di-import ke Invoice!')}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Import From Quotation
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => showToast.info('Pengajuan Cost Terkirim!')}
                >
                  Ajukan Cost
                </Button>
                <Button variant="primary" size="sm" onClick={() => showToast.info('Form Tambah Item')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add
                </Button>
              </div>
            </div>

            {/* SubTab Content: Production Cost */}
            {activePaymentSubTab === 'cost' && (
              <div className="space-y-6">
                <LineItemTable items={costItems} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Contract Value</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{formatRupiah(contractValue)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Biaya Project</span>
                    <p className="text-sm font-bold text-orange-600 mt-0.5">
                      {formatRupiah(totalProjectCost)}{' '}
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">
                        {costPercent}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Profit</span>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      {formatRupiah(totalProfit)}{' '}
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">
                        {profitPercent}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab Content: Quotation */}
            {activePaymentSubTab === 'quotation' && (
              <div className="space-y-6">
                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider mb-3">
                    RINCIAN PEKERJAAN (QUOTATION)
                  </h4>
                  <LineItemTable items={costItems} />
                </div>

                <div className="p-4 bg-orange-50/60 border border-accent/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Sub Total:</span>
                    <span className="font-semibold">{formatRupiah(contractValue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Diskon:</span>
                    <span className="font-semibold">Rp 0</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PPH 23 (2%):</span>
                    <span className="font-semibold">{formatRupiah(contractValue * 0.02)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-accent pt-2 border-t border-accent/20">
                    <span>Grand Total:</span>
                    <span>{formatRupiah(contractValue)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab Content: Invoice */}
            {activePaymentSubTab === 'invoice' && (
              <div className="space-y-6">
                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider mb-3">
                    RINCIAN INVOICE
                  </h4>
                  <LineItemTable items={costItems} />
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Contract Amount:</span>
                    <span className="font-semibold">{formatRupiah(contractValue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Previous Payment Received:</span>
                    <span className="font-semibold text-emerald-600">{formatRupiah(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-amber-800 pt-2 border-t border-amber-300">
                    <span>Invoice Amount For This Period:</span>
                    <span>{formatRupiah(restOfBill)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 (ROLE PROJECT_MANAGER): PRODUCTION COST (STANDALONE TAB) */}
      {/* ========================================================================= */}
      {activeMainTab === 'production_cost' && isPM && (
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Production Cost Summary
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => showToast.info('Pengajuan Cost Terkirim!')}
                >
                  Ajukan Cost
                </Button>
                <Button variant="primary" size="sm" onClick={() => showToast.info('Form Tambah Item')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add
                </Button>
              </div>
            </div>

            <LineItemTable items={costItems} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Contract Value</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{formatRupiah(contractValue)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Total Biaya Project</span>
                <p className="text-sm font-bold text-orange-600 mt-0.5">
                  {formatRupiah(totalProjectCost)}{' '}
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">
                    {costPercent}%
                  </span>
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Total Profit</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  {formatRupiah(totalProfit)}{' '}
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">
                    {profitPercent}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB PRODUCTION TASK */}
      {/* ========================================================================= */}
      {activeMainTab === 'task' && (
        <div className="space-y-6">
          {/* Card 1: Task Progress */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Task Progress
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overall Completion: <span className="font-bold text-slate-800">{completedTasksCount} / {totalTasksCount} tasks completed</span>
                </p>
              </div>
              <span className="text-sm font-black text-primary">{taskProgressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {completedTasksCount} DONE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold border border-orange-200">
                {tasks.filter((t) => t.status === 'IN_PROGRESS').length} IN PROGRESS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                {tasks.filter((t) => t.status === 'TODO').length} TO DO
              </span>
            </div>
          </div>

          {/* Card 2: Task Checklist */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Task Checklist
              </h3>
              {!isProduksi && (
                <Button variant="primary" size="sm" onClick={() => showToast.info('Form Tambah Task')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add
                </Button>
              )}
            </div>

            {tasks.length === 0 ? (
              <EmptyState message="Belum ada task checklist yang ditambahkan untuk proyek ini." />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200/60'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className="mt-0.5 text-slate-300 hover:text-primary transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-primary" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <p
                            className={`text-xs sm:text-sm font-bold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                          )}

                          <div className="flex items-center gap-3 pt-1 text-[11px]">
                            <span className="flex items-center gap-1 text-slate-400">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              <span>{task.dueDate}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                              PIC: {task.picName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isProduksi && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => showToast.info('Edit Task')}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast.info('Hapus Task')}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: General Brief */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              General Brief
            </h3>

            <RichTextEditor
              value={generalBrief}
              readOnly={isProduksi}
              onSave={handleSaveBrief}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProjectTabs;
