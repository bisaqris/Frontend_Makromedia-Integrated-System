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
import { Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

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
  title: string;
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
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Selected company and filtered PICs
  const selectedCompany = mockClientCompanies.find((c) => c.id === companyId) || mockClientCompanies[0];
  const filteredPics = mockClientPICs.filter((p) => p.clientId === companyId);
  const selectedPic = mockClientPICs.find((p) => p.id === picId) || filteredPics[0];

  const handleAddLink = () => {
    if (!newLinkTitle || !newLinkUrl) {
      showToast.error('Judul dan URL link wajib diisi.');
      return;
    }
    setAdditionalLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}`, title: newLinkTitle, url: newLinkUrl },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    showToast.success('Link tambahan berhasil ditambahkan.');
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
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-900">Add New Project</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi formulir 2 langkah di bawah ini untuk membuat proyek baru
          </p>

          {/* 2 Step Indicator */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  currentStep === 1
                    ? 'bg-primary text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${currentStep === 1 ? 'text-primary' : 'text-slate-700'}`}>
                Input Data
              </span>
            </div>

            <div className="h-2 flex-1 max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-primary transition-all duration-300 ${
                  currentStep === 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  currentStep === 2
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <span className={`text-xs font-bold ${currentStep === 2 ? 'text-primary' : 'text-slate-400'}`}>
                Summary
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: INPUT DATA */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Card a: Internal Data */}
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

            {/* Card b: Client Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Client Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Card c: Project Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Project Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Project Name"
                  placeholder="Masukkan nama proyek..."
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
                  placeholder="Lokasi event / shooting..."
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contract Value (Rupiah)
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

            {/* Card d: Progress Link */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
                Progress Link
              </h3>

              <Input
                label="Deliverables Link (Utama)"
                placeholder="https://drive.google.com/drive/folders/..."
                value={deliverablesLink}
                onChange={(e) => setDeliverablesLink(e.target.value)}
              />

              {/* Dynamic Additional Links */}
              <div className="pt-2 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">Additional Link:</span>

                {additionalLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{link.title}:</span>{' '}
                      <span className="text-accent break-all">{link.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Form Add Additional Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Input
                    placeholder="Judul Link (mis. Asset LED)..."
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <Input
                    placeholder="URL Link..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                </div>

                <Button variant="outline" size="sm" type="button" onClick={handleAddLink}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add Additional Link
                </Button>
              </div>
            </div>

            {/* Step 1 Bottom Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => router.push('/projects')}>
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => handleCreateProject('DRAFT')}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
                <Button variant="primary" onClick={handleNextStep}>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SUMMARY */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Summary Ringkasan Proyek
              </h2>

              <div className="space-y-6 text-xs text-slate-700">
                {/* Summary Internal */}
                <div>
                  <h4 className="font-bold text-primary uppercase text-[11px] mb-2">1. Internal Data</h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400">Category:</span>
                      <p className="font-semibold">{category}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Project Manager:</span>
                      <p className="font-semibold">Andi PM (Project Manager)</p>
                    </div>
                  </div>
                </div>

                {/* Summary Client */}
                <div>
                  <h4 className="font-bold text-primary uppercase text-[11px] mb-2">2. Client Data</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400">Type:</span>
                      <p className="font-semibold">{clientType}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Model:</span>
                      <p className="font-semibold">{partnershipModel}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Company:</span>
                      <p className="font-semibold">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">PIC:</span>
                      <p className="font-semibold">{selectedPic ? selectedPic.name : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Project */}
                <div>
                  <h4 className="font-bold text-primary uppercase text-[11px] mb-2">3. Project Data</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400">Project Name:</span>
                      <p className="font-bold text-slate-900">{projectName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Event Date:</span>
                      <p className="font-semibold">{eventDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Starts - Deadline:</span>
                      <p className="font-semibold">{projectStarts} - {deadline}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Venue:</span>
                      <p className="font-semibold">{venue || 'TBA'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Contract Value:</span>
                      <p className="font-extrabold text-primary">Rp {Number(contractValue).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Bottom Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => router.push('/projects')}>
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-orange-50"
                  onClick={() => handleCreateProject('DRAFT')}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleCreateProject('QUOTATION_PENDING')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Membuat Proyek...</span>
                    </>
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
