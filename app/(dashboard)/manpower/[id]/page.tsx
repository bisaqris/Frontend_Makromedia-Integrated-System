'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { manpowerService } from '@/lib/services/manpowerService';
import { ManpowerRecord } from '@/types/manpower';

/** "1995-05-12" -> "12 May 1995"; nilai non-ISO ditampilkan apa adanya */
const formatDate = (value: string) => {
  if (!value || value === '-') return '-';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function DetailManpowerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [data, setData] = useState<ManpowerRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    manpowerService
      .getById(resolvedParams.id)
      .then((record) => {
        if (isMounted) setData(record);
      })
      .catch(() => {
        if (isMounted) setData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading detail data...</div>;

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detail Manpower</h1>
          <p className="text-sm text-gray-400">Detail Manpower</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center text-gray-500">
          Data karyawan dengan ID &quot;{resolvedParams.id}&quot; tidak ditemukan.
        </div>
        <div className="flex items-center justify-start pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Title / Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Detail Manpower</h1>
        <p className="text-sm text-gray-400">Detail Manpower</p>
      </div>

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
            <p className="text-xs text-gray-400 font-medium">Email</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.email || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Date of Birth</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(data.dateOfBirth || '-')}</p>
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
            <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(data.joinDate || '-')}</p>
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

        {/* Address */}
        <div className="border-t border-gray-100 pt-6 space-y-6">
          <h2 className="text-base font-bold text-blue-600">Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs text-gray-400 font-medium">Province</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data.province || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">City</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data.city || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Subdistrict</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data.subdistrict || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Village</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data.village || '-'}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 font-medium">Detail Address</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data.detailAddress || '-'}</p>
            </div>
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
          onClick={() => router.push(`/manpower/${resolvedParams.id}/edit`)}
          className="px-6 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 text-sm font-medium transition flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );
}