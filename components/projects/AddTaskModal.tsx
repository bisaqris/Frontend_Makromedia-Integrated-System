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
  onSave: (task: Omit<ProjectTask, 'id'>) => void;
  editTask?: ProjectTask;
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
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [picName, setPicName] = useState('Anton W.');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  // React 19 / Next 16 clean prop sync during render
  const [prevEditTask, setPrevEditTask] = useState<ProjectTask | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  if (isOpen !== prevIsOpen || editTask !== prevEditTask) {
    setPrevIsOpen(isOpen);
    setPrevEditTask(editTask);
    if (isOpen) {
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

        setPicName(editTask.picName || 'Anton W.');
        setStatus(editTask.status || 'TODO');
      } else {
        setTitle('');
        setDescription('');
        setDueDate(getTodayDateString());
        setPicName('Anton W.');
        setStatus('TODO');
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || getTodayDateString(),
      picName: picName.trim() || 'Anton W.',
      status,
    });

    onClose();
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
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Deskripsi Task */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi / Petunjuk Teknis
          </label>
          <Input
            placeholder="misal: Persiapan kamera, switcher, dan kabel di venue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Grid: Deadline Date Picker & PIC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline / Target Tanggal <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIC / Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="misal: Anton W."
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status Task
          </label>
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
          />
        </div>

        {/* Action Buttons */}
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
