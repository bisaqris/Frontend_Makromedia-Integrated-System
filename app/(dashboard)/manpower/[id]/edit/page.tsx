'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        name: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        province: '',
        city: '',
        subdistrict: '',
        village: '',
        detailAddress: '',
        status: 'FULLTIME',
        skill: '',
        position: '',
        bankAccount: '',
        accountNumber: '',
    });

    useEffect(() => {
        if (id) {
            const savedData = localStorage.getItem('manpower_list');
            if (savedData) {
                const list = JSON.parse(savedData);
                const employee = list.find((emp: any) => emp.id === id);
                if (employee) {
                    setFormData(employee);
                }
            }
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const savedData = localStorage.getItem('manpower_list');
        if (savedData) {
            const list = JSON.parse(savedData);
            const updatedList = list.map((emp: any) => (emp.id === id ? { ...emp, ...formData } : emp));
            localStorage.setItem('manpower_list', JSON.stringify(updatedList));
        }
        router.push('/manpower');
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Manpower</h1>
                <p className="text-xs text-gray-400">Edit data karyawan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="border-b border-gray-100 pb-3">
                        <h2 className="text-base font-semibold text-blue-600">Personal & Job Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Employment Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            >
                                <option value="FULLTIME">Fulltime</option>
                                <option value="PART-TIME">Part-Time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="FREELANCE">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Position</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Skill</label>
                            <input
                                type="text"
                                name="skill"
                                value={formData.skill}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}