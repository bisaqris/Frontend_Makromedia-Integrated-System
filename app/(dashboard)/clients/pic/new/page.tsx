'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { addPicClient } from '@/lib/mock/clients.mock';

export default function AddNewPicClientPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    companyAddress: '',
    country: '',
    province: '',
    city: '',
    subdistrict: '',
    village: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama PIC Client wajib diisi.';
    }
    if (!formData.company) {
      newErrors.company = 'Company wajib dipilih.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi.';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid (contoh: user@gmail.com).';
    }

    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = 'Alamat perusahaan wajib diisi.';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country (Negara) wajib diisi.';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'Province wajib diisi.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City wajib diisi.';
    }
    if (!formData.subdistrict.trim()) {
      newErrors.subdistrict = 'Subdistrict wajib diisi.';
    }
    if (!formData.village.trim()) {
      newErrors.village = 'Village wajib diisi.';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal Code wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast.error('Mohon lengkapi seluruh field formulir dengan benar.');
      return;
    }

    // Add to shared store
    addPicClient({
      name: formData.name.trim(),
      company: formData.company,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      companyAddress: formData.companyAddress.trim(),
      country: formData.country.trim(),
      province: formData.province.trim(),
      city: formData.city.trim(),
      subdistrict: formData.subdistrict.trim(),
      village: formData.village.trim(),
      postalCode: formData.postalCode.trim(),
    });

    showToast.success(`PIC Client "${formData.name.trim()}" berhasil ditambahkan!`);
    router.push('/clients/pic');
  };

  const handleCancel = () => {
    router.push('/clients/pic');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <h3 className="text-sm sm:text-base font-bold text-[#0066ff]">
          New PIC Client
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Row 1: Name & Company */}
          <div className="md:col-span-6">
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
              placeholder="e.g. Q3 Marketing Campaign"
              className={`w-full bg-white border ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
          </div>

          <div className="md:col-span-6">
            <label
              htmlFor="company"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Company <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`w-full appearance-none bg-white border ${
                  errors.company ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                } rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors cursor-pointer`}
              >
                <option value="" disabled hidden>
                  Company
                </option>
                <option value="CV. Makromedia Visual">CV. Makromedia Visual</option>
                <option value="PT Innovate Indonesia">PT Innovate Indonesia</option>
                <option value="Bank Nusantara">Bank Nusantara</option>
                <option value="82 PRO">82 PRO</option>
                <option value="Director">Director</option>
                <option value="Marketing">Marketing</option>
                <option value="Editor">Editor</option>
                <option value="Motion Graphic">Motion Graphic</option>
                <option value="Project Manager">Project Manager</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.company ? (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.company}</p>
            ) : (
              <p className="text-[11px] text-slate-400 font-normal mt-1">
                *jika data company tidak ada silakan tambahkan dulu di menu List Company Client
              </p>
            )}
          </div>

          {/* Row 2: Phone Number & Email */}
          <div className="md:col-span-6">
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
              placeholder="08..."
              className={`w-full bg-white border ${
                errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone}</p>}
          </div>

          <div className="md:col-span-6">
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
              placeholder="username@gmail.com"
              className={`w-full bg-white border ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>}
          </div>

          {/* Row 3: Company Address (Full Width) */}
          <div className="md:col-span-12">
            <label
              htmlFor="companyAddress"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Company Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
              placeholder="Jl. Simpang Sulfat..."
              className={`w-full bg-white border ${
                errors.companyAddress ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.companyAddress && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.companyAddress}</p>
            )}
          </div>

          {/* Row 4: Country & Province */}
          <div className="md:col-span-6">
            <label
              htmlFor="country"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
              className={`w-full bg-white border ${
                errors.country ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.country && <p className="text-xs text-red-500 font-medium mt-1">{errors.country}</p>}
          </div>

          <div className="md:col-span-6">
            <label
              htmlFor="province"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Province <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              placeholder="Province"
              className={`w-full bg-white border ${
                errors.province ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.province && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.province}</p>
            )}
          </div>

          {/* Row 5: City & Subdistrict */}
          <div className="md:col-span-6">
            <label
              htmlFor="city"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className={`w-full bg-white border ${
                errors.city ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium mt-1">{errors.city}</p>}
          </div>

          <div className="md:col-span-6">
            <label
              htmlFor="subdistrict"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Subdistrict <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subdistrict"
              name="subdistrict"
              value={formData.subdistrict}
              onChange={handleInputChange}
              placeholder="Subdistrict"
              className={`w-full bg-white border ${
                errors.subdistrict ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.subdistrict && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.subdistrict}</p>
            )}
          </div>

          {/* Row 6: Village & Postal Code */}
          <div className="md:col-span-6">
            <label
              htmlFor="village"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Village <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              placeholder="Village"
              className={`w-full bg-white border ${
                errors.village ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.village && <p className="text-xs text-red-500 font-medium mt-1">{errors.village}</p>}
          </div>

          <div className="md:col-span-6">
            <label
              htmlFor="postalCode"
              className="text-xs font-semibold text-slate-700 block mb-1.5"
            >
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Postal Code"
              className={`w-full bg-white border ${
                errors.postalCode ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
              } rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors`}
            />
            {errors.postalCode && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.postalCode}</p>
            )}
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
          Submit
        </Button>
      </div>
    </form>
  );
}
