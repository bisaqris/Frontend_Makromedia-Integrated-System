'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

const AVAILABLE_SKILLS = [
    'Leadership',
    'Management',
    'Director of Photography (DoP)',
    'Camera Operator / Cameraman',
    'Video Editor (Premiere / DaVinci)',
    'Lighting Technician / Gaffer',
    'Audio Recordist / Sound Engineer',
    'Drone Pilot (Certified)',
    'Project Management',
    'Strategic Planning',
    'Public Speaking',
    'Event Production',
    'Budgeting & Finance',
    'Client Relations',
];

export default function AddEmployeePage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        gender: 'Male',
        province: '',
        city: '',
        subdistrict: '',
        village: '',
        detailAddress: '',
        status: 'FULLTIME',
        skills: ['Leadership', 'Management'] as string[],
        position: '',
        bankAccount: '',
        accountNumber: '',
    });

    // State untuk Multi-Select Dropdown Skill
    const [isSkillOpen, setIsSkillOpen] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const skillDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
                setIsSkillOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSkill = (skill: string) => {
        if (formData.skills.includes(skill)) {
            setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
        } else {
            setFormData({ ...formData, skills: [...formData.skills, skill] });
        }
    };

    const removeSkill = (skillToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillToRemove) });
    };

    const formatPhoneNumber = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 4) return cleaned;
        if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEmployee = {
            ...formData,
            id: Date.now().toString(),
            skill: formData.skills.join(', '), // gabungkan array skill untuk tampilan tabel
            phone: formatPhoneNumber(formData.phone),
        };

        const existingData = JSON.parse(localStorage.getItem('manpower_list') || '[]');
        const updatedData = [...existingData, newEmployee];
        localStorage.setItem('manpower_list', JSON.stringify(updatedData));

        router.push('/manpower');
    };

    const filteredSkills = AVAILABLE_SKILLS.filter((s) =>
        s.toLowerCase().includes(skillSearch.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Manpower</h1>
                <p className="text-xs text-gray-400">Add new Manpower</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Manpower Personal Data */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="border-b border-gray-100 pb-3">
                        <h2 className="text-base font-semibold text-blue-600">Manpower Personal Data</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="08xxxxxxxxxx"
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
                                placeholder="username@gmail.com"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Position Asli Province diganti menjadi Gender */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Pergeseran Alamat */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Province</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                placeholder="Province"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Subdistrict</label>
                            <input
                                type="text"
                                name="subdistrict"
                                value={formData.subdistrict}
                                onChange={handleChange}
                                placeholder="Subdistrict"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Village</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                placeholder="Village"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Detail Address disamakan ukurannya (bukan fullwidth/col-span-2 lagi) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Detail Address</label>
                            <input
                                type="text"
                                name="detailAddress"
                                value={formData.detailAddress}
                                onChange={handleChange}
                                placeholder="Jl. Simpang Sulfat..."
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Manpower Status and Banking Information */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6 overflow-visible">
                    <div className="border-b border-gray-100 pb-3">
                        <h2 className="text-base font-semibold text-blue-600">Manpower Status and Banking Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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

                        {/* Kotak Hijau: Dynamic Skill Multi-Select Component */}
                        <div className="relative" ref={skillDropdownRef}>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Skill</label>

                            {/* Trigger Box */}
                            <div
                                onClick={() => setIsSkillOpen(!isSkillOpen)}
                                className="w-full min-h-[44px] p-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white cursor-pointer flex items-center justify-between gap-2"
                            >
                                <div className="flex flex-wrap gap-1.5 items-center flex-1">
                                    {formData.skills.length > 0 ? (
                                        formData.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium border border-blue-100"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={(e) => removeSkill(skill, e)}
                                                    className="hover:text-blue-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 px-1.5">Skill</span>
                                    )}
                                </div>
                                <div className="text-gray-400 px-1">
                                    {isSkillOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>

                            {/* Dynamic Dropdown Modal */}
                            {isSkillOpen && (
                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 space-y-2">
                                    {/* Inner Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari skill..."
                                            value={skillSearch}
                                            onChange={(e) => setSkillSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    {/* Skills List */}
                                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                                        {filteredSkills.map((s) => {
                                            const isSelected = formData.skills.includes(s);
                                            return (
                                                <div
                                                    key={s}
                                                    onClick={() => toggleSkill(s)}
                                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50/60 text-blue-600 font-semibold'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    <span>{s}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Position</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="Position"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Bank Account</label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={formData.bankAccount}
                                onChange={handleChange}
                                placeholder="Bank Account"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                placeholder="Account number"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
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
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}