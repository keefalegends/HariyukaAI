# ⚡ Hariyuka AI — Platform Penulis Artikel SEO Berbasis Multi-Agent AI

[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Claude 4.6](https://img.shields.io/badge/Writer-Claude_4.6_Opus_Thinking-d97757?style=flat-square)](https://anthropic.com)
[![Gemini 3.7](https://img.shields.io/badge/SERP_/_Outline-Gemini_3.7_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google)
[![ZeroGPT](https://img.shields.io/badge/AI_Detector-0%25_AI_(Human)-emerald?style=flat-square)](https://zerogpt.com)
[![Yoast SEO](https://img.shields.io/badge/Yoast_WordPress-100%2F100_Score-green?style=flat-square)](https://yoast.com)

> **Hariyuka AI** adalah platform *self-hosted* untuk menghasilkan artikel SEO berkualitas jurnalis yang lolos detektor AI (*0% AI pada ZeroGPT*), patuh pada SOP Yoast WordPress, dan dilengkapi asisten **AI Copilot (Claude Split-View)** untuk merevisi artikel secara interaktif lewat prompt.

---

##  Fitur Utama

### 1.  5-Step Multi-Agent Pipeline
* **Analisis SERP & Search Intent (`Gemini 3.7 Flash`):** Analisis kompetitor peringkat 1–3 Google, entitas LSI, dan *People Also Ask*.
* **Interactive Outline Review (`Gemini 3.7 Flash`):** Struktur H2/H3 berbobot kata yang bisa diedit dan diatur ulang sebelum artikel ditulis.
* **Section Writer Presisi (`Claude 4.6 Opus Thinking`):** Penulisan multi-pass dengan *prompt chaining* agar bebas repetisi, fokus laser pada keyword, dan bertutur alami.
* **Audit Yoast & Anti-AI Polish (`Claude 4.6 Opus Thinking`):** Optimasi heading H2/H3, kepadatan focus keyphrase, dan eliminasi frasa klise AI.
* **Live SSE Streaming & Tiptap Editor:** Streaming real-time langsung ke editor visual dengan skor Yoast SEO 100 poin.

### 2.  AI Copilot Hub & Claude Split-View Editor
* **Revisi via Prompt:** Berikan instruksi natural (e.g. *"tambahkan tips praktis di H2 terakhir"*, *"ubah gaya bahasa jadi lebih santai"*), AI akan merevisi draf artikel secara langsung.
* **Claude Artifacts Split-View:** Tampilan 2-kolom lega (Kiri: Chat Copilot, Kanan: Dokumen Live Tiptap) dengan fitur *Terapkan* dan *Undo*.
* **Chat Persistence:** Riwayat percakapan revisi tersimpan permanen di database per artikel dan otomatis dimuat ulang saat dibuka kembali.
* **AI Copilot Hub (`/copilot`):** Halaman terpusat untuk memilih artikel dan langsung melanjutkan sesi revisi.

### 3.  Kepatuhan SOP Redaksi & WordPress Ready
* **Aturan Struktur Paragraf:** Minimal 2 paragraf per sub-heading, dan minimal 3 kalimat per paragraf (tidak ada paragraf menggantung).
* **Preset Tipe Artikel:**
  * *Artikel Utama (Pillar):* 1.500 – 1.599 kata.
  * *Backlink Artikel:* 500 – 599 kata.
  * *Backlink Produk:* 500 – 599 kata (+ soft-selling produk/brand).
* **Zero Em-Dash & Anti-Hallucination:** Bebas dari tanda pisah AI (`—`), bebas frasa kaku, dan bebas halusinasi data.
* **1-Click Copy WordPress:** Tombol salin siap tempel langsung ke Gutenberg/Classic WordPress Editor.
* **Auto Slug & Meta Description:** Permalink ringkas dan meta description siap pakai dengan tombol salin mandiri.

### 4.  Audit Orisinalitas & Detektor AI
* **Pindai Plagiarisme Live:** Pengecekan kalimat secara real-time ke web index untuk mengukur persentase keunikan konten.
* **Detektor Konten AI Multi-Signal:** Analisis ritme kalimat (*burstiness* dan variasi) dengan highlight kalimat terindikasi AI.

---

##  Tech Stack

* **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Tiptap Editor.
* **Backend:** FastAPI (Python 3.11), Pydantic v2, AsyncIO, SSE (Server-Sent Events).
* **AI Gateway:** 9Router Proxy (OpenAI-compatible) menghubungkan `ag/claude-opus-4-6-thinking` dan `ag/gemini-3.7-flash-high`.
* **Database:** Local Persistent JSON Storage (`backend/data/`).
* **Deployment:** Docker Compose, Caddy / Nginx reverse proxy.

---

##  Panduan Instalasi Cepat

### 1. Clone & Konfigurasi Lingkungan
```bash
git clone https://github.com/keefalegends/HariyukaAI.git
cd HariyukaAI
cp .env.example .env
```

Isi variabel utama di file `.env`:
```env
NINEROUTER_BASE_URL=http://your-9router-host:20128/v1
NINEROUTER_API_KEY=your_api_key_here

MODEL_SERP_EXTRACTOR=ag/gemini-3.7-flash-high
MODEL_OUTLINE_GENERATOR=ag/gemini-3.7-flash-high
MODEL_SECTION_WRITER=ag/claude-opus-4-6-thinking
MODEL_SEO_POLISHER=ag/claude-opus-4-6-thinking

AUTH_USERS=keefa9:password123,salna9:password123
```

### 2. Jalankan Mode Lokal (Development)

**Backend (Terminal 1):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows (atau: source venv/bin/activate di Linux/macOS)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```
Akses aplikasi di browser: `http://localhost:3000`

### 3. Jalankan di Server VPS (Docker)
```bash
docker compose pull
docker compose up -d
```

---

## 📄 Lisensi & Tim
Dikelola secara privat oleh **Keefa** & **Salna** untuk operasional konten Hariyuka AI.
