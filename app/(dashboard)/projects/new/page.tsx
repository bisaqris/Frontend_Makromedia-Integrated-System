'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Combobox from '@/components/ui/Combobox';
import Button from '@/components/ui/Button';
import DatePickerInput from '@/components/ui/DatePickerInput';
import projectService from '@/lib/services/projectService';
import { clientService } from '@/lib/services/clientService';
import { userService } from '@/lib/services/userService';
import { ProjectCategory } from '@/types/project';
import { ClientCompany, ClientPIC } from '@/types/client';
import { User } from '@/types/user';
import { showToast } from '@/components/ui/Toast';
import { formatDateID, formatNominal, isValidUrl, normalizeUrl } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  FileText,
  AlignLeft,
  Link as LinkIcon,
} from 'lucide-react';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const CATEGORY_OPTIONS = [
  { value: 'Event', label: 'Event' },
  { value: 'Corporate Video', label: 'Corporate Video' },
  { value: 'Film Production', label: 'Film Production' },
  { value: 'Content Video/Marketing', label: 'Content Video/Marketing' },
  { value: 'Wedding', label: 'Wedding' },
];

const CLIENT_TYPE_OPTIONS = [
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Government', label: 'Government' },
  { value: 'Personal', label: 'Personal' },
];

const PARTNERSHIP_OPTIONS = [
  { value: 'Direct', label: 'Direct' },
  { value: 'Agency', label: 'Agency' },
];

interface AdditionalLinkItem {
  id: string;
  url: string;
}

