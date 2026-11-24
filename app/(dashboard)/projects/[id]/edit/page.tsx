'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import DatePickerInput from '@/components/ui/DatePickerInput';
import projectService from '@/lib/services/projectService';
import { clientService } from '@/lib/services/clientService';
import { userService } from '@/lib/services/userService';
import { Project, ProjectCategory, ProjectStatus } from '@/types/project';
import { ClientCompany, ClientPIC } from '@/types/client';
import { User } from '@/types/user';
import { showToast } from '@/components/ui/Toast';
import { formatNominal, toInputDateFormat } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react';

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

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'On Progress' },
  { value: 'DONE', label: 'Done' },
];

interface AdditionalLinkItem {
  id: string;
  url: string;
}

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [category, setCategory] = useState<ProjectCategory>('Event');
  const [pmId, setPmId] = useState('');
  const [clientType, setClientType] = useState('Corporate');
  const [partnershipModel, setPartnershipModel] = useState('Direct');
  const [companyId, setCompanyId] = useState('');
  const [picId, setPicId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('NEW');

  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [pics, setPics] = useState<ClientPIC[]>([]);
  const [projectManagers, setProjectManagers] = useState<User[]>([]);

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

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [project, companyList, picList, pmList] = await Promise.all([
          projectService.getProjectById(id),
          clientService.getCompanies(),
          clientService.getPICs(),
          userService.getProjectManagers(),
        ]);

        if (!isMounted) return;

        setCompanies(companyList);
        setPics(picList);
        setProjectManagers(pmList);

        if (project) {
          setProjectName(project.name || '');
          setCategory((project.category as ProjectCategory) || 'Event');
          setClientType(project.clientType || 'Corporate');
          setPartnershipModel(project.partnershipModel || 'Direct');
          setPmId(project.projectManagerId || '');
          setStatus(project.status || 'NEW');

          // Match company & PIC
          if (project.clientId) {
            setCompanyId(project.clientId);
          } else if (companyList.length > 0) {
            setCompanyId(companyList[0].id);
          }

          if (project.picClientId) {
            setPicId(project.picClientId);
          } else if (picList.length > 0) {
            setPicId(picList[0].id);
          }

          const rawEvent = toInputDateFormat(project.projectStarts || project.startDate);
          const rawStart = toInputDateFormat(project.startDate);
          const rawEnd = toInputDateFormat(project.endDate || project.deadline);

          setEventDate(rawEvent || today);
          setProjectStarts(rawStart || today);
          setDeadline(rawEnd || today);
          setVenue(project.venue || '');
          setContractValue(String(project.budget || 0));
          setDeliverablesLink(project.deliverablesLink || '');
          if (project.additionalLinks && project.additionalLinks.length > 0) {
            setAdditionalLinks(
              project.additionalLinks.map((l) => ({ id: l.id, url: l.url }))
            );
          }
        }
      } catch {
        showToast.error('Gagal memuat detail proyek untuk diedit.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [id, today]);

  const filteredPics = pics.filter((p) => p.clientId === companyId);
  const selectedPic = pics.find((p) => p.id === picId) || filteredPics[0];
  const selectedPM = projectManagers.find((pm) => pm.id === pmId);

  const handleAddLink = () => {
    setAdditionalLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, url: '' },
    ]);
  };

  const handleRemoveLink = (linkId: string) => {
    setAdditionalLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!projectName.trim()) {
      errs.projectName = 'Project Name wajib diisi.';
    } else if (projectName.trim().length < 3) {
      errs.projectName = 'Project Name minimal 3 karakter.';
    }

    if (!eventDate) {
      errs.eventDate = 'Event date wajib diisi.';
    }

    if (!projectStarts) {
      errs.projectStarts = 'Tanggal mulai proyek wajib diisi.';
    }

    if (!deadline) {
      errs.deadline = 'Deadline proyek wajib diisi.';
    } else if (projectStarts && deadline < projectStarts) {
      errs.deadline = 'Deadline tidak boleh sebelum tanggal mulai proyek.';
    }

    if (!venue.trim()) {
      errs.venue = 'Venue / Lokasi wajib diisi.';
    }

    if (contractValue === '' || Number(contractValue) <= 0) {
      errs.contractValue = 'Nilai kontrak harus lebih besar dari Rp 0.';
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast.error('Mohon periksa isian data proyek yang belum valid.');
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await projectService.updateProject(id, {
        name: projectName.trim(),
        category,
        clientType,
        partnershipModel,
        clientId: companyId || undefined,
        picClientId: selectedPic?.id || picId || undefined,
        projectManagerId: pmId || undefined,
        projectManagerName: selectedPM?.name || '',
        projectStarts: eventDate,
        startDate: projectStarts,
        endDate: deadline,
        deadline,
        venue: venue.trim(),
        budget: Number(contractValue) || 0,
        status,
        deliverablesLink,
        additionalLinks,
      });

      showToast.success('Perubahan proyek berhasil disimpan!');
      router.push('/projects');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal memperbarui proyek.';
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium">Memuat formulir edit proyek...</span>
      </div>
    );
  }

  return (
    <RoleGuard allowed={['DIREKTUR', 'SALES', 'FINANCE']} fallbackMode="message">
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Edit Project
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Perbarui rincian data dan progress proyek
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/projects')}
          >
            Kembali
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Internal Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-3">
              Internal Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Project Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                options={CATEGORY_OPTIONS}
                required
              />
              <Select
                label="Project Manager"
                value={pmId}
                onChange={(e) => setPmId(e.target.value)}
                options={
                  projectManagers.length > 0
                    ? projectManagers.map((pm) => ({ value: pm.id, label: pm.name }))
                    : [{ value: '', label: 'Pilih Project Manager' }]
                }
                required
              />
            </div>
          </div>

          {/* Client Data */}
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
              <Select
                label="Company Name"
                value={companyId}
                onChange={(e) => {
                  const nextCompanyId = e.target.value;
                  setCompanyId(nextCompanyId);
                  const related = pics.filter((p) => p.clientId === nextCompanyId);
                  if (related.length > 0) setPicId(related[0].id);
                }}
                options={
                  companies.length > 0
                    ? companies.map((c) => ({ value: c.id, label: c.name }))
                    : [{ value: '', label: 'Memuat Company...' }]
                }
                required
              />
              <Select
                label="PIC Client"
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                options={
                  filteredPics.length > 0
                    ? filteredPics.map((p) => ({
                        value: p.id,
                        label: p.position ? `${p.name} (${p.position})` : p.name,
                      }))
                    : pics.length > 0
                      ? pics.map((p) => ({
                          value: p.id,
                          label: p.position ? `${p.name} (${p.position})` : p.name,
                        }))
                      : [{ value: '', label: 'Pilih PIC Client' }]
                }
                required
              />
            </div>
          </div>

          {/* Project Data */}
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

              <Select
                label="Status Proyek"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                options={STATUS_OPTIONS}
                required
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 select-none block mb-1.5">
                  Event Date <span className="text-red-500 ml-1">*</span>
                </label>
                <DatePickerInput
                  id="eventDate"
                  name="eventDate"
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
                  min={projectStarts}
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

              <Input
                label="Venue / Location"
                placeholder="e.g. Malang, East Java"
                value={venue}
                onChange={(e) => {
                  setVenue(e.target.value);
                  if (fieldErrors.venue) setFieldErrors((prev) => ({ ...prev, venue: '' }));
                }}
                error={fieldErrors.venue}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Contract Value"
                  placeholder="0"
                  leftIcon={<span className="text-xs font-bold text-slate-500">Rp</span>}
                  value={formatNominal(contractValue)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setContractValue(raw);
                    if (fieldErrors.contractValue) setFieldErrors((prev) => ({ ...prev, contractValue: '' }));
                  }}
                  error={fieldErrors.contractValue}
                  required
                />
              </div>
            </div>
          </div>

          {/* Progress Link */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-primary">
                Progress Link
              </h3>
              <Button
                type="button"
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
                    placeholder="https://drive.google.com/..."
                    value={deliverablesLink}
                    onChange={(e) => setDeliverablesLink(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 focus:border-primary rounded-xl focus:outline-hidden text-slate-800 font-medium"
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
                  onClick={() => setDeliverablesLink('')}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Google Drive, YouTube, or other platforms.
              </p>
            </div>

            {additionalLinks.map((link) => (
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
                      placeholder="https://drive.google.com/..."
                      value={link.url}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setAdditionalLinks((prev) =>
                          prev.map((l) => (l.id === link.id ? { ...l, url: newUrl } : l))
                        );
                      }}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 font-medium"
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
              </div>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
