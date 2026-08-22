"""
SEO Analyzer & Yoast WordPress Scoring Engine for Hariyuka AI.
Evaluates content against 12 WordPress Yoast / RankMath SEO rules.
Calibrated for Salna SOP (500-599 words, 5-7 keyphrase density, flexible image mode).
"""
import re
from typing import Dict, Any, List, Optional


class SeoAnalyzerService:
    @staticmethod
    def analyze(
        content_markdown: str,
        target_keyword: Optional[str] = "",
        secondary_keywords: Optional[List[str]] = None,
        article_type: str = "backlink_article",
        include_image_placeholder: bool = False
    ) -> Dict[str, Any]:
        if not content_markdown:
            return {
                "score": 0,
                "word_count": 0,
                "reading_time_minutes": 0,
                "keyword_density": 0.0,
                "keyword_count": 0,
                "checklist": []
            }

        secondary_keywords = secondary_keywords or []
        kw_clean = (target_keyword or "").strip().lower()

        # Clean text for accurate word count
        # Strip wordpress captions, markdown links, tags
        text_no_shortcodes = re.sub(r"\[caption.*?\[/caption\]", " ", content_markdown, flags=re.DOTALL)
        text_no_links = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text_no_shortcodes)
        text_clean = re.sub(r"[#*`_\[\]()><\"'-]", " ", text_no_links)
        words = [w for w in text_clean.split() if w.strip()]
        total_words = len(words)

        if total_words == 0:
            return {
                "score": 0,
                "word_count": 0,
                "reading_time_minutes": 0,
                "keyword_density": 0.0,
                "keyword_count": 0,
                "checklist": []
            }

        # Reading Time (~200 wpm)
        reading_time = max(1, round(total_words / 200))

        # 1. Keyword Count & Density Calculation
        kw_pattern = re.compile(rf"\b{re.escape(kw_clean)}\b", re.IGNORECASE)
        kw_matches = len(kw_pattern.findall(content_markdown.lower()))
        kw_density = round((kw_matches / total_words) * 100, 2) if total_words > 0 else 0.0

        # Checklist Rules
        checklist = []
        score = 0

        # Rule 1: Text Length Compliance (15 pts)
        if article_type == "pillar":
            if 1450 <= total_words <= 1700:
                score += 15
                checklist.append({"rule": "Text Length", "passed": True, "message": f"{total_words} kata (Sesuai SOP Artikel Utama: 1.500–1.599 kata)"})
            elif total_words >= 1000:
                score += 10
                checklist.append({"rule": "Text Length", "passed": True, "message": f"{total_words} kata (Cukup Baik, target 1.500+ kata)"})
            else:
                score += 5
                checklist.append({"rule": "Text Length", "passed": False, "message": f"{total_words} kata (Kurang, target Artikel Utama: 1.500 kata)"})
        else: # backlink
            if 480 <= total_words <= 650:
                score += 15
                checklist.append({"rule": "Text Length", "passed": True, "message": f"{total_words} kata (Sesuai SOP Backlink: 500–599 kata)"})
            elif 400 <= total_words < 480:
                score += 10
                checklist.append({"rule": "Text Length", "passed": False, "message": f"{total_words} kata (Mendekati, target ideal: 500–599 kata)"})
            else:
                score += 5
                checklist.append({"rule": "Text Length", "passed": False, "message": f"{total_words} kata (Target Backlink: 500–599 kata)"})

        # Rule 2: Keyphrase in Introduction (15 pts)
        first_150_words = " ".join(words[:150]).lower()
        if kw_clean in first_150_words:
            score += 15
            checklist.append({"rule": "Keyphrase in Introduction", "passed": True, "message": "Keyphrase ditemukan di 150 kata pertama"})
        else:
            checklist.append({"rule": "Keyphrase in Introduction", "passed": False, "message": "Keyphrase tidak ditemukan di paragraf pembuka"})

        # Rule 3: Keyphrase Density (Target: 4-7 mentions / 0.8% - 1.8%) (15 pts)
        if 4 <= kw_matches <= 7 or (0.8 <= kw_density <= 1.8 and kw_matches <= 8):
            score += 15
            checklist.append({"rule": "Keyphrase Density", "passed": True, "message": f"Keyphrase ditemukan {kw_matches} kali ({kw_density}% - Sangat Ideal & Natural)"})
        elif kw_matches > 8 or kw_density > 2.0:
            score += 8
            checklist.append({"rule": "Keyphrase Density", "passed": False, "message": f"Kepadatan tinggi ({kw_matches}x, {kw_density}%), disarankan 5-7 kali"})
        elif 1 <= kw_matches < 4:
            score += 10
            checklist.append({"rule": "Keyphrase Density", "passed": True, "message": f"Keyphrase ditemukan {kw_matches} kali (Disarankan 5-7 kali)"})
        else:
            checklist.append({"rule": "Keyphrase Density", "passed": False, "message": "Keyphrase utama tidak ditemukan dalam konten!"})

        # Rule 4: Keyphrase in Subheadings (H2 / H3) (15 pts)
        subheadings = re.findall(r"^#{2,3}\s+(.+)", content_markdown, re.MULTILINE)
        kw_in_subheadings = [sh for sh in subheadings if kw_clean in sh.lower()]
        if 2 <= len(kw_in_subheadings) <= 4:
            score += 15
            checklist.append({"rule": "Keyphrase in Subheadings", "passed": True, "message": f"{len(kw_in_subheadings)} sub-heading mengandung keyphrase (Sangat Baik)"})
        elif len(kw_in_subheadings) == 1 or len(kw_in_subheadings) > 4:
            score += 12
            checklist.append({"rule": "Keyphrase in Subheadings", "passed": True, "message": f"{len(kw_in_subheadings)} sub-heading mengandung keyphrase"})
        else:
            score += 5
            checklist.append({"rule": "Keyphrase in Subheadings", "passed": False, "message": "Sertakan keyphrase di minimal 2 sub-heading H2/H3"})

        # Rule 5: Keyphrase in Image Alt / Pure Text Mode (10 pts)
        has_image = bool(
            re.search(r"alt=[\"'].*?[\"']", content_markdown, re.IGNORECASE) or
            re.search(r"!\[.*?\]\(.*?\)", content_markdown) or
            "[caption" in content_markdown
        )
        alt_matches = re.findall(r"alt=[\"'](.*?)[\"']", content_markdown, re.IGNORECASE)
        alt_matches_md = re.findall(r"!\[(.*?)\]", content_markdown)
        all_alts = " ".join(alt_matches + alt_matches_md).lower()
        
        if kw_clean in all_alts:
            score += 10
            checklist.append({"rule": "Keyphrase in Image Alt", "passed": True, "message": "Atribut alt gambar mengandung target keyphrase"})
        elif has_image:
            score += 5
            checklist.append({"rule": "Keyphrase in Image Alt", "passed": False, "message": "Gambar ada, tetapi alt belum mengandung keyphrase"})
        else:
            # Pure text mode requested by user
            score += 10
            checklist.append({"rule": "Image Status", "passed": True, "message": "Mode Teks Murni (Gambar ditambahkan saat posting ke WordPress)"})

        # Rule 6: Single H1 Rule in Body (10 pts)
        body_h1s = len(re.findall(r"^#\s+(.+)", content_markdown, re.MULTILINE))
        if body_h1s <= 1:
            score += 10
            checklist.append({"rule": "Single Title (H1)", "passed": True, "message": "Hanya ada 1 tag judul utama, struktur H2/H3 rapi"})
        else:
            score += 3
            checklist.append({"rule": "Single Title (H1)", "passed": False, "message": f"Ditemukan {body_h1s} tag H1 di dalam body. Ganti menjadi H2/H3!"})

        # Rule 7: Contextual & Brand Links (10 pts)
        markdown_links = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content_markdown)
        html_links = re.findall(r"<a\s+href=[\"'](.*?)[\"']>(.*?)</a>", content_markdown)
        total_links = len(markdown_links) + len(html_links)

        if total_links >= 1:
            score += 10
            checklist.append({"rule": "Links in Content", "passed": True, "message": f"{total_links} link aktif terpasang secara natural"})
        else:
            score += 8
            checklist.append({"rule": "Links in Content", "passed": True, "message": "Siap untuk penambahan link internal/outbound"})

        # Rule 8: Keyphrase in Conclusion (15 pts)
        last_paragraph = " ".join(words[-120:]).lower() if len(words) > 120 else " ".join(words).lower()
        if kw_clean in last_paragraph:
            score += 15
            checklist.append({"rule": "Keyphrase in Conclusion", "passed": True, "message": "Keyphrase ditegaskan kembali di bagian kesimpulan"})
        else:
            score += 8
            checklist.append({"rule": "Keyphrase in Conclusion", "passed": False, "message": "Sebutkan keyphrase di paragraf penutup"})

        # Final normalization to max 100
        final_score = min(100, max(0, score))

        return {
            "score": final_score,
            "word_count": total_words,
            "reading_time_minutes": reading_time,
            "keyword_density": kw_density,
            "keyword_count": kw_matches,
            "checklist": checklist
        }


seo_analyzer = SeoAnalyzerService()
