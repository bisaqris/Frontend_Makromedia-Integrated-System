'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, Search, Check, Lock, Eye, EyeOff, Camera, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import Combobox from '@/components/ui/Combobox';
import DatePickerInput from '@/components/ui/DatePickerInput';
import AddressRegionFields from '@/components/shared/AddressRegionFields';
import { positionService } from '@/lib/services/positionService';
import { skillService } from '@/lib/services/skillService';
import { userService } from '@/lib/services/userService';
import { toInputDateFormat } from '@/lib/utils';
import { Position, Skill } from '@/types/manpower';

const BANK_OPTIONS = [
  { value: 'Bank Central Asia', label: 'Bank Central Asia' },
  { value: 'Bank Mandiri', label: 'Bank Mandiri' },
  { value: 'Bank Rakyat Indonesia', label: 'Bank Rakyat Indonesia' },
  { value: 'Bank Negara Indonesia', label: 'Bank Negara Indonesia' },
  { value: 'Bank Syariah Indonesia', label: 'Bank Syariah Indonesia' },
  { value: 'Bank CIMB Niaga', label: 'Bank CIMB Niaga' },
  { value: 'Bank Permata', label: 'Bank Permata' },
  { value: 'Bank Danamon', label: 'Bank Danamon' },
  { value: 'Bank Tabungan Negara', label: 'Bank Tabungan Negara' },
  { value: 'Bank Mega', label: 'Bank Mega' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    province: '',
    city: '',
    subdistrict: '',
    village: '',
    detailAddress: '',
    position: '',
    bankName: '',
    accountNumber: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const [positionsList, setPositionsList] = useState<Position[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Simpan data awal untuk tombol Cancel
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);
  const [initialSkills, setInitialSkills] = useState<string[]>([]);
  const [initialPhoto, setInitialPhoto] = useState<string>('');

  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Skill Dropdown Search States & Ref
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState<boolean>(false);
  const [skillSearch, setSkillSearch] = useState<string>('');
  const skillDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const [profile, positions, masterSkills] = await Promise.all([
        userService.getProfile(),
        positionService.getAll(),
        skillService.getAll(),
      ]);

      if (!isMounted) return;

      const loadedForm = {
        name: profile.name,
        dateOfBirth: toInputDateFormat(profile.dateOfBirth),
        phone: profile.phone,
        email: profile.email,
        province: profile.province || '',
        city: profile.city || '',
        subdistrict: profile.subdistrict || '',
        village: profile.village || '',
        detailAddress: profile.detailAddress || '',
        position: profile.position || '',
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
      };
      setFormData(loadedForm);
      setInitialFormData(loadedForm);
      setSkills(profile.skills);
      setInitialSkills(profile.skills || []);
      setPhotoPreview(profile.photoUrl || '');
      setInitialPhoto(profile.photoUrl || '');
      setPositionsList(positions);
      setSkillsList(masterSkills);
      setPositionOptions(positions.map((p) => p.name));
      setSkillOptions(masterSkills.map((s) => s.name));
    };

    loadData().catch(() => {
      showToast.error('Gagal memuat data profil.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSkillDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (values: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSkills((prev) => [...prev, skill]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddCustomSkill = () => {
    const trimmed = skillSearch.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillSearch('');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('File harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Ukuran file foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPhotoPreview(dataUrl);
        if (typeof window !== 'undefined') {
          localStorage.setItem('makromedia_user_avatar', dataUrl);
          window.dispatchEvent(new CustomEvent('makromedia:avatar-updated'));
        }
        if (updateUser) {
          updateUser({ avatarUrl: dataUrl });
        }
        showToast.success('Foto profil berhasil dipilih!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('makromedia_user_avatar');
      window.dispatchEvent(new CustomEvent('makromedia:avatar-updated'));
    }
    if (updateUser) {
      updateUser({ avatarUrl: undefined });
    }
    showToast.info('Foto profil dihapus.');
  };

  const filteredSkills = skillOptions.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'Nama lengkap wajib diisi.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Nama lengkap minimal 2 karakter.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Format email tidak valid (contoh: user@gmail.com).';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Nomor telepon wajib diisi.';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Nomor telepon minimal 10 digit.';
    }

    if (formData.bankName.trim() && !formData.accountNumber.trim()) {
      errs.accountNumber = 'Nomor rekening wajib diisi jika nama bank diisi.';
    }
    if (!formData.bankName.trim() && formData.accountNumber.trim()) {
      errs.bankName = 'Nama bank wajib diisi jika nomor rekening diisi.';
    }

    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast.error('Mohon periksa data profil yang belum valid.');
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    try {
      // Cari positionId berdasarkan nama posisi yang dipilih
      const matchedPosition = positionsList.find(
        (p) => p.name.toLowerCase() === formData.position.trim().toLowerCase()
      );
      const positionId = matchedPosition?.id;

      // Cari / buat skillIds
      const skillIds: string[] = [];
      for (const skillName of skills) {
        let matched = skillsList.find(
          (s) => s.name.toLowerCase() === skillName.trim().toLowerCase()
        );
        if (!matched && skillName.trim()) {
          try {
            matched = await skillService.create({ name: skillName.trim() });
            setSkillsList((prev) => [...prev, matched!]);
          } catch {
            // ignore jika pembuatan skill baru gagal
          }
        }
        if (matched?.id) {
          skillIds.push(matched.id);
        }
      }

      const updated = await userService.updateProfile({
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        province: formData.province,
        city: formData.city,
        subdistrict: formData.subdistrict,
        village: formData.village,
        detailAddress: formData.detailAddress,
        position: formData.position,
        positionId,
        skills,
        skillIds,
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        photoUrl: photoPreview,
      });

      if (updateUser) {
        updateUser({
          name: updated?.name || formData.name.trim(),
          email: updated?.email || formData.email.trim(),
          avatarUrl: photoPreview || undefined,
        });
      }

      showToast.success('Profil berhasil diperbarui!');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memperbarui profil.';
      showToast.error(msg);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!passwordForm.oldPassword) {
      errs.oldPassword = 'Kata sandi saat ini wajib diisi.';
    }
    if (!passwordForm.newPassword) {
      errs.newPassword = 'Kata sandi baru wajib diisi.';
    } else if (passwordForm.newPassword.length < 8) {
      errs.newPassword = 'Kata sandi baru minimal 8 karakter.';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setIsChangingPass(true);
      await userService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      showToast.success('Kata sandi berhasil diubah! Silakan login kembali dengan kata sandi baru.');
      setIsPasswordModalOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      logout();
      router.replace('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengubah kata sandi. Periksa kata sandi lama Anda.';
      showToast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleCancel = () => {
    if (initialFormData) {
      setFormData(initialFormData);
      setSkills(initialSkills);
      setPhotoPreview(initialPhoto);
      setProfileErrors({});
      showToast.info('Perubahan pada formulir profil dibatalkan.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6 pb-16">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Name and Date of Birth */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${profileErrors.name ? "border-red-500" : "border-slate-200 focus:border-primary"}`}
                placeholder="Enter your name"
              />
              {profileErrors.name && <p className="mt-1 text-xs text-red-500 font-medium">{profileErrors.name}</p>}
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Date of Birth
              </label>
              <DatePickerInput
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                placeholder="Pilih tanggal lahir..."
              />
            </div>
          </div>

          {/* Right: Profile Photo */}
          <div className="md:col-span-4 flex flex-col justify-start items-center md:items-start space-y-2">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Profile Photo
            </span>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {/* Avatar Preview with Camera Overlay */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer inline-block"
              title="Klik untuk mengganti foto profil"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Avatar"
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-slate-200 shadow-xs group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-primary-50 text-primary font-bold text-3xl flex items-center justify-center border-2 border-primary-200 shadow-xs">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 rounded-full bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium">
                <Camera className="w-6 h-6 mb-1 text-white" />
                <span>Ubah Foto</span>
              </div>

              {/* Corner Camera Badge */}
              <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            {/* Action Buttons & Format Helper */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-primary-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto</span>
              </button>
              {photoPreview && (
                <>
                  <span className="text-slate-300">&bull;</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-400">Format: JPG, PNG, WebP (Maks. 5MB)</span>
          </div>
        </div>

        {/* Row 2: Phone Number, Email, Password (3 columns matching 05. Profile.pdf) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full bg-white border rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${profileErrors.phone ? "border-red-500" : "border-slate-200 focus:border-primary"}`}
              placeholder="081234567890"
            />
            {profileErrors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{profileErrors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-white border rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${profileErrors.email ? "border-red-500" : "border-slate-200 focus:border-primary"}`}
              placeholder="name@company.com"
            />
            {profileErrors.email && <p className="mt-1 text-xs text-red-500 font-medium">{profileErrors.email}</p>}
          </div>

          {/* Password (with Eye icon and modal trigger matching 05. Profile.pdf) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordErrors({});
                setIsPasswordModalOpen(true);
              }}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer group"
              title="Klik untuk mengubah kata sandi"
            >
              <span className="tracking-widest text-slate-600 font-bold">••••••••••••</span>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-primary transition-colors">
                <Eye className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Region and Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Wilayah: search dropdown dari wilayah.id (Provinsi -> City -> Subdistrict -> Village) */}
          <AddressRegionFields value={formData} onChange={handleRegionChange} />

          {/* Detail Address (Full Width) */}
          <div className="md:col-span-2">
            <label
              htmlFor="detailAddress"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Detail Address
            </label>
            <input
              type="text"
              id="detailAddress"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleInputChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
              placeholder="Jl. Dharmawangsa No.74"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <h3 className="text-sm sm:text-base font-bold text-[#0066ff]">
          Manpower Status and Banking Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Multi-Select Tagged Selector with Search Dropdown */}
          <div className="relative" ref={skillDropdownRef}>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Skill</label>

            {/* Clickable input box displaying pills & toggle */}
            <div
              onClick={() => setIsSkillDropdownOpen((prev) => !prev)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 flex items-center justify-between min-h-[46px] cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                {skills.length === 0 ? (
                  <span className="text-slate-400 text-xs">Pilih skill...</span>
                ) : (
                  skills.map((sk) => (
                    <span
                      key={sk}
                      className="bg-blue-50 text-[#0066ff] px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSkill(sk);
                        }}
                        className="hover:text-blue-800 focus:outline-none cursor-pointer"
                        title={`Hapus ${sk}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
                  isSkillDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Interactive Search Dropdown Menu */}
            {isSkillDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Cari skill..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Options List */}
                <div className="divide-y divide-slate-100 text-xs">
                  {filteredSkills.map((sk) => {
                    const isSelected = skills.includes(sk);
                    return (
                      <div
                        key={sk}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSkill(sk);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 text-[#0066ff] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <span>{sk}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
                      </div>
                    );
                  })}

                  {filteredSkills.length === 0 && (
                    <div className="p-2 text-center text-slate-400 text-xs">
                      <p>Tidak ada skill yang cocok</p>
                      {skillSearch.trim() && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCustomSkill();
                          }}
                          className="mt-1 text-[#0066ff] font-bold hover:underline cursor-pointer"
                        >
                          + Tambah &quot;{skillSearch.trim()}&quot;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Position: single-select search dropdown, opsi dari master data position */}
          <Combobox
            id="position"
            label="Position"
            options={positionOptions.map((pos) => ({ value: pos, label: pos }))}
            value={formData.position}
            onChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
            placeholder="Select position..."
            emptyText="Position tidak ditemukan"
          />

          <Combobox
            id="bankName"
            label="Bank Account"
            options={BANK_OPTIONS}
            value={formData.bankName}
            onChange={(value) => setFormData((prev) => ({ ...prev, bankName: value }))}
            placeholder="Select bank account..."
            emptyText="Bank tidak ditemukan"
          />

          {/* Account Number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter bank account number"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="min-w-[130px] sm:min-w-[150px] px-8 border-slate-300 text-slate-700 font-semibold rounded-xl"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="min-w-[130px] sm:min-w-[150px] px-8 bg-[#0066ff] hover:bg-blue-700 text-white font-semibold rounded-xl"
        >
          Save
        </Button>
      </div>
      </form>

      {/* Modal Ubah Kata Sandi */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ubah Kata Sandi Akun"
        maxWidth="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Pastikan kata sandi baru Anda minimal 8 karakter dan mengandung kombinasi huruf serta angka untuk keamanan.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi Saat Ini <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPass ? 'text' : 'password'}
                value={passwordForm.oldPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }));
                  if (passwordErrors.oldPassword) setPasswordErrors((p) => ({ ...p, oldPassword: '' }));
                }}
                className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${
                  passwordErrors.oldPassword ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
                placeholder="Masukkan kata sandi lama"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.oldPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.oldPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }));
                  if (passwordErrors.newPassword) setPasswordErrors((p) => ({ ...p, newPassword: '' }));
                }}
                className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
                  if (passwordErrors.confirmPassword) setPasswordErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
                placeholder="Ulangi kata sandi baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={isChangingPass}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isChangingPass}
            >
              {isChangingPass ? 'Menyimpan...' : 'Simpan Kata Sandi'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
