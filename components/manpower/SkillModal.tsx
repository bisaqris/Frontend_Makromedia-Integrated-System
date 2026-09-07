'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skill, CreateSkillDTO } from '@/types/manpower';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

const skillSchema = z.object({
    name: z.string().min(1, 'Nama skill wajib diisi'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSkillDTO) => Promise<void>;
    initialData?: Skill | null;
    isLoading?: boolean;
}

export default function SkillModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: SkillModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<SkillFormValues>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            status: 'ACTIVE',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                status: initialData.status || 'ACTIVE',
            });
        } else {
            reset({
                name: '',
                status: 'ACTIVE',
            });
        }
    }, [initialData, reset, isOpen]);

    if (!isOpen) return null;

    const onFormSubmit = async (data: SkillFormValues) => {
        const payload: CreateSkillDTO = {
            name: data.name,
            status: data.status,
            category: data.status === 'ACTIVE' ? 'Active' : 'Inactive',
        };

        await onSubmit(payload);
        onClose();
    };

    const handleReset = () => {
        if (initialData) {
            reset({
                name: initialData.name,
                status: initialData.status || 'ACTIVE',
            });
        } else {
            reset({
                name: '',
                status: 'ACTIVE',
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-100">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4">
                    <h3 className="text-lg font-bold text-zinc-900">
                        {initialData ? 'Edit Skill' : 'Tambah Skill Baru'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 mt-2">
                    {/* Skill Name Field */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                            Skill Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g Videographer"
                            {...register('name')}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Status Selection Cards (Gambar 3) */}
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {/* Active Option */}
                                <label
                                    onClick={() => field.onChange('ACTIVE')}
                                    className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${field.value === 'ACTIVE'
                                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="mt-0.5">
                                        <div
                                            className={`h-5 w-5 rounded-full border flex items-center justify-center ${field.value === 'ACTIVE'
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-zinc-300 bg-white'
                                                }`}
                                        >
                                            {field.value === 'ACTIVE' && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-zinc-900">
                                            Active
                                        </span>
                                        <span className="block text-xs text-zinc-400 mt-0.5">
                                            Bisa dipakai manpower
                                        </span>
                                    </div>
                                </label>

                                {/* Inactive Option */}
                                <label
                                    onClick={() => field.onChange('INACTIVE')}
                                    className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${field.value === 'INACTIVE'
                                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="mt-0.5">
                                        <div
                                            className={`h-5 w-5 rounded-full border flex items-center justify-center ${field.value === 'INACTIVE'
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-zinc-300 bg-white'
                                                }`}
                                        >
                                            {field.value === 'INACTIVE' && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-zinc-900">
                                            Inactive
                                        </span>
                                        <span className="block text-xs text-zinc-400 mt-0.5">
                                            Tidak muncul di manpower
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}
                    />

                    {/* Modal Footer Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}