# Makromedia Integrated System — Frontend

Frontend untuk **Makromedia Integrated System**, aplikasi manajemen proyek terintegrasi untuk
CV. Makromedia Visual — mencakup manajemen proyek, quotation, invoice, biaya produksi, approval,
manpower, dan data client, dengan akses berbasis role (RBAC).

Repo backend terpisah, dikelola oleh tim BE (NestJS + PostgreSQL).

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) + TypeScript |
| Styling | Tailwind CSS — gaya *Notion-style*, warna utama **biru** & **oranye** |
| State management | React Context (Auth & Session) |
| Form & validasi | react-hook-form + zod |
| HTTP client | axios (instance terpusat + interceptor JWT) |
| Notifikasi | react-hot-toast |
| Package manager | **pnpm** |
| Auth | JWT (Bearer token) |

---

## Prasyarat

- [Node.js](https://nodejs.org/) LTS (v18 atau v20 ke atas)
- [pnpm](https://pnpm.io/)
  ```bash
  npm install -g pnpm
  ```

## Instalasi & Menjalankan Project

```bash
git clone https://github.com/bisaqris/Frontend_Makromedia-Integrated-System.git
cd Frontend_Makromedia-Integrated-System
pnpm install
cp .env.example .env.local   # lalu isi NEXT_PUBLIC_API_URL sesuai base URL backend
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Deskripsi |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL REST API backend (NestJS) |

---

## Role & Hak Akses (RBAC)

Sistem punya 5 role dengan tampilan & akses yang berbeda:

| Role | Ringkasan Akses |
|---|---|
| **Direktur** | Akses penuh ke semua modul, termasuk approval (Production Cost, Quotation, Invoice) dan manajemen Manpower & Client Data. |
| **Finance** | Sama seperti Sales, ditambah kelolaan penuh atas Production Cost/Quotation/Invoice di tiap proyek. Tidak punya akses approval. |
| **Sales** | Kelola proyek (tambah/edit/hapus), buat Quotation & Invoice, kelola data Client & Manpower. Tidak punya akses approval. |
| **Project Manager (PM)** | Hanya melihat daftar proyek yang dipegangnya (tanpa tambah/edit/hapus), kelola Production Cost proyek (ajukan ke Direktur), kelola Production Task. |
| **Production Team (Produksi)** | Hanya melihat daftar proyek (read-only), update progress Production Task. Tidak punya akses ke data finansial sama sekali. |

Detail lengkap perbedaan tampilan per role ada di bagian [Catatan Desain per Role](#catatan-desain-per-role).

---

## Struktur Folder

```
├── app/
│   ├── (auth)/
│   │   └── login/                  # Halaman login
│   └── (dashboard)/
│       ├── dashboard/               # Dashboard (2 varian sesuai role)
│       ├── projects/
│       │   ├── page.tsx             # List Project
│       │   ├── new/                 # Add New Project (2 step: Input Data → Summary)
│       │   ├── history/             # History Project
│       │   └── [id]/                # Detail Project (tab dinamis sesuai role)
│       ├── quotations/[id]/
│       │   ├── approve/             # Approval Quotation (khusus Direktur)
│       │   └── preview/             # Preview dokumen Quotation
│       ├── invoices/[id]/
│       │   ├── approve/             # Approval Invoice (khusus Direktur)
│       │   └── preview/             # Preview dokumen Invoice
│       ├── production-cost/[id]/
│       │   └── approve/             # Approval Production Cost (khusus Direktur)
│       ├── application-cost/        # List Application Cost (khusus Direktur)
│       ├── manpower/
│       │   ├── page.tsx             # List Data Manpower
│       │   ├── new/                 # Add New Manpower
│       │   ├── [id]/                # Detail Manpower
│       │   └── skills/              # Skill Management
│       ├── clients/
│       │   ├── pic/                 # List & Add Data PIC Client
│       │   └── company/             # List & Add Data Client Company
│       └── profile/                 # Profile pengguna
├── components/
│   ├── ui/                          # Komponen dasar: Button, Input, Select, Card, Modal, Toast, Badge, Tabs
│   ├── layout/                      # Sidebar, Topbar
│   └── shared/                      # DataTable, ConfirmModal, StatusBadge, EmptyState,
│                                     # LineItemTable, RichTextEditor, CalendarView, DocumentPreview
├── lib/
│   ├── apiClient.ts                 # Axios instance + interceptor JWT
│   ├── auth.ts                      # Helper auth & RBAC (hasAccess, RoleGuard)
│   ├── roles.ts                     # Definisi role & mapping akses menu
│   └── services/                    # Service per modul (projectService.ts, dst)
├── types/                           # Definisi TypeScript (project, quotation, invoice, manpower, client, user)
├── .env.example
└── README.md
```

---

## Modul & Fitur

| Modul | Deskripsi |
|---|---|
| **Auth** | Login dengan email & password, JWT disimpan di client, redirect otomatis via middleware. |
| **Dashboard** | Kalender bulanan proyek. Direktur/Finance/Sales melihat ringkasan finansial; PM/Produksi melihat ringkasan jumlah proyek per kategori. |
| **Project Management** | CRUD proyek, detail proyek dengan tab dinamis (Project Information, Payment Status/Production Cost, Production Task), history proyek selesai. |
| **Quotation & Invoice** | Buat, edit, ajukan dokumen penawaran & tagihan; approval & preview dokumen siap cetak (khusus Direktur). |
| **Production Cost** | Pencatatan biaya produksi per kategori (Fee SDM, Vendor, Alat & Bahan, dll), pengajuan ke Direktur, approval. |
| **Application Cost** | Daftar seluruh pengajuan (Production Cost/Quotation/Invoice) yang menunggu keputusan Direktur. |
| **Production Task** | Checklist tugas produksi, progress bar, dan brief proyek (rich text editor). |
| **Manpower** | Data tenaga kerja & manajemen skill (khusus Direktur). |
| **Client Data** | Data PIC Client & Client Company. |
| **Profile** | Pengaturan data pribadi pengguna. |

---

## Catatan Desain per Role

Beberapa halaman punya perbedaan struktur signifikan antar role (bukan sekadar disembunyikan via
CSS), jadi wajib diperhatikan saat development/QA:

- **Dashboard**: Direktur/Finance/Sales → 4 card finansial. PM/Produksi → 5 card kategori proyek,
  **tanpa** data finansial sama sekali.
- **List Project**: Direktur/Finance/Sales → action penuh (view/edit/delete) + tombol Add Project.
  PM/Produksi → **hanya action view**, tanpa tombol Add Project.
- **Detail Project (tab)**:
  - Direktur/Finance/Sales → 3 tab: Project Information, **Payment Status** (berisi sub-tab
    Production Cost/Quotation/Invoice), Production Task.
  - Project Manager → 3 tab: Project Information, **Production Cost** (tab mandiri, tanpa
    Quotation/Invoice), Production Task.
  - Produksi → **2 tab saja**: Project Information, Production Task. Tab finansial tidak dirender
    sama sekali. General Brief tampil read-only untuk role ini.
- **Sidebar**: Direktur punya semua section (Main Dashboard, List Application Cost, Sales,
  Manpower, Client Data). Finance/Sales sama tanpa List Application Cost. PM/Produksi hanya
  section "Production" (List Project, History).
- **Approval Production Cost** vs **Approval Quotation/Invoice**: strukturnya beda — Production
  Cost tidak punya halaman Preview dokumen, sementara Quotation & Invoice punya.

---

## Konvensi Development

### Branch
- `main` — hanya kondisi stabil/release.
- `develop` — branch kerja utama, tempat integrasi semua fitur.
- `feat/nama-fitur`, `fix/nama-bug`, `chore/nama-task` — dibuat dari `develop`.

### Commit
Menggunakan [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(scope): fitur baru
fix(scope): perbaikan bug
style(scope): perubahan UI/styling
refactor(scope): restrukturisasi kode
chore(scope): setup, config, dependency
docs(scope): dokumentasi
```

---