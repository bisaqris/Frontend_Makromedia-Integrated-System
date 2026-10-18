'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AddressRegionFields from '@/components/shared/AddressRegionFields';

export default function EditManpowerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Options dari LocalStorage (Skill & Position)
  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);

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
    skill: '',
    employmentStatus: '',
    position: '',
    bankAccount: '',
    accountNumber: '',
    accountHolder: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch Dynamic Positions
        const storedPositions = JSON.parse(localStorage.getItem('positions_list') || '[]');
        if (storedPositions.length > 0) {
          setPositionOptions(storedPositions.map((p: { name: string }) => p.name));
        } else {
          setPositionOptions([
            'Project Manager',
            'Creative Director',
            'Lead Editor',
            'Senior Videographer',
            'Junior Videographer',
            'Cameraman',
            'Audio Engineer',
            'Video Editor',
            'Lighting Specialist',
            'Broadcast Engineer',
            'Floor Director',
          ]);
        }

        // 2. Fetch Dynamic Skills
        const storedSkills = JSON.parse(localStorage.getItem('skills_list') || '[]');
        if (storedSkills.length > 0) {
          setSkillOptions(storedSkills.map((s: { name: string }) => s.name));
        } else {
          setSkillOptions([
            'Videography',
            'Color Grading',
            'Video Editing',
            'Motion Graphic',
            'Audio Mixing',
            'Graphic Design',
            'UI Design',
          ]);
        }

        // 3. Load Data Existing Manpower dari LocalStorage
        const existingList = JSON.parse(localStorage.getItem('manpower_list') || '[]');
        const found = existingList.find((item: { id: string }) => item.id === resolvedParams.id);

        if (found) {
          setFormData({
            name: found.fullName || found.name || '',
            dateOfBirth: found.dateOfBirth || '',
            phoneNumber: found.phoneNumber || found.phone || '',
            email: found.email || '',
            gender: found.gender || 'Male',
            province: found.province || '',
            city: found.city || '',
            subdistrict: found.subdistrict || '',
            village: found.village || '',
            detailAddress: found.detailAddress || '',
            skill: Array.isArray(found.skills) ? found.skills[0] || '' : found.skill || '',
            employmentStatus: found.employmentStatus || found.status || 'Parttime',
            position: found.position || '',
            bankAccount: found.bankName || found.bankAccount || '',
            accountNumber: found.accountNumber || '',
            accountHolder: found.accountHolder || '',
          });
        } else {
          // Fallback Mock Data jika data tidak ditemukan di LocalStorage
          setFormData({
            name: 'Andy Setiawan',
            dateOfBirth: '1995-05-12',
            phoneNumber: '08123456789',
            email: 'andy.setiawan@makromedia.id',
            gender: 'Male',
            province: 'Jawa Barat',
            city: 'Bandung',
            subdistrict: 'Coblong',
            village: 'Dago',
            detailAddress: 'Jl. Simpang Surapati No. 12',
            skill: 'Videography',
            employmentStatus: 'Parttime',
            position: 'Senior Videographer',
            bankAccount: 'BCA',
            accountNumber: '12345657',
            accountHolder: 'Andy Setiawan',
          });
        }
      } catch (err) {
        console.error('Error loading manpower data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resolvedParams.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (values: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const existingList = JSON.parse(localStorage.getItem('manpower_list') || '[]');

      const updatedList = existingList.map((item: { id: string }) => {
        if (item.id === resolvedParams.id) {
          return {
            ...item,
            fullName: formData.name,
            name: formData.name,
            status: formData.employmentStatus.toUpperCase(),
            employmentStatus: formData.employmentStatus,
            skill: formData.skill || '-',
            skills: formData.skill ? [formData.skill] : [],
            position: formData.position || '-',
            phone: formData.phoneNumber || '-',
            phoneNumber: formData.phoneNumber || '-',
            email: formData.email || '-',
            dateOfBirth: formData.dateOfBirth || '-',
            gender: formData.gender || 'Male',
            province: formData.province || '-',
            city: formData.city || '-',
            subdistrict: formData.subdistrict || '-',
            village: formData.village || '-',
            detailAddress: formData.detailAddress || '-',
            bankName: formData.bankAccount || '-',
            bankAccount: formData.bankAccount || '-',
            accountNumber: formData.accountNumber || '-',
            accountHolder: formData.accountHolder || '-',
          };
        }
        return item;
      });

      localStorage.setItem('manpower_list', JSON.stringify(updatedList));
      router.push(`/manpower/${resolvedParams.id}`);
    } catch (err) {
      console.error('Failed to update manpower:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data manpower...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Manpower</h1>
        <p className="text-sm text-gray-400">Edit Manpower Information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Personal Data */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-blue-600">Manpower Personal Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="08..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@gmail.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Alamat: Search Dropdown (data dari wilayah.id) */}
            <AddressRegionFields value={formData} onChange={handleRegionChange} />

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Detail Address</label>
              <input
                type="text"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                placeholder="Jl. Simpang Surapati..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Status & Banking */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-blue-600">Manpower Status and Banking Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skill</label>
              <select
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Choose Skill</option>
                {skillOptions.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Fulltime">Fulltime</option>
                <option value="Parttime">Part Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select Position</option>
                {positionOptions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Manual Bank */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="e.g. BCA, Mandiri, BNI"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Account number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account Holder</label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                placeholder="Account holder name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}