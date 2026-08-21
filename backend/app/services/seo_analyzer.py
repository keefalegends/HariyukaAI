"""
SEO Analyzer & E-E-A-T Scoring Engine for Hariyuka AI.
Calculates keyword density, readability, heading hierarchy, and SEO health (0-100).
"""
import re
from typing import Dict, Any, List


class SeoAnalyzerService:
    @staticmethod
    def analyze(
        content_markdown: str,
        target_keyword: str,
        secondary_keywords: List[str] = None
    ) -> Dict[str, Any]:
        if not content_markdown:
            return {
                "score": 0,
                "word_count": 0,
                "reading_time_minutes": 0,
                "keyword_density": 0.0,
                "checklist": []
            }
        
        secondary_keywords = secondary_keywords or []
        text_clean = re.sub(r"[#*`_\[\]()>-]", " ", content_markdown)
        words = [w for w in text_clean.split() if w.strip()]
        total_words = len(words)
        
        if total_words == 0:
            return {"score": 0, "word_count": 0, "reading_time_minutes": 0, "keyword_density": 0.0, "checklist": []}

        # Calculate Reading Time (~200 wpm)
        reading_time = max(1, round(total_words / 200))

        # Keyword Density
        kw_pattern = re.compile(rf"\b{re.escape(target_keyword.lower())}\b", re.IGNORECASE)
        kw_matches = len(kw_pattern.findall(content_markdown.lower()))
        kw_density = round((kw_matches / total_words) * 100, 2)

        # Checkpoints for SEO Score
        score = 0
        checklist = []

        # 1. Word Count Check (25 pts)
        if total_words >= 1500:
            score += 25
            checklist.append({"rule": "Word Count", "passed": True, "message": f"{total_words} kata (Sangat Bagus untuk Ranking)"})
        elif total_words >= 800:
            score += 15
            checklist.append({"rule": "Word Count", "passed": True, "message": f"{total_words} kata (Cukup Baik)"})
        else:
            score += 5
            checklist.append({"rule": "Word Count", "passed": False, "message": f"{total_words} kata (Terlalu pendek, target minimal 800+ kata)"})

        # 2. Keyword in Content & Density (25 pts)
        if 0.8 <= kw_density <= 2.5:
            score += 25
            checklist.append({"rule": "Keyword Density", "passed": True, "message": f"Kepadatan keyword utama ideal ({kw_density}%)"})
        elif kw_density > 2.5:
            score += 10
            checklist.append({"rule": "Keyword Density", "passed": False, "message": f"Keyword stuffing terdeteksi ({kw_density}%), kurangi pengulangan"})
        elif kw_matches > 0:
            score += 15
            checklist.append({"rule": "Keyword Density", "passed": True, "message": f"Keyword ditemukan ({kw_matches}x, {kw_density}%)"})
        else:
            checklist.append({"rule": "Keyword Density", "passed": False, "message": "Keyword utama tidak ditemukan dalam artikel!"})

        # 3. Keyword in First 150 Words (15 pts)
        first_150_words = " ".join(words[:150]).lower()
        if target_keyword.lower() in first_150_words:
            score += 15
            checklist.append({"rule": "First Paragraph Keyword", "passed": True, "message": "Keyword utama ada di paragraf pembuka"})
        else:
            checklist.append({"rule": "First Paragraph Keyword", "passed": False, "message": "Sertakan keyword utama di 100-150 kata pertama"})

        # 4. Heading Structure H2 / H3 (20 pts)
        h2_count = len(re.findall(r"^##\s+.+", content_markdown, re.MULTILINE))
        h3_count = len(re.findall(r"^###\s+.+", content_markdown, re.MULTILINE))
        if h2_count >= 3:
            score += 20
            checklist.append({"rule": "Heading Structure", "passed": True, "message": f"Struktur sub-heading rapi ({h2_count} H2, {h3_count} H3)"})
        else:
            score += 5
            checklist.append({"rule": "Heading Structure", "passed": False, "message": f"Kurang sub-heading H2 ({h2_count} ditemukan, target min 3)"})

        # 5. Visual Placeholders & Formatting (15 pts)
        image_placeholders = len(re.findall(r"\[IMAGE:.*?\]", content_markdown))
        has_bold = bool(re.search(r"\*\*.*?\*\*", content_markdown))
        
        if image_placeholders >= 1 and has_bold:
            score += 15
            checklist.append({"rule": "Rich Media & Formatting", "passed": True, "message": f"Media visual & bold formatting optimal ({image_placeholders} image tags)"})
        elif has_bold:
            score += 10
            checklist.append({"rule": "Rich Media & Formatting", "passed": True, "message": "Format teks bold baik, tambahkan placeholder gambar"})
        else:
            score += 5
            checklist.append({"rule": "Rich Media & Formatting", "passed": False, "message": "Tambahkan poin tebal (bold) dan gambar"})

        # Cap score to 100
        score = min(100, max(0, score))

        # Secondary Keywords coverage
        sec_kw_status = []
        for sk in secondary_keywords:
            found = bool(re.search(rf"\b{re.escape(sk.lower())}\b", content_markdown.lower()))
            sec_kw_status.append({"keyword": sk, "found": found})

        return {
            "score": score,
            "word_count": total_words,
            "reading_time_minutes": reading_time,
            "keyword_density": kw_density,
            "keyword_occurrences": kw_matches,
            "h2_count": h2_count,
            "h3_count": h3_count,
            "image_placeholders": image_placeholders,
            "secondary_keywords": sec_kw_status,
            "checklist": checklist
        }


seo_analyzer = SeoAnalyzerService()
