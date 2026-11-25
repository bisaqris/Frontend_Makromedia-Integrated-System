'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import AddressRegionFields from '@/components/shared/AddressRegionFields';
import DatePickerInput from '@/components/ui/DatePickerInput';
import { showToast } from '@/components/ui/Toast';
import { manpowerService } from '@/lib/services/manpowerService';
import { positionService } from '@/lib/services/positionService';
import { skillService } from '@/lib/services/skillService';
import { EmploymentStatus, Gender } from '@/types/manpower';

export default function AddManpowerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);

  // Multi-select skill states (matching Profile page)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    gender: 'Male',
    province: '',
    city: '',
    subdistrict: '',
    village: '',
    detailAddress: '',
    employmentStatus: 'Fulltime',
    position: '',
    bankAccount: '',
    accountNumber: '',
    accountHolder: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      const [positions, skills] = await Promise.all([
        positionService.getActive(),
        skillService.getActive(),
      ]);
      if (!isMounted) return;
      setPositionOptions(positions.map((p) => p.name));
      setSkillOptions(skills.map((s) => s.name));
    };

    loadOptions().catch(() => {
      // Biarkan dropdown kosong jika master data gagal dimuat.
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

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddCustomSkill = () => {
    const trimmed = skillSearch.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setSkillSearch('');
    }
  };

  const filteredSkills = skillOptions.filter((sk) =>
    sk.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const numericVal = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, phoneNumber: numericVal }));
      if (formErrors.phoneNumber) {
        setFormErrors((prev) => ({ ...prev, phoneNumber: '' }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegionChange = (values: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const validate = () => {
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

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = 'Nomor telepon wajib diisi.';
    } else if (!/^\d+$/.test(formData.phoneNumber.trim())) {
      errs.phoneNumber = 'Nomor telepon harus berupa angka.';
    } else if (formData.phoneNumber.trim().length < 10) {
      errs.phoneNumber = 'Nomor telepon minimal 10 digit angka.';
    }

    if (!formData.position) {
      errs.position = 'Posisi jabatan wajib dipilih.';
    }

    if (formData.bankAccount.trim() && !formData.accountNumber.trim()) {
      errs.accountNumber = 'Nomor rekening wajib diisi jika nama bank diisi.';
    }
    if (!formData.bankAccount.trim() && formData.accountNumber.trim()) {
      errs.bankAccount = 'Nama bank wajib diisi jika nomor rekening diisi.';
    }

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast.error('Mohon periksa data karyawan yang belum valid.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);

      await manpowerService.create({
        fullName: formData.name.trim(),
        gender: formData.gender as Gender,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        position: formData.position,
        employmentStatus: formData.employmentStatus as EmploymentStatus,
        skills: selectedSkills,
        province: formData.province,
        city: formData.city,
        subdistrict: formData.subdistrict,
        village: formData.village,
        detailAddress: formData.detailAddress,
        bankName: formData.bankAccount.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountHolder: formData.accountHolder,
      });

      showToast.success('Data karyawan berhasil ditambahkan.');
      router.push('/manpower');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal menyimpan data karyawan.';
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Add New Manpower</h1>
        <p className="text-sm text-gray-400">Add new Manpower</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-blue-600">Manpower Personal Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  formErrors.name ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
                required
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
              <DatePickerInput
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder="Pilih tanggal lahir..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="08..."
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  formErrors.phoneNumber ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {formErrors.phoneNumber && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary bg-white transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@gmail.com"
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  formErrors.email ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {formErrors.email && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.email}</p>}
            </div>

            {/* Alamat: Search Dropdown (data dari wilayah.id) */}
            <AddressRegionFields
              value={formData}
              onChange={handleRegionChange}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Detail Address</label>
              <input
                type="text"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                placeholder="Jl. Simpang Surapati..."
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-blue-600">Manpower Status and Banking Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multi-Select Skill Dropdown matching /profile */}
            <div className="relative" ref={skillDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skill</label>
              <div
                onClick={() => setIsSkillDropdownOpen((prev) => !prev)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-800 flex items-center justify-between min-h-[42px] cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedSkills.length === 0 ? (
                    <span className="text-slate-400 text-xs">Pilih skill...</span>
                  ) : (
                    selectedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-blue-50 text-[#0066ff] px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5"
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

                  <div className="divide-y divide-slate-100 text-xs">
                    {filteredSkills.map((sk) => {
                      const isSelected = selectedSkills.includes(sk);
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary bg-white transition-colors"
              >
                <option value="Fulltime">Fulltime</option>
                <option value="Parttime">Part Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none bg-white transition-colors ${
                  formErrors.position ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              >
                <option value="">Select Position</option>
                {positionOptions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {formErrors.position && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.position}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank Name</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="e.g. BCA, Mandiri, BNI"
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
              />
              {formErrors.bankAccount && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.bankAccount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData((prev) => ({ ...prev, accountNumber: val }));
                }}
                placeholder="Account number"
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
              />
              {formErrors.accountNumber && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.accountNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Holder</label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                placeholder="Account holder name"
                className="w-full h-[42px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 text-xs sm:text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
