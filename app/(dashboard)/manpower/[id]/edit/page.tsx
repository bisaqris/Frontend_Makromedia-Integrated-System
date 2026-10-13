'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Employee } from '@/types/manpower';

interface EditManpowerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditManpowerPage({ params }: EditManpowerPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Daftar skill opsi
  const availableSkills = [
    'Project Manager',
    'Live Streamer',
    'Cameraman',
    'Audio Engineer',
    'Video Editor',
    'Lighting Specialist',
    'Broadcast Engineer',
    'FD / Floor Director',
  ];

  // State Form
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    dailyRate: 0,
    joinDate: '',
    employmentStatus: 'Karyawan Tetap',
    status: 'Active',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
    skills: [],
  });

  // 1. Fetch data manpower & pre-fill ke form
  useEffect(() => {
    async function fetchManpowerData() {
      try {
        setLoading(true);
        const { id } = await params;

        // Ganti baris ini dengan call service/API backend Anda:
        // const mockData = await manpowerService.getById(id);
        
        const mockData: Employee = {
          id,
          employeeId: 'EMP-001',
          fullName: 'Budi Santoso',
          role: 'Cameraman',
          email: 'budi@example.com',
          phone: '081234567890',
          dailyRate: 350000,
          joinDate: '2024-01-15',
          employmentStatus: 'Karyawan Tetap',
          status: 'Active',
          bankName: 'BCA',
          bankAccount: '1234567890',
          accountHolder: 'Budi Santoso',
          skills: ['Cameraman', 'Video Editor'],
        };

        // Otomatis isi data yang akan di-edit
        setFormData({
          fullName: mockData.fullName || '',
          role: mockData.role || '',
          email: mockData.email || '',
          phone: mockData.phone || '',
          dailyRate: mockData.dailyRate || 0,
          joinDate: mockData.joinDate || '',
          employmentStatus: mockData.employmentStatus || 'Karyawan Tetap',
          status: mockData.status || 'Active',
          bankName: mockData.bankName || '',
          bankAccount: mockData.bankAccount || '',
          accountHolder: mockData.accountHolder || '',
          skills: mockData.skills || [],
        });
      } catch (error) {
        console.error('Gagal mengambil data manpower:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchManpowerData();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dailyRate' ? Number(value) : value,
    }));
  };

  const handleSkillToggle = (skillName: string) => {
    setFormData((prev) => {
      const currentSkills = prev.skills || [];
      const isSelected = currentSkills.includes(skillName);
      return {
        ...prev,
        skills: isSelected
          ? currentSkills.filter((s) => s !== skillName)
          : [...currentSkills, skillName],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Panggil API Update Backend:
      // await manpowerService.update(id, formData);
      console.log('Updated Manpower Data:', formData);
      router.push('/manpower');
    } catch (error) {
      console.error('Gagal menyimpan perubahan:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat data manpower...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Data Manpower</h1>
          <p className="text-sm text-gray-500">Perbarui informasi dan kredensial tenaga kerja</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Utama */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
            Informasi Utama
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role / Posisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="Contoh: Cameraman, Project Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate per Hari (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="350000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Bergabung <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Kepegawaian <span className="text-red-500">*</span>
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="Karyawan Tetap">Karyawan Tetap</option>
                <option value="Karyawan Kontrak">Karyawan Kontrak</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status SDM <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Informasi Bank */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
            Informasi Bank
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="BCA, Mandiri, BNI, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="Masukkan nomor rekening"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="Nama sesuai buku tabungan"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skill & Keahlian */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
            Skill & Keahlian
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSkills.map((skill) => {
              const isChecked = formData.skills?.includes(skill);
              return (
                <label
                  key={skill}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm font-medium transition ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSkillToggle(skill)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span>{skill}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}