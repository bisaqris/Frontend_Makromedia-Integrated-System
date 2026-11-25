'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import AddressRegionFields from '@/components/shared/AddressRegionFields';
import CountrySelect from '@/components/shared/CountrySelect';
import { showToast } from '@/components/ui/Toast';
import { clientService } from '@/lib/services/clientService';
import { ClientCompany } from '@/types/client';

export default function AddPICClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companies, setCompanies] = useState<ClientCompany[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    companyAddress: '',
    country: 'Indonesia',
    province: '',
    city: '',
    subdistrict: '',
    village: '',
    postalCode: '',
  });

  useEffect(() => {
    let isMounted = true;
    clientService
      .getCompanies()
      .then((data) => {
        if (isMounted) setCompanies(data);
      })
      .catch(() => {
        showToast.error('Gagal memuat daftar perusahaan.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, phone: digits }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegionChange = (values: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(values) as (keyof typeof formData)[]) {
        if (next[key]) next[key] = '';
      }
      return next;
    });
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
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Nomor telepon harus berupa angka.';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit angka.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid (contoh: user@gmail.com).';
    }

    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = 'Alamat perusahaan wajib diisi.';
    }
    if (!formData.country.trim()) newErrors.country = 'Country (Negara) wajib dipilih.';
    if (!formData.province) newErrors.province = 'Province / State wajib dipilih.';
    if (!formData.city) newErrors.city = 'City wajib dipilih.';
    if (formData.country === 'Indonesia') {
      if (!formData.subdistrict) newErrors.subdistrict = 'Subdistrict (Kecamatan) wajib dipilih.';
      if (!formData.village) newErrors.village = 'Village (Kelurahan) wajib dipilih.';
    }
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal Code wajib diisi.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast.error('Mohon lengkapi seluruh field wajib (*)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const selectedCompany = companies.find((c) => c.id === formData.company);

      await clientService.createPIC({
        name: formData.name.trim(),
        clientId: formData.company,
        company: selectedCompany?.name || '',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        companyAddress: formData.companyAddress.trim(),
        country: formData.country.trim(),
        province: formData.province,
        city: formData.city,
        subdistrict: formData.subdistrict || '-',
        village: formData.village || '-',
        postalCode: formData.postalCode.trim(),
      });

      showToast.success(`PIC Client "${formData.name.trim()}" berhasil ditambahkan!`);
      router.push('/clients/pic');
    } catch {
      showToast.error('Gagal menyimpan PIC Client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Add New PIC Client</h1>
        <p className="text-sm text-gray-400">Add new PIC Client</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-blue-600">New PIC Client</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6">
              <label htmlFor="name" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Q3 Marketing Campaign"
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-6">
              <label htmlFor="company" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full h-[42px] appearance-none bg-white border ${
                    errors.company ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                  } rounded-xl px-3.5 py-2 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors cursor-pointer`}
                >
                  <option value="" disabled hidden>
                    Company
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
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

            <div className="md:col-span-6">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="08..."
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone}</p>}
            </div>

            <div className="md:col-span-6">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="username@gmail.com"
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-12">
              <label htmlFor="companyAddress" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Company Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                placeholder="Jl. Simpang Sulfat..."
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.companyAddress ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors.companyAddress && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.companyAddress}</p>
              )}
            </div>

            <CountrySelect
              value={formData.country}
              onChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  country: val,
                  province: '',
                  city: '',
                  subdistrict: val.toLowerCase() === 'indonesia' ? '' : '-',
                  village: val.toLowerCase() === 'indonesia' ? '' : '-',
                }));
                if (errors.country) setErrors((prev) => ({ ...prev, country: '' }));
              }}
              error={errors.country}
              className="md:col-span-6"
            />

            {/* Wilayah berjenjang: Indonesia (wilayah.id) atau Global (country-state-city) */}
            <AddressRegionFields
              country={formData.country}
              value={formData}
              onChange={handleRegionChange}
              fieldClassName="md:col-span-6"
              errors={errors}
            />

            <div className="md:col-span-6">
              <label htmlFor="postalCode" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Postal Code"
                className={`w-full h-[42px] px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.postalCode ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push('/clients/pic')}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 text-xs sm:text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
