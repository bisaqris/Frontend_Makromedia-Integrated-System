'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Eye, EyeOff, X, Search, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';

const PRESET_SKILLS = [
  'Leadership',
  'Management',
  'Director of Photography (DoP)',
  'Camera Operator / Cameraman',
  'Video Editor (Premiere / DaVinci)',
  'Lighting Technician / Gaffer',
  'Audio Recordist / Sound Engineer',
  'Drone Pilot (Certified)',
  'Project Management',
  'Strategic Planning',
  'Public Speaking',
  'Event Production',
  'Budgeting & Finance',
  'Client Relations',
];

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    dateOfBirth: '10 January 2000',
    phone: '081234567890',
    email: 'john@makromedia.com',
    password: 'password123',
    province: 'East Java',
    city: 'Surabaya',
    subdistrict: 'Gubeng',
    village: 'Airlangga',
    detailAddress: 'Jl. Dharmawangsa No.74',
    position: 'BOD',
    bankAccount: 'Bank Central Asia',
    accountNumber: '7265189474',
  });

  const [skills, setSkills] = useState<string[]>(['Leadership', 'Management']);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [photoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
  );

  // Skill Dropdown Search States & Ref
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState<boolean>(false);
  const [skillSearch, setSkillSearch] = useState<string>('');
  const skillDropdownRef = useRef<HTMLDivElement>(null);

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

  const filteredSkills = PRESET_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast.success('Profil berhasil diperbarui!');
  };

  const handleCancel = () => {
    showToast.info('Perubahan dibatalkan.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-16">
      {/* Card 1: General Profile Information */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Top Section: Inputs on Left, Profile Photo on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column Fields */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Date of Birth
              </label>
              <input
                type="text"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. 10 January 2000"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Right Column: Profile Photo */}
          <div className="md:col-span-4 flex flex-col justify-start items-center md:items-start space-y-2">
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">
              Profile Photo
            </span>
            <div className="relative group cursor-pointer">
              <img
                src={photoPreview}
                alt="Profile Avatar"
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-slate-100 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Grid below Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
              placeholder="name@company.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Province */}
          <div>
            <label
              htmlFor="province"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Province
            </label>
            <div className="relative">
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="East Java">East Java</option>
                <option value="Central Java">Central Java</option>
                <option value="West Java">West Java</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="text-xs font-semibold text-slate-700 block mb-1.5">
              City
            </label>
            <div className="relative">
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Surabaya">Surabaya</option>
                <option value="Malang">Malang</option>
                <option value="Sidoarjo">Sidoarjo</option>
                <option value="Gresik">Gresik</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Subdistrict */}
          <div>
            <label
              htmlFor="subdistrict"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Subdistrict
            </label>
            <div className="relative">
              <select
                id="subdistrict"
                name="subdistrict"
                value={formData.subdistrict}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Gubeng">Gubeng</option>
                <option value="Sukolilo">Sukolilo</option>
                <option value="Tegalsari">Tegalsari</option>
                <option value="Wonokromo">Wonokromo</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Village */}
          <div>
            <label htmlFor="village" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Village
            </label>
            <div className="relative">
              <select
                id="village"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Airlangga">Airlangga</option>
                <option value="Kertajaya">Kertajaya</option>
                <option value="Mojo">Mojo</option>
                <option value="Pucang Sewu">Pucang Sewu</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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
              placeholder="Street name, building, unit number"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Manpower Status and Banking Information */}
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

          {/* Position */}
          <div>
            <label
              htmlFor="position"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Position
            </label>
            <div className="relative">
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="BOD">BOD</option>
                <option value="Director">Director</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <label
              htmlFor="bankAccount"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Bank Account
            </label>
            <div className="relative">
              <select
                id="bankAccount"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleInputChange}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Bank Central Asia">Bank Central Asia</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="Bank BNI">Bank BNI</option>
                <option value="Bank BRI">Bank BRI</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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

      {/* Bottom Action Bar */}
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
  );
}
