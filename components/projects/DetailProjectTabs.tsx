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
import AddCostItemModal from '@/components/projects/AddCostItemModal';
import AddQuotationItemModal from '@/components/projects/AddQuotationItemModal';
import AddInvoiceItemModal from '@/components/projects/AddInvoiceItemModal';
import AddTaskModal from '@/components/projects/AddTaskModal';
import AddPaymentModal from '@/components/projects/AddPaymentModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import {
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Calendar as CalendarIcon,
  Download,
  Upload,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatRupiahNoSpace = (val: number) => {
  return `Rp${(val || 0).toLocaleString('id-ID')}`;
};

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

const formatDateID = (dateStr?: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return dateStr;
};

const formatEventDate = (start?: string, end?: string) => {
  if (!start) return '-';
  if (!end || start === end) return formatDateID(start);
  return `${formatDateID(start)} s/d ${formatDateID(end)}`;
};

const paymentSubTabOptions = [
  { id: 'cost', label: 'Production Cost' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'invoice', label: 'Invoice' },
];

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

  // Modal & Item Editing States (Production Cost)
  const [isAddCostModalOpen, setIsAddCostModalOpen] = useState<boolean>(false);
  const [editingCostItem, setEditingCostItem] = useState<ProjectCostItem | null>(null);
  const [deleteCostItemId, setDeleteCostItemId] = useState<string | null>(null);

  // Modal & Item Editing States (Quotation)
  const [isAddQuotationModalOpen, setIsAddQuotationModalOpen] = useState<boolean>(false);
  const [editingQuotationItem, setEditingQuotationItem] = useState<ProjectCostItem | null>(null);
  const [deleteQuotationItemId, setDeleteQuotationItemId] = useState<string | null>(null);

  // Modal & Item Editing States (Invoice)
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState<boolean>(false);
  const [editingInvoiceItem, setEditingInvoiceItem] = useState<ProjectCostItem | null>(null);
  const [deleteInvoiceItemId, setDeleteInvoiceItemId] = useState<string | null>(null);
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState<boolean>(false);

  // Modal & Item Editing States (Production Task)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Modal & Item Editing States (Payment History)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<PaymentHistoryItem | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  // Production Cost Submission Status State
  const [costSubmissionStatus, setCostSubmissionStatus] = useState<'DRAFT' | 'PENDING'>('DRAFT');

  // Local state for interactive editing of Brief, Tasks, Cost Items, Quotation Items, Invoice Items, Payment History
  const [generalBrief, setGeneralBrief] = useState(project.generalBrief || '');

  // Tasks initial state matching design screenshot 1:1
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    if (project.tasks && project.tasks.length > 0) return project.tasks;
    return [
      {
        id: 'task-1',
        title: 'Livestreaming platform setup',
        description: 'Persiapan kamera, switcher, dan kabel di venue sebelum acara dimulai.',
        dueDate: '2026-11-02',
        status: 'DONE',
        picName: 'Anton W.',
      },
      {
        id: 'task-2',
        title: 'Technical rundown draft',
        description: 'Persiapan kamera, switcher, dan kabel di venue sebelum acara dimulai.',
        dueDate: '2026-11-02',
        status: 'TODO',
        picName: 'Anton W.',
      },
      {
        id: 'task-3',
        title: 'Dress rehearsal & test stream',
        description: 'Persiapan kamera, switcher, dan kabel di venue sebelum acara dimulai.',
        dueDate: '2026-10-29',
        status: 'TODO',
        picName: 'Anton W.',
      },
    ];
  });

  const [costItems, setCostItems] = useState<ProjectCostItem[]>(project.costItems || []);
  const [quotationItems, setQuotationItems] = useState<ProjectCostItem[]>(project.costItems || []);

  // Invoice Items initial state matching design screenshot 1:1
  const [invoiceItems, setInvoiceItems] = useState<ProjectCostItem[]>(() => {
    if (project.costItems && project.costItems.length > 0) {
      return project.costItems;
    }
    return [
      {
        id: 'inv-init-1',
        projectId: project.id,
        category: 'Event Telkomsel',
        description: 'Full Production Package',
        executor: 'Event Telkomsel Malang',
        unitCost: 2000000,
        quantity: 1,
        unit: 'Paket',
        freq: 1,
        period: '1',
        totalCost: 2000000,
      },
    ];
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(project.paymentHistory || []);

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

  // Production Task Handlers
  const handleSaveTask = (taskData: Omit<ProjectTask, 'id'>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
      );
      setEditingTask(null);
      showToast.success('Task berhasil diperbarui.');
    } else {
      const newTask: ProjectTask = {
        ...taskData,
        id: `task-${Date.now()}`,
      };
      setTasks((prev) => [...prev, newTask]);
      showToast.success('Task baru berhasil ditambahkan.');
    }
  };

  const handleDeleteTask = () => {
    if (!deleteTaskId) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
    setDeleteTaskId(null);
    showToast.success('Task berhasil dihapus.');
  };

  // Production Cost Handlers
  const handleAddCostItem = (newItem: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    const item: ProjectCostItem = {
      ...newItem,
      id: `cost-${Date.now()}`,
      projectId: project.id,
    };
    setCostItems((prev) => [...prev, item]);
    showToast.success('Item berhasil ditambahkan.');
  };

  const handleUpdateCostItem = (updated: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    if (!editingCostItem) return;
    setCostItems((prev) =>
      prev.map((item) => (item.id === editingCostItem.id ? { ...item, ...updated } : item))
    );
    setEditingCostItem(null);
    showToast.success('Item berhasil diperbarui.');
  };

  const handleDeleteCostItem = () => {
    if (!deleteCostItemId) return;
    setCostItems((prev) => prev.filter((item) => item.id !== deleteCostItemId));
    setDeleteCostItemId(null);
    showToast.success('Item berhasil dihapus.');
  };

  // Quotation Handlers (Independent logic & data from Production Cost)
  const handleAddQuotationItem = (newItem: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    const item: ProjectCostItem = {
      ...newItem,
      id: `quot-${Date.now()}`,
      projectId: project.id,
    };
    setQuotationItems((prev) => [...prev, item]);
    showToast.success('Item quotation berhasil ditambahkan.');
  };

  const handleUpdateQuotationItem = (updated: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    if (!editingQuotationItem) return;
    setQuotationItems((prev) =>
      prev.map((item) => (item.id === editingQuotationItem.id ? { ...item, ...updated } : item))
    );
    setEditingQuotationItem(null);
    showToast.success('Item quotation berhasil diperbarui.');
  };

  const handleDeleteQuotationItem = () => {
    if (!deleteQuotationItemId) return;
    setQuotationItems((prev) => prev.filter((item) => item.id !== deleteQuotationItemId));
    setDeleteQuotationItemId(null);
    showToast.success('Item quotation berhasil dihapus.');
  };

  // Invoice Handlers (Independent logic & data)
  const handleAddInvoiceItem = (newItem: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    const item: ProjectCostItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
      projectId: project.id,
    };
    setInvoiceItems((prev) => [...prev, item]);
    showToast.success('Item invoice berhasil ditambahkan.');
  };

  const handleUpdateInvoiceItem = (updated: Omit<ProjectCostItem, 'id' | 'projectId'>) => {
    if (!editingInvoiceItem) return;
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === editingInvoiceItem.id ? { ...item, ...updated } : item))
    );
    setEditingInvoiceItem(null);
    showToast.success('Item invoice berhasil diperbarui.');
  };

  const handleDeleteInvoiceItem = () => {
    if (!deleteInvoiceItemId) return;
    setInvoiceItems((prev) => prev.filter((item) => item.id !== deleteInvoiceItemId));
    setDeleteInvoiceItemId(null);
    showToast.success('Item invoice berhasil dihapus.');
  };

  // Refined Import From Quotation Logic
  const handleTriggerImportFromQuotation = () => {
    if (quotationItems.length === 0) {
      showToast.error('Belum ada item quotation untuk di-import.');
      return;
    }
    if (invoiceItems.length > 0) {
      setIsConfirmImportOpen(true);
    } else {
      executeImportFromQuotation();
    }
  };

  const executeImportFromQuotation = () => {
    const imported = quotationItems.map((q, idx) => ({
      ...q,
      id: `inv-imp-${Date.now()}-${idx}`,
      category: q.category || 'Quotation',
    }));
    setInvoiceItems(imported);
    setIsConfirmImportOpen(false);
    showToast.success(`${imported.length} item Quotation berhasil di-import ke Invoice!`);
  };

  // Payment History Handlers
  const handleSavePayment = (item: Omit<PaymentHistoryItem, 'id'>) => {
    if (editingPayment) {
      setPaymentHistory((prev) =>
        prev.map((p) => (p.id === editingPayment.id ? { ...p, ...item } : p))
      );
      setEditingPayment(null);
      showToast.success('Pembayaran berhasil diperbarui.');
    } else {
      setPaymentHistory((prev) => [...prev, { ...item, id: `pay-${Date.now()}` }]);
      showToast.success('Pembayaran berhasil dicatat.');
    }
  };

  const handleDeletePayment = () => {
    if (!deletePaymentId) return;
    setPaymentHistory((prev) => prev.filter((p) => p.id !== deletePaymentId));
    setDeletePaymentId(null);
    showToast.success('Pembayaran berhasil dihapus.');
  };

  const handleSubmitCost = () => {
    if (costItems.length === 0) {
      showToast.error('Belum ada item yang bisa diajukan.');
      return;
    }
    setCostSubmissionStatus('PENDING');
    showToast.success('Production Cost berhasil diajukan untuk approval Direktur.');
  };

  // Dynamic Financial calculations
  const contractValue = project.budget || 0;
  const totalPaid = paymentHistory.reduce((acc, p) => acc + (p.amount || 0), 0);
  const restOfBill = Math.max(0, contractValue - totalPaid);
  const totalProjectCost = costItems.reduce((acc, c) => acc + (c.totalCost || 0), 0);
  const quotationTotalCost = quotationItems.reduce((acc, c) => acc + (c.totalCost || 0), 0);
  const invoiceTotalCost = invoiceItems.reduce((acc, c) => acc + (c.totalCost || 0), 0);
  const invoiceAmountForPeriod = Math.max(0, invoiceTotalCost - totalPaid);
  const totalProfit = Math.max(0, contractValue - totalProjectCost);

  const totalPaidPercentVal = contractValue ? (totalPaid / contractValue) * 100 : 0;
  const totalPaidPercentFormatted = totalPaidPercentVal.toFixed(2).replace('.', ',');
  const profitPercent = contractValue ? Math.round((totalProfit / contractValue) * 100) : 0;
  const costPercent = contractValue ? Math.round((totalProjectCost / contractValue) * 100) : 0;

  // Task progress stats
  const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalTasksCount = tasks.length;
  const taskProgressPercent = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs overflow-hidden space-y-6">
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
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-primary">
                  Payment History
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Payment from Client / Customer
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddPaymentModalOpen(true)}
              >
                Add
              </Button>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <img src="/illustrations/empty-box.svg" alt="" className="w-40 h-40 mb-4 object-contain" />
                <p className="text-sm text-slate-500">
                  Masih belum ada riwayat pembayaran.
                </p>
                <p className="text-sm text-slate-500">
                  Untuk menambahkan silakan klik button{' '}
                  <span className="text-primary font-bold">&quot;+ Add&quot;</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Date</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Nominal</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Payment Method</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Ke Rekening</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Dari Rekening</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Berita</th>
                        <th className="py-4 px-4 text-center font-bold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm text-slate-700">
                      {paymentHistory.map((pay) => (
                        <tr key={pay.id} className="bg-white hover:bg-slate-50/60 transition-colors border-b border-slate-50">
                          <td className="py-4 px-4 text-slate-800 text-center font-normal">{formatDateID(pay.date)}</td>
                          <td className="py-4 px-4 text-center text-slate-800 font-normal">
                            {formatRupiahNoSpace(pay.amount)}
                          </td>
                          <td className="py-4 px-4 text-center font-normal">{pay.paymentMethod}</td>
                          <td className="py-4 px-4 text-slate-700 text-center font-normal">{pay.toAccount}</td>
                          <td className="py-4 px-4 text-slate-700 text-center font-normal">{pay.fromAccount}</td>
                          <td className="py-4 px-4 text-slate-700 text-center max-w-xs truncate font-normal">{pay.notes}</td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDeletePaymentId(pay.id)}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Hapus Pembayaran"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPayment(pay)}
                                className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Edit Pembayaran"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Summary Footer matching design 1:1 */}
                <div className="pt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-500 font-semibold min-w-[140px]">
                      Total Pembayaran
                    </span>
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <span>{formatRupiahNoSpace(totalPaid)}</span>
                      <span className="px-1 font-normal text-primary">|</span>
                      <span>{totalPaidPercentFormatted}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-slate-500 font-semibold min-w-[140px]">
                      Sisa Pembayaran
                    </span>
                    <span className="font-bold text-primary">
                      {formatRupiahNoSpace(restOfBill)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SubTabs Card: Production Cost / Quotation / Invoice */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-6 bg-white overflow-hidden">
            <Tabs
              tabs={paymentSubTabOptions}
              activeTab={activePaymentSubTab}
              onChange={(id) => setActivePaymentSubTab(id as 'cost' | 'quotation' | 'invoice')}
              variant="pills"
            />

            {/* SubTab Content: Production Cost */}
            {activePaymentSubTab === 'cost' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-primary">
                      Production Cost
                    </h3>
                    {costSubmissionStatus === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        MENUNGGU APPROVAL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {costItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-accent text-accent hover:bg-orange-50"
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        onClick={handleSubmitCost}
                        disabled={costSubmissionStatus === 'PENDING' || costItems.length === 0}
                      >
                        Ajukan Cost
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAddCostModalOpen(true)}
                      disabled={costSubmissionStatus === 'PENDING'}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {costItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                    <img src="/illustrations/empty-box.svg" alt="" className="w-40 h-40 mb-4 object-contain" />
                    <p className="text-sm text-slate-500">
                      Masih belum ada production cost.
                    </p>
                    <p className="text-sm text-slate-500">
                      Untuk menambahkan silakan klik button{' '}
                      <span className="text-primary font-bold">&quot;+ Add&quot;</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <LineItemTable
                      items={costItems}
                      onEdit={(item) => setEditingCostItem(item)}
                      onDelete={(id) => setDeleteCostItemId(id)}
                      readOnly={costSubmissionStatus === 'PENDING'}
                    />

                    {/* Redesigned Summary Table for Production Cost */}
                    <div className="pt-4">
                      <div className="flex justify-end gap-12 text-xs font-semibold text-slate-700 pb-2 border-b border-slate-200">
                        <span className="w-20 text-right">Presentase</span>
                        <span className="w-32 text-right">Total</span>
                      </div>
                      {[
                        { label: 'Contract Value:', percent: 100, value: contractValue },
                        { label: 'Total Biaya Project:', percent: costPercent, value: totalProjectCost },
                        { label: 'Total Profit:', percent: profitPercent, value: totalProfit },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100">
                          <span className="text-sm font-bold text-accent">{row.label}</span>
                          <div className="flex gap-12">
                            <span className="w-20 text-right text-sm font-bold text-accent">{row.percent}%</span>
                            <span className="w-32 text-right text-sm font-bold text-accent">{formatRupiah(row.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SubTab Content: Quotation */}
            {activePaymentSubTab === 'quotation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-primary">
                      Quotation
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Offering document to the client
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-orange-50"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      onClick={handleSubmitCost}
                      disabled={costSubmissionStatus === 'PENDING' || quotationItems.length === 0}
                    >
                      Ajukan Cost
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAddQuotationModalOpen(true)}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wider mb-4">
                    RINCIAN PEKERJAAN
                  </h4>

                  {quotationItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                      <img src="/illustrations/empty-box.svg" alt="" className="w-40 h-40 mb-4 object-contain" />
                      <p className="text-sm text-slate-500">
                        Masih belum ada rincian quotation.
                      </p>
                      <p className="text-sm text-slate-500">
                        Untuk menambahkan silakan klik button{' '}
                        <span className="text-primary font-bold">&quot;+ Add&quot;</span>
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Item</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Deskripsi</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Harga Satuan</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Jumlah</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Freq</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Periode</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Sub Total</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm text-slate-700">
                          {quotationItems.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                              <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">{item.description}</td>
                              <td className="py-4 px-4 text-slate-600">{item.executor || '-'}</td>
                              <td className="py-4 px-4 text-center font-normal whitespace-nowrap">{formatRupiahWithSpace(item.unitCost)}</td>
                              <td className="py-4 px-4 text-center font-normal">{item.quantity}</td>
                              <td className="py-4 px-4 text-center font-normal">{item.freq || 1}</td>
                              <td className="py-4 px-4 text-center text-slate-600 font-normal">{item.period || 'hari'}</td>
                              <td className="py-4 px-4 text-center font-normal whitespace-nowrap">{formatRupiahWithSpace(item.totalCost)}</td>
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuotationItem(item)}
                                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Edit Item"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteQuotationItemId(item.id)}
                                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Hapus Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Summary Footer with increased vertical spacing */}
                  <div className="pt-6 border-t border-slate-100 space-y-6 text-sm sm:text-base">
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Sub Total</span>
                      <span className="font-bold text-slate-800">{formatRupiahWithSpace(quotationTotalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Discount</span>
                      <span className="font-bold text-slate-800">0%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>PPH</span>
                      <span className="font-bold text-slate-800">Rp 0</span>
                    </div>

                    <div className="p-4 sm:p-5 bg-orange-50/70 border border-orange-100/60 rounded-xl flex justify-between items-center mt-6">
                      <span className="text-sm sm:text-base font-extrabold text-accent">Grand Total</span>
                      <span className="text-sm sm:text-base font-extrabold text-accent">{formatRupiahWithSpace(quotationTotalCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab Content: Invoice */}
            {activePaymentSubTab === 'invoice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-primary">
                      Invoice
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Billing document to the client
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      onClick={handleTriggerImportFromQuotation}
                    >
                      Import From Quotation
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-orange-50"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      onClick={handleSubmitCost}
                      disabled={costSubmissionStatus === 'PENDING' || invoiceItems.length === 0}
                    >
                      Ajukan Cost
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAddInvoiceModalOpen(true)}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wider mb-4">
                    RINCIAN PEKERJAAN
                  </h4>

                  {invoiceItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                      <img src="/illustrations/empty-box.svg" alt="" className="w-40 h-40 mb-4 object-contain" />
                      <p className="text-sm text-slate-500">
                        Masih belum ada rincian invoice.
                      </p>
                      <p className="text-sm text-slate-500">
                        Untuk menambahkan silakan klik button{' '}
                        <span className="text-primary font-bold">&quot;+ Add&quot;</span> atau{' '}
                        <span className="text-primary font-bold">&quot;Import From Quotation&quot;</span>
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Item</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Deskripsi</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Harga Satuan</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Jumlah</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Freq</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Periode</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Sub Total</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm text-slate-700">
                          {invoiceItems.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                              <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">
                                <div>
                                  <p className="font-semibold text-slate-800">{item.description}</p>
                                  {item.category && item.category !== 'Quotation' && item.category !== 'Invoice' && (
                                    <p className="text-xs text-slate-400 font-normal">{item.category}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-600">{item.executor || '-'}</td>
                              <td className="py-4 px-4 text-center font-normal whitespace-nowrap">{formatRupiahWithSpace(item.unitCost)}</td>
                              <td className="py-4 px-4 text-center font-normal">{item.quantity}</td>
                              <td className="py-4 px-4 text-center font-normal">{item.freq || 1}</td>
                              <td className="py-4 px-4 text-center text-slate-600 font-normal">{item.period || '1'}</td>
                              <td className="py-4 px-4 text-center font-normal whitespace-nowrap">{formatRupiahWithSpace(item.totalCost)}</td>
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingInvoiceItem(item)}
                                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Edit Item"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteInvoiceItemId(item.id)}
                                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Hapus Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Invoice Summary Footer */}
                  <div className="pt-6 border-t border-slate-100 space-y-6 text-sm sm:text-base">
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Sub Total</span>
                      <span className="font-bold text-slate-800">{formatRupiahWithSpace(invoiceTotalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Diskon</span>
                      <span className="font-bold text-slate-800">0%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>PPH</span>
                      <span className="font-bold text-slate-800">Rp 0</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="font-extrabold text-slate-900">Contract Amount</span>
                      <span className="font-extrabold text-slate-900">{formatRupiahWithSpace(invoiceTotalCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 font-normal">
                      <span>Previous Payment</span>
                      <span>- {formatRupiahWithSpace(totalPaid)}</span>
                    </div>

                    {/* Orange Banner Box */}
                    <div className="p-4 sm:p-5 bg-orange-50/70 border border-orange-100/60 rounded-xl flex justify-between items-center mt-6">
                      <div>
                        <p className="text-sm sm:text-base font-extrabold text-accent">Invoice Amount</p>
                        <p className="text-xs sm:text-sm font-semibold text-accent/90 mt-0.5">For This Period</p>
                      </div>
                      <span className="text-base sm:text-lg font-extrabold text-accent">{formatRupiahWithSpace(invoiceAmountForPeriod)}</span>
                    </div>
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
          <div className="border border-slate-200 rounded-xl p-5 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-primary">
                  Production Cost
                </h3>
                {costSubmissionStatus === 'PENDING' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                    MENUNGGU APPROVAL
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {costItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-orange-50"
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    onClick={handleSubmitCost}
                    disabled={costSubmissionStatus === 'PENDING' || costItems.length === 0}
                  >
                    Ajukan Cost
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddCostModalOpen(true)}
                  disabled={costSubmissionStatus === 'PENDING'}
                >
                  Add
                </Button>
              </div>
            </div>

            {costItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <img src="/illustrations/empty-box.svg" alt="" className="w-40 h-40 mb-4 object-contain" />
                <p className="text-sm text-slate-500">
                  Masih belum ada production cost.
                </p>
                <p className="text-sm text-slate-500">
                  Untuk menambahkan silakan klik button{' '}
                  <span className="text-primary font-bold">&quot;+ Add&quot;</span>
                </p>
              </div>
            ) : (
              <>
                <LineItemTable
                  items={costItems}
                  onEdit={(item) => setEditingCostItem(item)}
                  onDelete={(id) => setDeleteCostItemId(id)}
                  readOnly={costSubmissionStatus === 'PENDING'}
                />

                {/* Redesigned Summary Table for Production Cost */}
                <div className="pt-4">
                  <div className="flex justify-end gap-12 text-xs font-semibold text-slate-700 pb-2 border-b border-slate-200">
                    <span className="w-20 text-right">Presentase</span>
                    <span className="w-32 text-right">Total</span>
                  </div>
                  {[
                    { label: 'Contract Value:', percent: 100, value: contractValue },
                    { label: 'Total Biaya Project:', percent: costPercent, value: totalProjectCost },
                    { label: 'Total Profit:', percent: profitPercent, value: totalProfit },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100">
                      <span className="text-sm font-bold text-accent">{row.label}</span>
                      <div className="flex gap-12">
                        <span className="w-20 text-right text-sm font-bold text-accent">{row.percent}%</span>
                        <span className="w-32 text-right text-sm font-bold text-accent">{formatRupiah(row.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB PRODUCTION TASK */}
      {/* ========================================================================= */}
      {activeMainTab === 'task' && (
        <div className="space-y-6">
          {/* Card 1: Task Progress matching screenshot 1:1 */}
          <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-primary">
              Task Progress
            </h3>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                Overall Completion
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {completedTasksCount} / {totalTasksCount} tasks completed
              </p>
            </div>

            {/* Thin Blue Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-3">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>

            {/* Horizontal Status Badges below progress bar */}
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-bold border border-emerald-100">
                {completedTasksCount} DONE
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[10px] sm:text-xs font-bold border border-orange-100">
                {tasks.filter((t) => t.status === 'IN_PROGRESS').length} IN PROGRESS
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] sm:text-xs font-bold border border-slate-200">
                {tasks.filter((t) => t.status === 'TODO').length} TO DO
              </span>
            </div>
          </div>

          {/* Card 2: Task Checklist matching screenshot 1:1 */}
          <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-primary">
                Task Checklist
              </h3>
              {!isProduksi && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  Add
                </Button>
              )}
            </div>

            {tasks.length === 0 ? (
              <EmptyState message="Belum ada task checklist yang ditambahkan untuk proyek ini." />
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const isDone = task.status === 'DONE';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-4 sm:p-5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-white border-slate-200/80'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className="mt-0.5 cursor-pointer shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-primary transition-colors" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <p
                            className={`text-sm sm:text-base font-bold ${
                              isDone ? 'line-through text-slate-300 font-normal' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                              {task.description}
                            </p>
                          )}

                          <div className={`flex items-center gap-3 pt-1 text-xs ${isDone ? 'text-slate-300' : 'text-slate-400'}`}>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className={`w-3.5 h-3.5 ${isDone ? 'text-slate-300' : 'text-slate-400'}`} />
                              <span>{formatDateID(task.dueDate)}</span>
                            </span>

                            {/* Overdue Alert Badge */}
                            {idx === 2 && !isDone && (
                              <span className="flex items-center gap-1.5 text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span>1 November</span>
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              </span>
                            )}

                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isDone ? 'bg-blue-50/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {task.picName || 'Anton W.'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isProduksi && (
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isDone ? 'text-amber-300 hover:bg-amber-50/50' : 'text-amber-500 hover:bg-amber-50'
                            }`}
                            title="Edit Task"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTaskId(task.id)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isDone ? 'text-red-300 hover:bg-red-50/50' : 'text-red-500 hover:bg-red-50'
                            }`}
                            title="Hapus Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: General Brief matching screenshot 1:1 */}
          <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-primary">
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

      {/* Add Production Cost Item Modal */}
      <AddCostItemModal
        isOpen={isAddCostModalOpen}
        onClose={() => setIsAddCostModalOpen(false)}
        onSave={handleAddCostItem}
        existingCategories={Array.from(new Set(costItems.map((i) => i.category)))}
      />

      {/* Edit Production Cost Item Modal */}
      <AddCostItemModal
        isOpen={!!editingCostItem}
        onClose={() => setEditingCostItem(null)}
        onSave={handleUpdateCostItem}
        existingCategories={Array.from(new Set(costItems.map((i) => i.category)))}
        editItem={editingCostItem || undefined}
      />

      {/* Delete Production Cost Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCostItemId}
        onClose={() => setDeleteCostItemId(null)}
        onConfirm={handleDeleteCostItem}
        title="Hapus Item Production Cost"
        message="Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Add Quotation Item Modal */}
      <AddQuotationItemModal
        isOpen={isAddQuotationModalOpen}
        onClose={() => setIsAddQuotationModalOpen(false)}
        onSave={handleAddQuotationItem}
      />

      {/* Edit Quotation Item Modal */}
      <AddQuotationItemModal
        isOpen={!!editingQuotationItem}
        onClose={() => setEditingQuotationItem(null)}
        onSave={handleUpdateQuotationItem}
        editItem={editingQuotationItem || undefined}
      />

      {/* Delete Quotation Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteQuotationItemId}
        onClose={() => setDeleteQuotationItemId(null)}
        onConfirm={handleDeleteQuotationItem}
        title="Hapus Item Quotation"
        message="Apakah Anda yakin ingin menghapus item quotation ini?"
      />

      {/* Add Invoice Item Modal */}
      <AddInvoiceItemModal
        isOpen={isAddInvoiceModalOpen}
        onClose={() => setIsAddInvoiceModalOpen(false)}
        onSave={handleAddInvoiceItem}
      />

      {/* Edit Invoice Item Modal */}
      <AddInvoiceItemModal
        isOpen={!!editingInvoiceItem}
        onClose={() => setEditingInvoiceItem(null)}
        onSave={handleUpdateInvoiceItem}
        editItem={editingInvoiceItem || undefined}
      />

      {/* Delete Invoice Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteInvoiceItemId}
        onClose={() => setDeleteInvoiceItemId(null)}
        onConfirm={handleDeleteInvoiceItem}
        title="Hapus Item Invoice"
        message="Apakah Anda yakin ingin menghapus item invoice ini?"
      />

      {/* Import Quotation to Invoice Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmImportOpen}
        onClose={() => setIsConfirmImportOpen(false)}
        onConfirm={executeImportFromQuotation}
        title="Import Data Quotation"
        message="Import akan memperbarui data Invoice dengan data rincian terbaru dari Quotation. Apakah Anda yakin?"
        confirmText="Ya, Import Data"
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={handleSaveTask}
      />

      {/* Edit Task Modal */}
      <AddTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        editTask={editingTask || undefined}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Hapus Task Production"
        message="Apakah Anda yakin ingin menghapus task ini dari checklist produksi?"
      />

      {/* Add / Edit Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen || !!editingPayment}
        onClose={() => {
          setIsAddPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        editItem={editingPayment || undefined}
      />

      {/* Delete Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={handleDeletePayment}
        title="Hapus Pembayaran"
        message="Apakah Anda yakin ingin menghapus riwayat pembayaran ini?"
      />
    </div>
  );
};

export default DetailProjectTabs;
