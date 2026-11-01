'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ProjectTask } from '@/types/project';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ProjectTask, 'id'>) => void | Promise<void>;
  editTask?: ProjectTask;
  supportsPicName?: boolean;
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
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [picName, setPicName] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [titleError, setTitleError] = useState('');

  // React 19 / Next 16 clean prop sync during render
  const [prevEditTask, setPrevEditTask] = useState<ProjectTask | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  if (isOpen !== prevIsOpen || editTask !== prevEditTask) {
    setPrevIsOpen(isOpen);
    setPrevEditTask(editTask);
    if (isOpen) {
      setTitleError('');
      if (editTask) {
        setTitle(editTask.title || '');
        setDescription(editTask.description || '');

        // If editTask has date string, format to YYYY-MM-DD if needed
        const rawDate = editTask.dueDate || getTodayDateString();
        if (rawDate.includes('-') && rawDate.split('-').length === 3) {
          setDueDate(rawDate);
        } else {
          setDueDate(getTodayDateString());
        }

        setPicName(editTask.picName || '');
        setStatus(editTask.status || 'TODO');
      } else {
        setTitle('');
        setDescription('');
        setDueDate(getTodayDateString());
        setPicName('');
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

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || getTodayDateString(),
        picName: picName.trim(),
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

        {/* PIC Name */}
        {supportsPicName && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIC / Penanggung Jawab
            </label>
            <Input
              placeholder="misal: Budi Santoso / Vendor Stage"
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Batas Waktu (Due Date)
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
