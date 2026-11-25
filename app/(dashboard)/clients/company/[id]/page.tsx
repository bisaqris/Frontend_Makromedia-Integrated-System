'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Users } from 'lucide-react';
import { clientService } from '@/lib/services/clientService';
import { ClientCompany } from '@/types/client';

export default function DetailCompanyClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [data, setData] = useState<ClientCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await clientService.getCompanyById(resolvedParams.id);
        if (isMounted) setData(res);
      } catch {
        if (isMounted) setData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-slate-500 py-16">
        Loading data company client...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detail Company Client</h1>
          <p className="text-sm text-gray-400">Detail Company Client Information</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center text-slate-500">
          Data Company Client dengan ID &quot;{resolvedParams.id}&quot; tidak ditemukan.
        </div>
        <button
          type="button"
          onClick={() => router.push('/clients/company')}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Detail Company Client</h1>
        <p className="text-sm text-gray-400">Detail Company Client Information</p>
      </div>

      {/* Main Card Information */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-blue-600">Company Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 font-medium">Company Name</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Phone Number</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.phone || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Company Email</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.email || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">Country</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.country || 'Indonesia'}</p>
          </div>

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

          <div>
            <p className="text-xs text-gray-400 font-medium">Postal Code</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.postalCode || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 font-medium">Company Address</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Associated PIC Clients */}
      {data.pics && data.pics.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-blue-600">
              PIC Clients ({data.pics.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.pics.map((pic) => (
              <div
                key={pic.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-800">{pic.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pic.position || 'PIC'}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>{pic.phone || '-'}</span>
                  <span>{pic.email || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push('/clients/company')}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => router.push(`/clients/company/${resolvedParams.id}/edit`)}
          className="px-6 py-2.5 rounded-xl font-semibold border border-orange-400 text-orange-500 bg-white hover:bg-orange-50 hover:border-orange-500 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
        >
          <Pencil className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}
