'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    status: 'FULLTIME' | 'PART-TIME' | 'INTERNSHIP' | 'FREELANCE';
    skill: string;
    position: string;
    phone: string;
    email: string;
}

export default function ManpowerPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);

    // State Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);

    useEffect(() => {
        const savedData = localStorage.getItem('manpower_list');
        if (savedData) {
            setEmployees(JSON.parse(savedData));
        } else {
            const initialData: Employee[] = [
                {
                    id: '1',
                    name: 'Agus T.',
                    status: 'FULLTIME',
                    skill: 'Director',
                    position: 'BOD',
                    phone: '0821-5410-7123',
                    email: 'agus@makromedia.id',
                },
                {
                    id: '2',
                    name: 'Gusan',
                    status: 'INTERNSHIP',
                    skill: 'Editor Manager',
                    position: 'Head Manager',
                    phone: '0898-7654-321',
                    email: 'gusan123@gmail.com',
                },
                {
                    id: '3',
                    name: 'John Doe',
                    status: 'FREELANCE',
                    skill: 'Videographer',
                    position: 'Staff',
                    phone: '0812-3456-7890',
                    email: 'john@yahoo.com',
                },
            ];
            setEmployees(initialData);
            localStorage.setItem('manpower_list', JSON.stringify(initialData));
        }
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            const updated = employees.filter((emp) => emp.id !== id);
            setEmployees(updated);
            localStorage.setItem('manpower_list', JSON.stringify(updated));
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'FULLTIME':
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'PART-TIME':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'INTERNSHIP':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'FREELANCE':
                return 'bg-rose-50 text-rose-600 border-rose-100';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    // Filter Data berdasarkan Search dan Status Filter
    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase()) ||
            emp.position.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter ? emp.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    // Logika Pagination
    const totalEntries = filteredEmployees.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredEmployees.slice(startIndex, startIndex + entriesPerPage);

    return (
        <div className="p-6 space-y-6">
            {/* Top Bar: Search Bar (Kotak Hijau) + Filter Status (Kotak Kuning) + Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Kotak Hijau: Search Bar Panjang (flex-1) */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                </div>

                {/* Kotak Kuning: Filter Status Dropdown */}
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full sm:w-44 py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700"
                >
                    <option value="">All Status</option>
                    <option value="FULLTIME">FULLTIME</option>
                    <option value="PART-TIME">PART-TIME</option>
                    <option value="INTERNSHIP">INTERNSHIP</option>
                    <option value="FREELANCE">FREELANCE</option>
                </select>

                {/* Button Tambah Karyawan */}
                <Link
                    href="/manpower/new"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Add Employee
                </Link>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 tracking-wider">
                                <th className="py-3.5 px-6">Employee Name</th>
                                <th className="py-3.5 px-6">Status</th>
                                <th className="py-3.5 px-6">Skill</th>
                                <th className="py-3.5 px-6">Position</th>
                                <th className="py-3.5 px-6">Phone Number</th>
                                <th className="py-3.5 px-6">Email</th>
                                <th className="py-3.5 px-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {currentData.length > 0 ? (
                                currentData.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-900">{emp.name}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeStyle(
                                                    emp.status
                                                )}`}
                                            >
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{emp.skill}</td>
                                        <td className="py-4 px-6 text-gray-600">{emp.position}</td>
                                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{emp.phone}</td>
                                        <td className="py-4 px-6 text-gray-600">{emp.email}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link href={`/manpower/${emp.id}`} className="text-blue-500 hover:text-blue-700">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/manpower/${emp.id}/edit`} className="text-amber-500 hover:text-amber-700">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(emp.id)} className="text-rose-500 hover:text-rose-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-400">
                                        Tidak ada data karyawan ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Kotak Ungu: Footer Showing Data & Pagination (5, 10, 20, 50) */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                        <span>Showing</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="py-1 px-2.5 border border-gray-200 rounded-md bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>
                            entries ({totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries})
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}