'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import DatePickerInput from '@/components/ui/DatePickerInput';
import { ProjectTask } from '@/types/project';
import { toInputDateFormat } from '@/lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ProjectTask, 'id'>) => void | Promise<void>;
  editTask?: ProjectTask;
  supportsPicName?: boolean;
  projectStartDate?: string;
  projectEndDate?: string;
  assignees?: Array<{ id: string; name: string; role?: string }>;
}

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  supportsPicName = true,
  projectStartDate,
  projectEndDate,
  assignees = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [picName, setPicName] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [isManualPic, setIsManualPic] = useState(false);
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [titleError, setTitleError] = useState('');
  const [dueDateError, setDueDateError] = useState('');

  // React 19 / Next 16 clean prop sync during render
  const [prevEditTask, setPrevEditTask] = useState<ProjectTask | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  if (isOpen !== prevIsOpen || editTask !== prevEditTask) {
    setPrevIsOpen(isOpen);
    setPrevEditTask(editTask);
    if (isOpen) {
      setTitleError('');
      setDueDateError('');
      if (editTask) {
        setTitle(editTask.title || '');
        setDescription(editTask.description || '');

        const rawDate = toInputDateFormat(editTask.dueDate) || getTodayDateString();
        setDueDate(rawDate);

        setPicName(editTask.picName || '');
        const existingAssignedId = editTask.assignedToId || '';
        if (existingAssignedId) {
          setAssignedToId(existingAssignedId);
        } else if (editTask.picName) {
          const match = assignees.find((a) => a.name.toLowerCase() === editTask.picName?.toLowerCase());
          setAssignedToId(match ? match.id : '');
        } else {
          setAssignedToId('');
        }
        setStatus(editTask.status || 'TODO');
      } else {
        setTitle('');
        setDescription('');
        setDueDate(getTodayDateString());
        setPicName('');
        setAssignedToId('');
        setStatus('TODO');
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Judul task wajib diisi.');
      return;
    }

    if (projectStartDate && dueDate && dueDate < projectStartDate) {
      setDueDateError(`Due date tidak boleh lebih awal dari tanggal mulai proyek (${projectStartDate}).`);
      return;
    }

    if (projectEndDate && dueDate && dueDate > projectEndDate) {
      setDueDateError(`Due date tidak boleh melebihi batas waktu (deadline) proyek (${projectEndDate}).`);
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || getTodayDateString(),
        picName: picName.trim(),
        assignedToId: assignedToId || undefined,
        status,
      });
      onClose();
    } catch {
      // The caller reports the API error; keep the entered values available for retry.
    }
  };

  const isEditing = !!editTask;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task Production' : 'Tambah Task Production'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Judul Task */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Task Pekerjaan <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="misal: Technical rundown draft / Setup Stage"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            error={titleError}
            required
          />
        </div>

        {/* Deskripsi Task */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Pekerjaan
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rincian checklist atau instruksi pengerjaan..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* PIC / Penugasan Tim Produksi */}
        {supportsPicName && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIC Tim Produksi
            </label>
            {assignees.length > 0 ? (
              <Select
                value={assignedToId}
                onChange={(e) => {
                  const val = e.target.value;
                  setAssignedToId(val);
                  const found = assignees.find((a) => a.id === val);
                  if (found) setPicName(found.name);
                  else if (!val) setPicName('');
                }}
                options={[
                  { value: '', label: '-- Pilih Anggota Tim Produksi --' },
                  ...assignees.map((a) => ({
                    value: a.id,
                    label: a.name,
                  })),
                ]}
                className="w-full"
              />
            ) : (
              <Input
                placeholder="Nama PIC Tim Produksi"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Batas Waktu (Due Date)
            </label>
            <DatePickerInput
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (dueDateError) setDueDateError('');
              }}
              error={dueDateError}
              min={toInputDateFormat(projectStartDate)}
              max={toInputDateFormat(projectEndDate)}
              placeholder="Pilih due date"
            />
          </div>

          {/* Status Task */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Pengerjaan
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isEditing ? 'Simpan Perubahan' : 'Tambah Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
