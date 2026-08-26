# ⚡ Hariyuka AI — Next-Generation Multi-Agent AI SEO Platform

[![Next.js](https://img.shields.io/badge/Next.js%2014-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ZeroGPT](https://img.shields.io/badge/ZeroGPT-0%25%20AI%20(Human%20Written)-emerald?style=for-the-badge)](https://zerogpt.com)
[![Yoast SEO](https://img.shields.io/badge/Yoast%20WordPress-Green%20Light%20SOP-success?style=for-the-badge)](https://yoast.com/)
[![Tiptap](https://img.shields.io/badge/Editor-Tiptap%20Suite-000000?style=for-the-badge)](https://tiptap.dev/)

> **Hariyuka AI** adalah platform **Self-Hosted AI SEO Article Writer & Content Authenticity Suite** berbasis **Multi-Agent Pipeline**. Dirancang khusus untuk menghasilkan artikel berbobot jurnalis, lolos sensor detektor AI (*0% AI on ZeroGPT*), mematuhi Standar Operasional Prosedur (SOP) Yoast WordPress, serta dilengkapi generator metadata (Slug & Meta Description) siap posting.

---

## 🌟 Fitur Unggulan

### 1. 🤖 5-Step Multi-Agent Generation Pipeline
* 🔍 **Step 1: Analisis SERP & Search Intent (`Gemini 3.7 Flash`)**
  Memindai kompetitor peringkat 1-3 Google, mengidentifikasi *search intent*, keyword LSI sekunder, entitas semantik, dan *People Also Ask* (PAA).
* 📑 **Step 2: Interactive Outline Review (`Gemini 3.7 Flash`)**
  Menyusun struktur H2/H3 berbobot kata dalam format JSON. Pipeline **dijeda (*pause*)** untuk memberi kebebasan pengguna mengedit, mengubah urutan (*reorder*), menambah sub-heading, atau menyesuaikan target kata.
* ✍️ **Step 3: Multi-Pass Section Writer (`Claude 4.6 Opus`)**
  Menulis artikel bagian per bagian dengan *Prompt Chaining*. Mempertahankan konteks bagian sebelumnya untuk mencegah repetisi dan menghasilkan gaya bahasa natural bertutur asli Indonesia.
* 🎯 **Step 4: Audit Yoast WordPress & Anti-AI Polish (`Claude 4.6 Opus`)**
  Penataan *bolding* penekanan, eliminasi frasa klise AI, kalibrasi kepadatan kata kunci, dan penyesuaian panjang kata yang presisi.
* ⚡ **Step 5: Live SSE Streaming & Real-Time Tiptap Editor**
  Output artikel dialirkan secara *real-time* (*Server-Sent Events*) ke Tiptap Rich-Text Editor lengkap dengan audit skor SEO 100 poin dan ekspor Markdown / HTML.

---

### 2. 📝 Kepatuhan Penuh SOP Agensi & Yoast WordPress
* **Aturan Struktur Paragraf & Kalimat (Salna Editorial SOP):**
  - 📌 **Minimal 2 Paragraf per Subheading:** Setiap bagian setelah heading H2/H3 wajib berisi minimal 2 paragraf padat (*Dilarang 1 paragraf tunggal*).
  - 📌 **Minimal 3 Kalimat per Paragraf:** Setiap paragraf wajib memuat minimal 3 kalimat terstruktur (*Gagasan Pokok ➔ Penjelasan Teknis ➔ Solusi/Takeaway*).
* **Preset Tipe Artikel Presisi:**
  - 📰 **Artikel Utama (Pillar):** 1.500 – 1.599 kata (komprehensif, multi-heading).
  - 🔗 **Backlink Artikel:** 500 – 599 kata (fokus keyphrase pendukung).
  - 🛍️ **Backlink Produk:** 500 – 599 kata (fokus keyphrase + *soft-selling* produk/brand).
* **Hierarki Heading Ketat:** Hanya menggunakan H2 (`##`) dan H3 (`###`) di dalam body. Bebas dari tag H1 ganda.
* **Kontrol Kepadatan Keyphrase:** Tersebar seimbang **5 hingga 7 kali** (~0.8% – 1.8%) di seluruh artikel (paragraf pembuka, 2-3 subheadings, dan kesimpulan) untuk mencegah *keyword stuffing*.
* **Injeksi Link Kontekstual & Brand:** Mendukung pengaturan Link 1 (kontekstual artikel di awal) dan Link 2 (homepage brand/produk di penutup).

---

### 3. 🌐 Yoast WordPress Snippet & 1-Click Copy Suite
* **Live Google Search SERP Mockup:** Pratinjau visual interaktif bagaimana artikel akan tampil di hasil pencarian Google.
* **Auto-Generated Slug / Permalink:** Otomatis menghasilkan permalink bersih yang hanya memuat focus keyphrase (misal: `/tips-memilih-mesin-penggiling-padi`) dengan tombol **`Copy`**.
* **Auto-Generated Meta Description:** Ringkasan 130–155 karakter dengan keyphrase di kalimat pertama + indikator counter panjang karakter + tombol **`Copy`**.
* **Auto-Generated SEO Title:** Judul SEO ramah klik (< 60 karakter) + tombol **`Copy`**.
* **Tombol `Copy WordPress`:** Satu klik untuk menyalin seluruh isi artikel (dengan format Heading H2/H3 dan link aktif) siap tempel ke Gutenberg / Classic Editor.

---

### 4. 🛡️ Humanize Writing & Anti-AI Detector Bypass (0% AI on ZeroGPT)
* **Sentence Burstiness Engineering:** Mengombinasikan kalimat sangat pendek (3–6 kata) dengan kalimat panjang deskriptif untuk mengacak ritme sintaksis.
* **Blacklist 100% Frasa Klise Robotik AI:** Menghapus pola kaku seperti *"Ini bukan sekadar X, ini soal Y..."*, *"Hal yang perlu dipahami sejak awal..."*, *"Merupakan langkah krusial..."*, dan *"Tidak dapat dipungkiri bahwa..."*.
* **Partikel Penutur Asli Indonesia:** Menyisipkan partikel penegas alami (*sih*, *kan*, *dong*, *nih*, *lho*, *kok*) dengan gaya bertutur praktisi lapangan yang luwes.
* **Eliminasi Tanda Em-Dash (`—`):** Menghapus tanda pisah khas AI yang sering memicu alarm detektor.

---

### 5. 🔍 Cek Orisinalitas & Plagiarisme (BETA)
* **Pendeteksi Plagiarisme Live Web Indexing:** Memecah teks menjadi N-Gram unik dan mencocokkan secara *live* ke indeks pencarian web untuk menampilkan persentase keunikan serta daftar URL sumber duplikasi asli jika ada.
* **Pendeteksi Konten AI (Multi-Signal):** Menganalisis *Perplexity Distribution*, *Sentence Burstiness Variance*, dan pola sintaksis untuk menghasilkan breakdown probabilitas AI kalimat per kalimat.

---

## 🏗️ Arsitektur & Teknologi

```mermaid
graph TD
    User([Operator / Browser]) -->|Next.js 14 App Router / Tiptap| Frontend[Frontend UI & Editor Suite]
    Frontend -->|REST API & SSE Stream| BackendAPI[FastAPI Backend Engine]
    
    BackendAPI -->|SERP & Intent Analysis| NineRouterGemini[9Router Proxy: Gemini 3.7 Flash]
    BackendAPI -->|Multi-Pass Writing & Polish| NineRouterClaude[9Router Proxy: Claude 4.6 Opus]
    BackendAPI -->|Live Web Plagiarism Indexing| SearchIndex[Web Search Index]
    
    BackendAPI -->|Persistent JSON Storage| DiskDB[(Local Data Storage: Articles, Jobs, Projects)]
    BackendAPI -->|Real-Time SSE Event Stream| Frontend
```

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router), TypeScript, React 18, Tailwind CSS |
| **Rich Text Editor** | Tiptap Rich Editor (Markdown & HTML Live Synchronization) |
| **Backend Engine** | Python 3.11 FastAPI, Pydantic v2, AsyncIO, SSE Streaming |
| **AI Gateway** | 9Router Proxy (OpenAI Compatible) via Async OpenAI SDK |
| **AI Model Routing** | `ag/gemini-3.7-flash-high` (SERP/Outline) & `ag/claude-opus-4-6-thinking` (Writer/SEO) |
| **Database & Persistence** | Persistent Local JSON Database (`backend/data/`) |
| **Deployment & Proxy** | Docker Compose Standalone (~50MB RAM), Caddy Server Reverse Proxy |

---

## 📂 Struktur Direktori

```
HariyukaAI/
├── .env.example                               # Template konfigurasi environment
├── docker-compose.yml                         # Konfigurasi container Docker production
├── backend/                                   # Engine API FastAPI
│   ├── Dockerfile                             # Container backend Python 3.11-slim
│   ├── app/
│   │   ├── main.py                            # Entrypoint FastAPI & Router Hub
│   │   ├── config.py                          # Pydantic Settings & Default Models
│   │   ├── api/v1/
│   │   │   ├── articles.py                    # REST CRUD, Metadata & Pipeline Trigger
│   │   │   ├── checker.py                     # API Cek Plagiarisme & AI Detektor
│   │   │   ├── stream.py                      # Server-Sent Events (SSE) Stream
│   │   │   ├── projects.py                    # Proyek & Brand Voice
│   │   │   └── settings.py                    # Gateway & Model Configuration
│   │   ├── db/
│   │   │   └── storage.py                     # Persistent Local JSON Database Handler
│   │   ├── pipeline/
│   │   │   └── orchestrator.py                # 5-Step Agentic Pipeline Orchestrator
│   │   └── services/
│   │       ├── ai_router.py                   # 9Router Client (Gemini 3.7 & Claude 4.6 Opus)
│   │       ├── authenticity_checker.py        # Plagiarism & AI Detection Engine
│   │       ├── serp_scraper.py                # SERP Competitor Scraper
│   │       └── seo_analyzer.py                # Yoast 12-Rules Scoring Engine
│   └── data/                                  # Database Disk (.json)
│
└── frontend/                                  # Next.js 14 App Router
    ├── Dockerfile                             # Multi-stage standalone Next.js runner
    └── src/
        ├── app/
        │   ├── (dashboard)/
        │   │   ├── dashboard/page.tsx         # Ringkasan analitik & metrik artikel
        │   │   ├── generator/                 # 3-Step Generator Flow
        │   │   ├── articles/                  # Manajemen Artikel & Tiptap Editor Suite
        │   │   │   └── [id]/page.tsx          # Editor Suite + Yoast Snippet + 1-Click Copy
        │   │   ├── checker/page.tsx           # Halaman Cek AI & Plagiat (BETA)
        │   │   ├── projects/page.tsx          # Manajemen Proyek
        │   │   └── settings/page.tsx          # Pengaturan 9Router Gateway
        │   └── login/page.tsx                 # Operator Authentication
        ├── components/
        │   ├── editor/                        # Tiptap Editor & Yoast SEO Sidebar
        │   └── layout/                        # Sidebar, Header & Live Terminal
        └── lib/
            ├── api-config.ts                  # Adaptive API URL Resolver
            └── terminal-bus.ts                # Real-Time Event Bus Terminal
```

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### 1. Kloning Repositori & Setup Environment
```bash
git clone https://github.com/keefalegends/HariyukaAI.git
cd HariyukaAI
cp .env.example .env
```

Sesuaikan konfigurasi gateway 9Router pada file `.env`:
```env
# 9Router Proxy AI Configuration
NINEROUTER_BASE_URL=http://your-9router-host:20128/v1
NINEROUTER_API_KEY=your_9router_api_key_here

# Model Routing Aliases
MODEL_SERP_EXTRACTOR=ag/gemini-3.7-flash-high
MODEL_OUTLINE_GENERATOR=ag/gemini-3.7-flash-high
MODEL_SECTION_WRITER=ag/claude-opus-4-6-thinking
MODEL_SEO_POLISHER=ag/claude-opus-4-6-thinking

# Operator Static Authentication
AUTH_USERS=keefa9:password123,salna9:password123
```

### 2. Menjalankan di Mode Development Lokal

#### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Buka browser di: **`http://localhost:3000`**

---

### 3. Menjalankan di Server VPS (Docker Production)
```bash
docker compose pull
docker compose up -d
```

---

## 👥 Tim & Kontributor

* **Keefa (`keefa9`)** — Developer & System Architect
* **Salna (`salna9`)** — Content Strategist, QA & Yoast SEO Specialist

---

## 📄 Lisensi
Didistribusikan di bawah lisensi **MIT**. Open-Source.
