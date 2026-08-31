'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import projectService from '@/lib/services/projectService';
import { mockClientCompanies, mockClientPICs } from '@/lib/mock/clients.mock';
import { ProjectCategory } from '@/types/project';
import { showToast } from '@/components/ui/Toast';
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

const CATEGORY_OPTIONS = [
  { value: 'Event', label: 'Event' },
  { value: 'Corporate Video', label: 'Corporate Video' },
  { value: 'Film Production', label: 'Film Production' },
  { value: 'Content Video/Marketing', label: 'Content Video/Marketing' },
  { value: 'Wedding', label: 'Wedding' },
];

const PM_OPTIONS = [
  { value: 'usr-project_manager', label: 'Andi PM (Project Manager)' },
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
  const [pmId, setPmId] = useState('usr-project_manager');
  const [clientType, setClientType] = useState('Corporate');
  const [partnershipModel, setPartnershipModel] = useState('Direct');
  const [companyId, setCompanyId] = useState('cli-1');
  const [picId, setPicId] = useState('pic-1');

  const [projectName, setProjectName] = useState('');
  const [eventDate, setEventDate] = useState('2026-05-04');
  const [projectStarts, setProjectStarts] = useState('2026-04-20');
  const [deadline, setDeadline] = useState('2026-05-15');
  const [venue, setVenue] = useState('');
  const [contractValue, setContractValue] = useState<string>('350000000');

  const [deliverablesLink, setDeliverablesLink] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLinkItem[]>([]);

  // Selected company and filtered PICs
  const selectedCompany = mockClientCompanies.find((c) => c.id === companyId) || mockClientCompanies[0];
  const filteredPics = mockClientPICs.filter((p) => p.clientId === companyId);
  const selectedPic = mockClientPICs.find((p) => p.id === picId) || filteredPics[0];

  const handleAddLink = () => {
    setAdditionalLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, url: '' },
    ]);
  };

  const handleRemoveLink = (id: string) => {
    setAdditionalLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleNextStep = () => {
    if (!projectName.trim()) {
      showToast.error('Project Name wajib diisi.');
      return;
    }
    setCurrentStep(2);
  };

  const handleCreateProject = async (status: 'QUOTATION_PENDING' | 'DRAFT' = 'QUOTATION_PENDING') => {
    setIsSubmitting(true);
    try {
      await projectService.createProject({
        name: projectName,
        category: category as ProjectCategory,
        clientId: companyId,
        clientName: selectedCompany.name,
        clientType,
        partnershipModel,
        picClientId: picId,
        picClientName: selectedPic ? `${selectedPic.name} (${selectedPic.position})` : '',
        projectManagerId: pmId,
        projectManagerName: 'Andi PM (Project Manager)',
        startDate: eventDate,
        endDate: eventDate,
        projectStarts,
        deadline,
        venue,
        budget: Number(contractValue) || 0,
        deliverablesLink,
        additionalLinks,
        status,
      });

      showToast.success(status === 'DRAFT' ? 'Draft proyek berhasil disimpan.' : 'Proyek baru berhasil dibuat!');
      router.push('/projects');
    } catch {
      showToast.error('Gagal membuat proyek baru.');
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
            {/* Card 1: Internal Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Internal Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Project Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORY_OPTIONS}
                />
                <Select
                  label="Project Manager"
                  value={pmId}
                  onChange={(e) => setPmId(e.target.value)}
                  options={PM_OPTIONS}
                />
              </div>
            </div>

            {/* Card 2: Client Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Client Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Client Type"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  options={CLIENT_TYPE_OPTIONS}
                />
                <Select
                  label="Partnership Model"
                  value={partnershipModel}
                  onChange={(e) => setPartnershipModel(e.target.value)}
                  options={PARTNERSHIP_OPTIONS}
                />
                <Select
                  label="Company Name"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  options={mockClientCompanies.map((c) => ({ value: c.id, label: c.name }))}
                />
                <Select
                  label="PIC Client"
                  value={picId}
                  onChange={(e) => setPicId(e.target.value)}
                  options={filteredPics.map((p) => ({ value: p.id, label: `${p.name} (${p.position})` }))}
                />
              </div>
            </div>

            {/* Card 3: Project Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Project Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Name"
                  placeholder="e.g. Q3 Marketing Campaign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
                <Input
                  label="Event Date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                <Input
                  label="Project Date Starts"
                  type="date"
                  value={projectStarts}
                  onChange={(e) => setProjectStarts(e.target.value)}
                />
                <Input
                  label="Project Deadlines"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <Input
                  label="Venue / Location"
                  placeholder="e.g. Malang, East Java"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contract Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Progress Link */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
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
                      placeholder="https://drive.google.com/..."
                      value={deliverablesLink}
                      onChange={(e) => setDeliverablesLink(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-primary rounded-xl focus:outline-hidden text-slate-800 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('deliverables-link-input')?.focus()}
                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Edit Link"
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
                  Google Drive, YouTube, or other platforms. Can be updated anytime from the Project List.
                </p>
              </div>

              {/* Dynamic Additional Links list (Editable inputs) */}
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
                      onClick={() => document.getElementById(`additional-link-${link.id}`)?.focus()}
                      className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit Link"
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
                      <p className="text-sm font-bold text-slate-800">Andi PM (Project Manager)</p>
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
                      <p className="text-sm font-bold text-slate-800">{selectedCompany.name}</p>
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
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleCreateProject('QUOTATION_PENDING')}
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
