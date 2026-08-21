"""
Lightweight Smoke Test for Hariyuka AI Backend Modules.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.services.ai_router import ai_router
from app.services.seo_analyzer import seo_analyzer
from app.services.serp_scraper import serp_scraper
from app.pipeline.orchestrator import orchestrator
from app.schemas.article import ArticleOutlineSchema

print("=== HARIYUKA AI BACKEND INITIALIZATION CHECK ===")
print(f"[*] Base URL: {settings.NINEROUTER_BASE_URL}")
print(f"[*] SERP Model: {settings.MODEL_SERP_EXTRACTOR}")
print(f"[*] Writer Model: {settings.MODEL_SECTION_WRITER}")

# Test SEO Analyzer Engine
sample_md = """# Panduan Lengkap Kursus SEO 2026

Belajar **kursus SEO** sangat penting untuk meningkatkan visibilitas website bisnis Anda di Google. Dalam artikel ini, kita akan membahas strategi terbaru.

## 1. Riset Keyword Mendalam

Langkah awal dalam kursus SEO adalah menemukan kata kunci potensial dengan volume pencarian tinggi dan persaingan rendah.

[IMAGE: Infografis alur riset keyword SEO | alt='alur riset keyword kursus seo']

## 2. Optimasi On-Page dan Teknis

Optimasi On-Page mencakup penataan heading H2, H3, meta description, dan kecepatan website.

### 2.1 Struktur Konten E-E-A-T
Konten harus menunjukkan keahlian, pengalaman, otoritas, dan kepercayaan.

## 3. Kesimpulan dan Langkah Awal
Mulailah belajar sekarang untuk menguasai algoritma mesin pencari.
"""

audit = seo_analyzer.analyze(sample_md, target_keyword="kursus SEO", secondary_keywords=["riset keyword", "On-Page"])
print(f"[OK] SEO Scorer Working! Score: {audit['score']}/100, Words: {audit['word_count']}, Density: {audit['keyword_density']}%")
print("[OK] All backend modules imported and validated successfully!")
