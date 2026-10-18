'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

interface ManpowerDetail {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  position: string;
  employmentStatus: string;
  joinDate: string;
  dateOfBirth?: string;
  email?: string;
  skills: string[];
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function DetailManpowerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [data, setData] = useState<ManpowerDetail | null>(null);

  useEffect(() => {
    const existingData = JSON.parse(localStorage.getItem('manpower_list') || '[]');
    const found = existingData.find((item: { id: string }) => item.id === resolvedParams.id);

    if (found) {
      setData({
        id: found.id,
        fullName: found.fullName || found.name || '-',
        gender: found.gender || 'Male',
        phoneNumber: found.phoneNumber || found.phone || '-',
        position: found.position || '-',
        employmentStatus: found.employmentStatus || found.status || '-',
        joinDate: found.joinDate || '-',
        dateOfBirth: found.dateOfBirth || '-',
        email: found.email || '-',
        skills: Array.isArray(found.skills)
          ? found.skills
          : found.skill
          ? [found.skill]
          : [],
        bankName: found.bankName || found.bankAccount || '-',
        accountNumber: found.accountNumber || '-',
        accountHolder: found.accountHolder || '-',
      });
    } else {
      // Fallback Data untuk simulasi/testing jika ID tidak ditemukan di LocalStorage
      setData({
        id: resolvedParams.id,
        fullName: 'Andy Setiawan',
        gender: 'Male',
        phoneNumber: '08123456789',
        position: 'Senior Videographer',
        employmentStatus: 'Parttime',
        joinDate: '15 February 2025',
        dateOfBirth: '12 May 1995',
        email: 'andy.setiawan@makromedia.id',
        skills: ['Videography', 'Color Grading'],
        bankName: 'BCA',
        accountNumber: '12345657',
        accountHolder: 'Andy Setiawan',
      });
    }
  }, [resolvedParams.id]);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading detail data...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Title / Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Detail Manpower</h1>
        <p className="text-sm text-gray-400">Detail Manpower</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-blue-600 pb-2">Manpower Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs text-gray-400 font-medium">Full Name</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.fullName || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Gender</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.gender || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Phone Number</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.phoneNumber || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Position / Role</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.position || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Employment Status</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.employmentStatus || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Join Date</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.joinDate || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 font-medium">Skill & Expertise</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {data.skills && data.skills.length > 0 ? data.skills.join(', ') : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Bank Name</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.bankName || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Account Number</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.accountNumber || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Account Holder</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.accountHolder || '-'}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => router.push(`/manpower/[id]/edit`)}
          className="px-6 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 text-sm font-medium transition flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );
}