export default function AddProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [category, setCategory] = useState('Event');
  const [pmId, setPmId] = useState('');
  const [clientType, setClientType] = useState('Corporate');
  const [partnershipModel, setPartnershipModel] = useState('Direct');
  const [companyId, setCompanyId] = useState('');
  const [picId, setPicId] = useState('');

  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [pics, setPics] = useState<ClientPIC[]>([]);
  const [projectManagers, setProjectManagers] = useState<User[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadReferenceData = async () => {
      const [companyList, picList, pmList] = await Promise.all([
        clientService.getCompanies(),
        clientService.getPICs(),
        userService.getProjectManagers(),
      ]);

      if (!isMounted) return;

      setCompanies(companyList);
      setPics(picList);
      setProjectManagers(pmList);
      if (companyList.length > 0) {
        const firstComp = companyList[0];
        setCompanyId(firstComp.id);
        const relatedPic =
          picList.find((p) => p.clientId === firstComp.id) ||
          firstComp.pics?.[0] ||
          picList.find(
            (p) =>
              p.company &&
              firstComp.name &&
              p.company.trim().toLowerCase() === firstComp.name.trim().toLowerCase()
          );
        if (relatedPic) {
          setPicId(relatedPic.id);
        } else {
          setPicId('');
        }
      }
      if (pmList.length > 0) setPmId(pmList[0].id);
    };

    loadReferenceData().catch(() => {
      showToast.error('Gagal memuat data referensi client / project manager.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [projectName, setProjectName] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [eventDate, setEventDate] = useState(today);
  const [projectStarts, setProjectStarts] = useState(today);
  const [deadline, setDeadline] = useState(today);
  const [venue, setVenue] = useState('');
  const [contractValue, setContractValue] = useState<string>('0');

  const [deliverablesLink, setDeliverablesLink] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLinkItem[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Selected company and auto-fetched PIC Client
  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedPic =
    pics.find((p) => p.clientId === companyId) ||
    selectedCompany?.pics?.[0] ||
    pics.find(
      (p) =>
        p.company &&
        selectedCompany?.name &&
        p.company.trim().toLowerCase() === selectedCompany.name.trim().toLowerCase()
    ) ||
    pics.find((p) => p.id === picId);
  const selectedPM = projectManagers.find((pm) => pm.id === pmId);

  const handleAddLink = () => {
    // 1. Validasi Deliverables Link terlebih dahulu jika belum diisi atau tidak valid
    if (!deliverablesLink.trim()) {
      showToast.error('Isi Deliverables Link dengan URL valid terlebih dahulu sebelum menambah link baru.');
      const el = document.getElementById('deliverables-link-input') as HTMLInputElement | null;
      el?.focus();
      return;
    }
    if (!isValidUrl(deliverablesLink)) {
      showToast.error('Format Deliverables Link tidak valid. Harus diawali http:// atau https://');
      const el = document.getElementById('deliverables-link-input') as HTMLInputElement | null;
      el?.focus();
      return;
    }

    // 2. Validasi link tambahan sebelumnya jika sudah ada
    for (const link of additionalLinks) {
      if (!link.url.trim()) {
        showToast.error('Harap lengkapi link tambahan sebelumnya sebelum menambah baris baru.');
        const el = document.getElementById(`additional-link-${link.id}`) as HTMLInputElement | null;
        el?.focus();
        return;
      }
      if (!isValidUrl(link.url)) {
        showToast.error('Format URL link tambahan sebelumnya tidak valid. Harus diawali http:// atau https://');
        const el = document.getElementById(`additional-link-${link.id}`) as HTMLInputElement | null;
        el?.focus();
        return;
      }
    }

    setAdditionalLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, url: '' },
    ]);
  };

  const handleRemoveLink = (id: string) => {
    setAdditionalLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    const today = new Date().toISOString().split('T')[0];

    if (!projectName.trim()) {
      errs.projectName = 'Project Name wajib diisi.';
    } else if (projectName.trim().length < 3) {
      errs.projectName = 'Project Name minimal 3 karakter.';
    }

    if (!companyId) {
      errs.companyId = 'Pilih Company Client.';
    }

    if (!selectedPic) {
      errs.picId = 'Company yang dipilih belum memiliki data PIC Client.';
    }

    if (!eventDate) {
      errs.eventDate = 'Event date wajib diisi.';
    } else if (eventDate < today) {
      errs.eventDate = 'Event date tidak boleh sebelum hari ini.';
    }

    if (!projectStarts) {
      errs.projectStarts = 'Tanggal mulai proyek wajib diisi.';
    } else if (projectStarts < today) {
      errs.projectStarts = 'Tanggal mulai proyek tidak boleh sebelum hari ini.';
    } else if (eventDate && projectStarts > eventDate) {
      errs.projectStarts = 'Tanggal mulai proyek tidak boleh melebihi Event Date.';
    }

    if (!deadline) {
      errs.deadline = 'Deadline proyek wajib diisi.';
    } else if (projectStarts && deadline < projectStarts) {
      errs.deadline = 'Deadline tidak boleh sebelum tanggal mulai proyek.';
    } else if (eventDate && deadline > eventDate) {
      errs.deadline = 'Deadline tidak boleh melebihi Event Date.';
    }

    const rawVal = Number(contractValue.replace(/\D/g, '')) || 0;
    if (rawVal <= 0) {
      errs.contractValue = 'Nilai kontrak harus lebih besar dari Rp 0.';
    }

    // Validasi URL Deliverables Link jika diisi
    if (deliverablesLink.trim() && !isValidUrl(deliverablesLink)) {
      errs.deliverablesLink = 'Format Deliverables Link tidak valid (harus diawali http:// atau https://).';
    }

    // Validasi URL Additional Links jika ada
    for (const link of additionalLinks) {
      if (link.url.trim() && !isValidUrl(link.url)) {
        errs.additionalLinks = 'Format Additional Link tidak valid (harus diawali http:// atau https://).';
        break;
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast.error('Mohon lengkapi dan periksa kembali data proyek.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setCurrentStep(2);
  };

  const handleCreateProject = async (status: 'NEW' | 'DRAFT' = 'NEW') => {
    const effectivePic = selectedPic;
    if (!effectivePic) {
      showToast.error('Pilih Company client yang memiliki PIC terdaftar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await projectService.createProject({
        name: projectName,
        category: category as ProjectCategory,
        clientId: effectivePic.id,
        clientName: selectedCompany?.name || effectivePic.company || '',
        clientType,
        partnershipModel,
        picClientId: effectivePic.id,
        picClientName: effectivePic
          ? `${effectivePic.name}${effectivePic.position ? ` (${effectivePic.position})` : ''}`
          : '',
        projectManagerId: pmId || undefined,
        projectManagerName: selectedPM?.name || '',
        startDate: projectStarts,
        endDate: deadline,
        projectStarts: eventDate,
        deadline,
        venue,
        budget: Number(contractValue) || 0,
        deliverablesLink: deliverablesLink.trim() ? normalizeUrl(deliverablesLink) : '',
        additionalLinks: additionalLinks
          .filter((l) => l.url.trim())
          .map((l) => ({ ...l, url: normalizeUrl(l.url) })),
        status,
      });

      showToast.success(status === 'DRAFT' ? 'Draft proyek berhasil disimpan.' : 'Proyek baru berhasil dibuat!');
      router.push('/projects');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal membuat proyek baru.';
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowed={['DIREKTUR', 'SALES', 'FINANCE']} fallbackMode="message">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Step Indicator Header Card (Connector line turns blue when currentStep === 2) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          {/* Step 1 Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">Input Data</span>
              <span className="text-xs text-slate-400 font-normal mt-0.5">Step 1</span>
            </div>
          </div>

          {/* Connecting Line (Turns blue on Step 2) */}
          <div
            className={`h-0.5 flex-1 mx-4 sm:mx-8 hidden sm:block transition-colors duration-300 ${
              currentStep === 2 ? 'bg-primary' : 'bg-slate-200'
            }`}
          />

          {/* Step 2 Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                currentStep === 2
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlignLeft className="w-6 h-6 text-current" />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold leading-tight ${
                  currentStep === 2 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Summary
              </span>
              <span className="text-xs text-slate-400 font-normal mt-0.5">Step 2</span>
            </div>
          </div>
        </div>

        {/* STEP 1: INPUT DATA */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-3">
                Internal Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Project Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORY_OPTIONS}
                  required
                />
                <Select
                  label="Project Manager"
                  value={pmId}
                  onChange={(e) => setPmId(e.target.value)}
                  options={[
                    { value: '', label: 'Pilih Project Manager...' },
                    ...projectManagers.map((pm) => ({
                      value: pm.id,
                      label: `${pm.name}${pm.email ? ` (${pm.email})` : ''}`,
                    })),
                  ]}
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-3">
                Client Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Client Type"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  options={CLIENT_TYPE_OPTIONS}
                  required
                />
                <Select
                  label="Partnership Model"
                  value={partnershipModel}
                  onChange={(e) => setPartnershipModel(e.target.value)}
                  options={PARTNERSHIP_OPTIONS}
                  required
                />
                <Combobox
                  label="Company Name"
                  value={companyId}
                  error={fieldErrors.companyId}
                  onChange={(nextCompanyId) => {
                    setCompanyId(nextCompanyId);
                    if (fieldErrors.companyId) {
                      setFieldErrors((prev) => ({ ...prev, companyId: '' }));
                    }
                    const nextComp = companies.find((c) => c.id === nextCompanyId);
                    const relatedPic =
                      pics.find((p) => p.clientId === nextCompanyId) ||
                      nextComp?.pics?.[0] ||
                      pics.find(
                        (p) =>
                          p.company &&
                          nextComp?.name &&
                          p.company.trim().toLowerCase() === nextComp.name.trim().toLowerCase()
                      );
                    if (relatedPic) {
                      setPicId(relatedPic.id);
                      setFieldErrors((prev) => ({ ...prev, picId: '' }));
                    } else {
                      setPicId('');
                    }
                  }}
                  options={
                    companies.length > 0
                      ? companies.map((c) => ({ value: c.id, label: c.name }))
                      : [{ value: '', label: 'Memuat Company...' }]
                  }
                  placeholder="Pilih atau cari Company Client..."
                  emptyText="Company tidak ditemukan"
                  required
                />
                <div className="flex flex-col">
                  <Input
                    label="PIC Client"
                    value={
                      selectedPic
                        ? `${selectedPic.name}${selectedPic.position ? ` (${selectedPic.position})` : ''}`
                        : companyId
                          ? 'Belum ada PIC terdaftar untuk perusahaan ini'
                          : ''
                    }
                    disabled
                    readOnly
                    placeholder={companyId ? 'Memuat data PIC...' : 'Otomatis terisi setelah memilih Company'}
                    error={fieldErrors.picId}
                    className="bg-slate-50 text-slate-700 cursor-not-allowed font-medium text-xs sm:text-sm h-10"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedPic
                      ? `Auto-fetched • ${selectedPic.name}${selectedPic.phone ? ` • ${selectedPic.phone}` : ''}${selectedPic.email ? ` • ${selectedPic.email}` : ''}`
                      : 'Otomatis terisi dari PIC yang terhubung dengan Company Client.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-3">
                Project Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Name"
                  placeholder="e.g. Q3 Marketing Campaign"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (fieldErrors.projectName) setFieldErrors((prev) => ({ ...prev, projectName: '' }));
                  }}
                  error={fieldErrors.projectName}
                  required
                />
                <div>
                  <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                    Event Date <span className="text-red-500 ml-1">*</span>
                  </label>
                  <DatePickerInput
                    id="eventDate"
                    name="eventDate"
                    min={today}
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      if (fieldErrors.eventDate) setFieldErrors((prev) => ({ ...prev, eventDate: '' }));
                    }}
                    error={fieldErrors.eventDate}
                    placeholder="Pilih tanggal event..."
                    required
                  />
                  {fieldErrors.eventDate && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.eventDate}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                    Project Date Starts <span className="text-red-500 ml-1">*</span>
                  </label>
                  <DatePickerInput
                    id="projectStarts"
                    name="projectStarts"
                    min={today}
                    value={projectStarts}
                    onChange={(e) => {
                      setProjectStarts(e.target.value);
                      if (fieldErrors.projectStarts) setFieldErrors((prev) => ({ ...prev, projectStarts: '' }));
                    }}
                    error={fieldErrors.projectStarts}
                    placeholder="Pilih tanggal mulai..."
                    required
                  />
                  {fieldErrors.projectStarts && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.projectStarts}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                    Project Deadlines <span className="text-red-500 ml-1">*</span>
                  </label>
                  <DatePickerInput
                    id="deadline"
                    name="deadline"
                    min={projectStarts || today}
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (fieldErrors.deadline) setFieldErrors((prev) => ({ ...prev, deadline: '' }));
                    }}
                    error={fieldErrors.deadline}
                    placeholder="Pilih deadline..."
                    required
                  />
                  {fieldErrors.deadline && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.deadline}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                    Venue / Location <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    placeholder="e.g. Malang, East Java"
                    value={venue}
                    onChange={(e) => {
                      setVenue(e.target.value);
                      if (fieldErrors.venue) setFieldErrors((prev) => ({ ...prev, venue: '' }));
                    }}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-hidden ${
                      fieldErrors.venue ? 'border-red-500' : 'border-slate-200'
                    }`}
                    required
                  />
                  {fieldErrors.venue && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.venue}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                    Contract Value <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-xs font-bold text-slate-500 pointer-events-none">Rp</span>
                    <input
                      type="text"
                      id="contractValue"
                      name="contractValue"
                      placeholder="0"
                      value={formatNominal(contractValue)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setContractValue(raw);
                        if (fieldErrors.contractValue) setFieldErrors((prev) => ({ ...prev, contractValue: '' }));
                      }}
                      className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-hidden ${
                        fieldErrors.contractValue ? 'border-red-500' : 'border-slate-200'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.contractValue && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.contractValue}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-primary">
                  Progress Link
                </h3>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddLink}
                >
                  Add
                </Button>
              </div>

              {/* Deliverables Link Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverables Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="deliverables-link-input"
                      type="text"
                      placeholder="https://..."
                      value={deliverablesLink}
                      onChange={(e) => {
                        setDeliverablesLink(e.target.value);
                        if (fieldErrors.deliverablesLink) setFieldErrors((prev) => ({ ...prev, deliverablesLink: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2 text-xs bg-white border rounded-xl focus:outline-hidden text-slate-800 font-medium transition-colors ${
                        (deliverablesLink.trim() && !isValidUrl(deliverablesLink)) || fieldErrors.deliverablesLink
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:border-primary'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('deliverables-link-input') as HTMLInputElement | null;
                      el?.focus();
                      el?.select();
                    }}
                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Edit Link (Klik untuk mengedit url)"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliverablesLink('');
                      if (fieldErrors.deliverablesLink) setFieldErrors((prev) => ({ ...prev, deliverablesLink: '' }));
                    }}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Clear Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {((deliverablesLink.trim() && !isValidUrl(deliverablesLink)) || fieldErrors.deliverablesLink) && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">
                    {fieldErrors.deliverablesLink || 'Format URL tidak valid. Harus diawali dengan http:// atau https://'}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Bisa berupa link Google Drive, YouTube, Figma, Dropbox, atau platform lainnya.
                </p>
              </div>

              {additionalLinks.map((link) => {
                const isInvalid = link.url.trim() !== '' && !isValidUrl(link.url);
                return (
                  <div key={link.id} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Additional Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id={`additional-link-${link.id}`}
                          type="text"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setAdditionalLinks((prev) =>
                              prev.map((l) => (l.id === link.id ? { ...l, url: newUrl } : l))
                            );
                          }}
                          className={`w-full pl-10 pr-4 py-2 text-xs bg-white border rounded-xl focus:outline-hidden text-slate-800 font-medium transition-colors ${
                            isInvalid
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-slate-200 focus:border-primary'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`additional-link-${link.id}`) as HTMLInputElement | null;
                          el?.focus();
                          el?.select();
                        }}
                        className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Edit Link (Klik untuk mengedit url)"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {isInvalid && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">
                        Format URL tidak valid. Harus diawali dengan http:// atau https://
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 1 Bottom Buttons */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => handleCreateProject('DRAFT')}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: SUMMARY */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h2 className="text-base font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Summary
              </h2>

              <div className="space-y-6">
                {/* 1. Internal Data Box */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                    Internal Data
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Project Category</span>
                      <p className="text-sm font-bold text-slate-800">{category}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Project Manager</span>
                      <p className="text-sm font-bold text-slate-800">{selectedPM?.name || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Client Data Box */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                    Client Data
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Client Type</span>
                      <p className="text-sm font-bold text-slate-800">{clientType}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Partnership Model</span>
                      <p className="text-sm font-bold text-slate-800">{partnershipModel}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Company Name</span>
                      <p className="text-sm font-bold text-slate-800">{selectedCompany?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">PIC Client</span>
                      <p className="text-sm font-bold text-slate-800">{selectedPic ? selectedPic.name : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Project Data Box */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                    Project Data
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Project Name</span>
                      <p className="text-base font-bold text-slate-900">{projectName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Event Date</span>
                      <p className="text-sm font-bold text-slate-800">{formatDateID(eventDate)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Project Date Start</span>
                      <p className="text-sm font-bold text-slate-800">{formatDateID(projectStarts)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Project Deadlines</span>
                      <p className="text-sm font-bold text-slate-800">{formatDateID(deadline)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Venue / Location</span>
                      <p className="text-sm font-bold text-slate-800">{venue || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Contract Value</span>
                      <p className="text-base font-bold text-slate-900">{formatRupiah(Number(contractValue) || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Progress Link Box */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                    Progress Link
                  </h3>
                  <div className="text-xs space-y-3">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Deliverables Link</span>
                      {deliverablesLink ? (
                        <a
                          href={deliverablesLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline text-sm font-bold underline break-all block"
                        >
                          {deliverablesLink}
                        </a>
                      ) : (
                        <p className="text-slate-400 text-sm italic">Belum ada link terlampir</p>
                      )}
                    </div>

                    {additionalLinks.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-medium block mb-1">Additional Links</span>
                        {additionalLinks.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline text-sm font-bold block break-all"
                          >
                            {link.url || '-'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Bottom Buttons */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => handleCreateProject('DRAFT')}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleCreateProject('NEW')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Membuat Proyek...</span>
                    </div>
                  ) : (
                    <span>Create Project</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
