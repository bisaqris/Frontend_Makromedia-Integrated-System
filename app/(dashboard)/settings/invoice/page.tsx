'use client';

import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { invoiceSettingService, DEFAULT_INVOICE_SETTING, cleanSignerName } from '@/lib/services/invoiceSettingService';
import { InvoiceSetting, InvoiceBankAccount } from '@/types/invoice-setting';
import { userService } from '@/lib/services/userService';
import { User } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import {
  Percent,
  CreditCard,
  FileText,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  Save,
  CheckCircle2,
  Building,
  Calculator,
  PenTool,
  Upload,
  FileCheck,
  Info,
} from 'lucide-react';

const formatRupiahWithSpace = (val: number) => {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
};

const ALLOWED_SIGNER_ROLES = ['DIREKTUR', 'FINANCE', 'SALES'];

const formatRoleTitle = (role?: string) => {
  switch (role) {
    case 'DIREKTUR':
      return 'Direktur Utama';
    case 'PROJECT_MANAGER':
      return 'Project Manager';
    case 'FINANCE':
      return 'Finance Manager';
    case 'SALES':
      return 'Sales Manager';
    case 'PRODUKSI':
      return 'Head of Production';
    default:
      return 'Penanggung Jawab';
  }
};

function InvoiceSettingContent() {
  const [setting, setSetting] = useState<InvoiceSetting>(() => {
    const s = invoiceSettingService.getSetting();
    const clean = cleanSignerName(s.signerName);
    return { ...s, signerName: clean };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bank Modal states
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState<Omit<InvoiceBankAccount, 'id'>>({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
  });

  // Terms state
  const [newTermInput, setNewTermInput] = useState('');

  useEffect(() => {
    // Hydrate latest invoice setting from localStorage on client mount
    const saved = invoiceSettingService.getSetting();
    setSetting({
      ...saved,
      signerName: cleanSignerName(saved.signerName),
    });

    let isMounted = true;
    invoiceSettingService
      .fetchFromBackend()
      .then((fresh) => {
        if (isMounted && fresh) {
          setSetting({
            ...fresh,
            signerName: cleanSignerName(fresh.signerName),
          });
        }
      })
      .catch(() => {});

    userService
      .getUsers()
      .then((users) => {
        if (isMounted && Array.isArray(users)) {
          setUserList(users);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingUsers(false);
      });

    const handleSettingUpdate = () => {
      const latest = invoiceSettingService.getSetting();
      if (isMounted) {
        setSetting({
          ...latest,
          signerName: cleanSignerName(latest.signerName),
        });
      }
    };
    window.addEventListener('makromedia:invoice-setting-updated', handleSettingUpdate);
    window.addEventListener('storage', handleSettingUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('makromedia:invoice-setting-updated', handleSettingUpdate);
      window.removeEventListener('storage', handleSettingUpdate);
    };
  }, []);

  const handlePphPercentChange = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setSetting((prev) => ({
      ...prev,
      pphPercent: clamped,
    }));
  };

  const handleSelectUser = (userId: string) => {
    const selected = userList.find((u) => u.id === userId);
    if (!selected) {
      setSetting((prev) => {
        const next = {
          ...prev,
          signerUserId: '',
          signerName: '',
          signerPosition: '',
        };
        invoiceSettingService.updateSetting({
          signerUserId: '',
          signerName: '',
          signerPosition: '',
        });
        return next;
      });
      return;
    }
    if (!ALLOWED_SIGNER_ROLES.includes(selected.role)) {
      showToast.error('Hanya Direktur, Finance, dan Sales yang berwenang menandatangani Invoice & Quotation.');
      return;
    }
    const cleanName = selected.name.replace(/\s*\([^)]*\)/g, '').trim();
    const position = formatRoleTitle(selected.role);
    setSetting((prev) => {
      const next = {
        ...prev,
        signerUserId: selected.id,
        signerName: cleanName,
        signerPosition: position,
      };
      invoiceSettingService.updateSetting({
        signerUserId: selected.id,
        signerName: cleanName,
        signerPosition: position,
      });
      return next;
    });
    showToast.info(`Nama (${cleanName}) dan jabatan (${position}) diterapkan.`);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('Harap unggah file gambar (PNG, JPG, atau WEBP).');
      return;
    }

    const MAX_SIGNATURE_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIGNATURE_IMAGE_SIZE) {
      showToast.error('Ukuran file tanda tangan melebihi batas maksimal 10MB.');
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const maxWidth = 500;
          const maxHeight = 250;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/png');
            setSetting((prev) => {
              const next = {
                ...prev,
                signerSignatureUrl: compressed,
              };
              invoiceSettingService.updateSetting({ signerSignatureUrl: compressed });
              return next;
            });
            showToast.success('Tanda tangan berhasil diunggah.');
            return;
          }
        } catch {
          // fallback
        }
        setSetting((prev) => {
          const next = {
            ...prev,
            signerSignatureUrl: rawDataUrl,
          };
          invoiceSettingService.updateSetting({ signerSignatureUrl: rawDataUrl });
          return next;
        });
        showToast.success('Tanda tangan berhasil diunggah.');
      };
      img.onerror = () => {
        showToast.error('Gagal memproses file gambar tanda tangan.');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setSetting((prev) => {
      const next = {
        ...prev,
        signerSignatureUrl: '',
      };
      invoiceSettingService.updateSetting({ signerSignatureUrl: '' });
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast.info('Tanda tangan dihapus.');
  };

  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    const itemToAdd = newTermInput.trim();
    setSetting((prev) => {
      const updatedTerms = [...(prev.termsOfCondition || []), itemToAdd];
      const next = {
        ...prev,
        termsOfCondition: updatedTerms,
      };
      invoiceSettingService.updateSetting({ termsOfCondition: updatedTerms });
      return next;
    });
    setNewTermInput('');
    showToast.success('Poin syarat & ketentuan ditambahkan.');
  };

  const handleRemoveTerm = (index: number) => {
    setSetting((prev) => {
      const updatedTerms = (prev.termsOfCondition || []).filter((_, i) => i !== index);
      const next = {
        ...prev,
        termsOfCondition: updatedTerms,
      };
      invoiceSettingService.updateSetting({ termsOfCondition: updatedTerms });
      return next;
    });
    showToast.info('Poin syarat & ketentuan dihapus.');
  };

  const handleOpenBankModal = (bank?: InvoiceBankAccount) => {
    if (bank) {
      setEditingBankId(bank.id);
      setBankForm({
        bankName: bank.bankName,
        accountHolder: bank.accountHolder,
        accountNumber: bank.accountNumber,
      });
    } else {
      setEditingBankId(null);
      setBankForm({
        bankName: '',
        accountHolder: '',
        accountNumber: '',
      });
    }
    setIsBankModalOpen(true);
  };

  const handleSaveBank = () => {
    if (!bankForm.bankName.trim() || !bankForm.accountHolder.trim() || !bankForm.accountNumber.trim()) {
      showToast.error('Seluruh kolom informasi bank wajib diisi.');
      return;
    }

    if (editingBankId) {
      setSetting((prev) => {
        const updatedAccounts = prev.bankAccounts.map((b) =>
          b.id === editingBankId ? { ...b, ...bankForm } : b
        );
        const next = {
          ...prev,
          bankAccounts: updatedAccounts,
        };
        invoiceSettingService.updateSetting({ bankAccounts: updatedAccounts });
        return next;
      });
      showToast.success('Rekening bank berhasil diperbarui.');
    } else {
      const newAcc: InvoiceBankAccount = {
        id: `acc-${Date.now()}`,
        ...bankForm,
      };
      setSetting((prev) => {
        const updatedAccounts = [...prev.bankAccounts, newAcc];
        const next = {
          ...prev,
          bankAccounts: updatedAccounts,
        };
        invoiceSettingService.updateSetting({ bankAccounts: updatedAccounts });
        return next;
      });
      showToast.success('Rekening bank baru berhasil ditambahkan.');
    }
    setIsBankModalOpen(false);
  };

  const handleDeleteBank = (id: string) => {
    if (setting.bankAccounts.length <= 1) {
      showToast.error('Minimal harus ada 1 rekening terdaftar pada invoice.');
      return;
    }
    setSetting((prev) => {
      const updatedAccounts = prev.bankAccounts.filter((b) => b.id !== id);
      const next = {
        ...prev,
        bankAccounts: updatedAccounts,
      };
      invoiceSettingService.updateSetting({ bankAccounts: updatedAccounts });
      return next;
    });
    showToast.success('Rekening bank berhasil dihapus.');
  };

  const handleResetToDefault = () => {
    setSetting({ ...DEFAULT_INVOICE_SETTING });
    showToast.info('Pengaturan dikembalikan ke default.');
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const cleaned: InvoiceSetting = {
        ...setting,
        signerName: cleanSignerName(setting.signerName),
      };
      setSetting(cleaned);
      await invoiceSettingService.saveSetting(cleaned);
      showToast.success('Pengaturan Invoice & Quotation berhasil disimpan.');
    } catch {
      showToast.error('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview simulation
  const sampleSubtotal = 10000000;
  const samplePphAmount = (sampleSubtotal * setting.pphPercent) / 100;
  const sampleTotal = sampleSubtotal + samplePphAmount;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header bar action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Pengaturan Invoice & Dokumen Pembayaran</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi tarif PPh, tanda tangan (TTD), penanggung jawab, rekening resmi, dan syarat ketentuan (berlaku untuk Invoice & Quotation).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Default
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </div>

      {/* Reminder Banner */}
      <div className="flex items-start sm:items-center gap-3 px-4 py-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-blue-900">Perhatian:</strong> Apabila ada perubahan pada tarif PPh, penanggung jawab, rekening bank, atau syarat & ketentuan, pastikan untuk menekan tombol <strong className="font-semibold text-blue-900">&quot;Simpan Pengaturan&quot;</strong> di pojok kanan atas agar perubahan tersimpan permanen ke server dan otomatis tersinkronisasi ke seluruh dokumen Invoice & Quotation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (7 col): PPh, TTD & Signer, Syarat Ketentuan */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Pengaturan Tarif PPh */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Percent className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-800">Tarif Pajak Penghasilan (PPh)</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tarif PPh (%)
                </label>
                {/* Full Width Container */}
                <div className="relative w-full">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={setting.pphPercent}
                    onChange={(e) => handlePphPercentChange(Number(e.target.value) || 0)}
                    className="w-full pr-10 text-sm font-bold text-slate-800 h-10"
                    placeholder="2"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 leading-relaxed space-y-1">
                <p className="font-semibold text-slate-700">Informasi Tarif PPh:</p>
                <p>
                  Tarif PPh ini berlaku otomatis untuk seluruh invoice proyek (standar jasa vendor event/kreatif umumnya adalah <strong>2%</strong>).
                  Pada halaman proyek, tarif ini terkunci agar tidak dapat diubah sembarangan dan menjaga konsistensi keuangan.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Pejabat Penandatangan & Tanda Tangan (TTD) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Penanggung Jawab & Tanda Tangan (TTD)</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Invoice & Quotation
              </span>
            </div>

            <div className="space-y-4">
              {/* Fetch User Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih dari Data Pengguna / Karyawan (Auto-fetch)
                </label>
                <select
                  value={setting.signerUserId || ''}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  disabled={isLoadingUsers}
                  className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="">-- Pilih Pejabat Berwenang (Direktur, Finance, Sales) --</option>
                  {userList
                    .filter((user) => ALLOWED_SIGNER_ROLES.includes(user.role))
                    .map((user) => {
                      const cleanName = user.name.replace(/\s*\([^)]*\)/g, '').trim();
                      return (
                        <option key={user.id} value={user.id}>
                          {cleanName} - {formatRoleTitle(user.role)}
                        </option>
                      );
                    })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hanya role Direktur, Finance, dan Sales yang berwenang menandatangani Invoice &amp; Quotation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Penanggung Jawab
                  </label>
                  <Input
                    type="text"
                    value={cleanSignerName(setting.signerName)}
                    disabled
                    readOnly
                    placeholder="Otomatis terisi dari pilihan di atas"
                    className="text-xs h-9.5 bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Jabatan (Title / Position)
                  </label>
                  <Input
                    type="text"
                    value={setting.signerPosition || ''}
                    disabled
                    readOnly
                    placeholder="Otomatis terisi dari pilihan di atas"
                    className="text-xs h-9.5 bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Tanda Tangan (TTD) Upload & Preview */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Gambar Tanda Tangan (TTD) Digital
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />

                {setting.signerSignatureUrl ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-28 bg-white border border-slate-200 rounded-lg p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                        <img
                          src={setting.signerSignatureUrl}
                          alt="Tanda tangan"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          TTD Terpasang
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Tanda tangan ini akan otomatis dicetak pada invoice & quotation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        className="text-xs h-8"
                      >
                        Ganti
                      </Button>
                      <button
                        type="button"
                        onClick={handleRemoveSignature}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Tanda Tangan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/60 rounded-xl p-5 text-center cursor-pointer transition-colors space-y-1.5 select-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Klik untuk Mengunggah Tanda Tangan (TTD)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Format PNG / JPG (disarankan background transparan). Maks. 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Syarat & Ketentuan (Terms of Condition) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Syarat & Ketentuan (Terms of Condition)</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {(setting.termsOfCondition || []).length} Poin
              </span>
            </div>

            <div className="space-y-2.5">
              {(setting.termsOfCondition || []).map((term, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <span className="font-bold text-primary mt-0.5 min-w-[16px]">{index + 1}.</span>
                  <span className="flex-1 leading-relaxed">{term}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(index)}
                    className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    title="Hapus Poin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                type="text"
                placeholder="Tuliskan poin syarat & ketentuan baru..."
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
                className="text-xs h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTerm}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="shrink-0 h-9 text-xs"
              >
                Tambah
              </Button>
            </div>
          </div>

          {/* Card 4: Instruksi Pembayaran (Payment Instruction) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-800">Instruksi Pembayaran (Payment Instruction)</h3>
            </div>
            <textarea
              rows={3}
              value={setting.paymentInstruction || ''}
              onChange={(e) => setSetting((prev) => ({ ...prev, paymentInstruction: e.target.value }))}
              placeholder="Tuliskan instruksi pembayaran invoice..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition-colors resize-none text-slate-700 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Instruksi ini akan otomatis tercantum pada bagian bawah dokumen invoice yang diterbitkan.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN (5 col): Live Simulation Box & Rekening Bank */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 5: Simulasi Perhitungan PPh & Preview TTD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Simulasi Dokumen & TTD</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Live Preview
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Sub Total (Contoh):</span>
                <span className="font-bold text-slate-800">{formatRupiahWithSpace(sampleSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>PPH ({setting.pphPercent}%):</span>
                <span className="font-bold text-slate-800">+{formatRupiahWithSpace(samplePphAmount)}</span>
              </div>

              <div className="border-b border-slate-100 pt-1" />

              {/* Highlighted Orange Total Box matching Project Detail */}
              <div className="p-4 bg-orange-50/70 border border-orange-100/60 rounded-xl flex justify-between items-center mt-2">
                <span className="text-xs sm:text-sm font-extrabold text-accent">Total Invoice Setelah PPh</span>
                <span className="text-sm sm:text-base font-extrabold text-accent">
                  {formatRupiahWithSpace(sampleTotal)}
                </span>
              </div>

              {/* Preview Blok Tanda Tangan */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Preview Tanda Tangan Dokumen:
                </span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center space-y-1.5">
                  <p className="font-bold text-slate-800 text-xs">
                    {setting.signerName || 'Nama Penanggung Jawab'}
                  </p>
                  <div className="h-12 flex items-center justify-center">
                    {setting.signerSignatureUrl ? (
                      <img
                        src={setting.signerSignatureUrl}
                        alt="Preview Tanda Tangan"
                        className="max-h-12 max-w-[120px] object-contain"
                      />
                    ) : (
                      <svg className="w-20 h-8 text-slate-400 stroke-current fill-none opacity-60" viewBox="0 0 100 40">
                        <path
                          d="M10,25 C25,5 35,35 45,15 C55,-5 65,30 85,20 C70,40 50,30 30,35"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <p className="text-[11px] text-slate-600 font-medium">
                      {setting.signerPosition || 'Jabatan / Title'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Rekening Bank Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Rekening Penerima Pembayaran</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenBankModal()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs h-8"
              >
                Tambah
              </Button>
            </div>

            <div className="space-y-3">
              {setting.bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors space-y-1 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {account.bankName}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenBankModal(account)}
                        className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="Edit Rekening"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(account.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    a/n <strong className="text-slate-800">{account.accountHolder}</strong>
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    No. Rek: <strong className="text-slate-700">{account.accountNumber}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Bank Account */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title={editingBankId ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Bank
            </label>
            <Input
              type="text"
              placeholder="e.g. Bank Central Asia (BCA)"
              value={bankForm.bankName}
              onChange={(e) => setBankForm((prev) => ({ ...prev, bankName: e.target.value }))}
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Atas Nama Rekening (Account Holder)
            </label>
            <Input
              type="text"
              placeholder="e.g. PT Makromedia Visual"
              value={bankForm.accountHolder}
              onChange={(e) => setBankForm((prev) => ({ ...prev, accountHolder: e.target.value }))}
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nomor Rekening
            </label>
            <Input
              type="text"
              placeholder="e.g. 8220918231"
              value={bankForm.accountNumber}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/[^0-9-]/g, '');
                setBankForm((prev) => ({ ...prev, accountNumber: numericOnly }));
              }}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBankModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveBank}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {editingBankId ? 'Simpan Perubahan' : 'Tambah Rekening'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function InvoiceSettingPage() {
  return (
    <RoleGuard allowed={['DIREKTUR', 'FINANCE']} fallbackMode="redirect" redirectTo="/dashboard">
      <InvoiceSettingContent />
    </RoleGuard>
  );
}
