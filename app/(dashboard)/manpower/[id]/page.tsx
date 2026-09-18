'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit3 } from 'lucide-react';

export default function DetailEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [employee, setEmployee] = useState<any>(null);

    useEffect(() => {
        if (id) {
            const savedData = localStorage.getItem('manpower_list');
            if (savedData) {
                const list = JSON.parse(savedData);
                const found = list.find((emp: any) => emp.id === id);
                if (found) {
                    setEmployee(found);
                }
            }
        }
    }, [id]);

    if (!employee) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Memuat data karyawan...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Manpower</h1>
                <p className="text-xs text-gray-400">Detail Manpower</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
                <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-base font-semibold text-blue-600">Manpower Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Full Name</span>
                        <p className="font-semibold text-gray-900">{employee.name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Date of Birth</span>
                        <p className="font-semibold text-gray-900">{employee.dateOfBirth || '-'}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Phone Number</span>
                        <p className="font-semibold text-gray-900">{employee.phone || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Position / Role</span>
                        <p className="font-semibold text-gray-900">{employee.position || '-'}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Employment Status</span>
                        <p className="font-semibold text-gray-900">{employee.status || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Email</span>
                        <p className="font-semibold text-gray-900">{employee.email || '-'}</p>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Skill & Expertise</span>
                        <p className="font-semibold text-gray-900">{employee.skill || '-'}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Bank Name</span>
                        <p className="font-semibold text-gray-900">{employee.bankAccount || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Account Number</span>
                        <p className="font-semibold text-gray-900">{employee.accountNumber || '-'}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => router.push('/manpower')}
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={() => router.push(`/manpower/${id}/edit`)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-orange-500 bg-white border border-orange-400 rounded-lg hover:bg-orange-50"
                >
                    <Edit3 className="w-4 h-4 text-orange-500" />
                    Edit
                </button>
            </div>
        </div>
    );
}