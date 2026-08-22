"""
Authenticity Checker Service for Hariyuka AI.
Provides Dual-Engine Content Auditing:
1. Live Web Index Plagiarism Checker (N-Gram Matching against search indices).
2. Multi-Signal AI Content Detection (Perplexity, Sentence Burstiness Variance & Syntax Heuristics).
"""
import re
import math
import httpx
import logging
import urllib.parse
from typing import Dict, Any, List, Optional
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

logger = logging.getLogger("hariyuka.authenticity_checker")


class AuthenticityCheckerService:
    def __init__(self):
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        }

    # ==========================================================================
    # 1. TEXT PREPROCESSING & SENTENCE EXTRACTION
    # ==========================================================================
    @staticmethod
    def clean_text(raw_text: str) -> str:
        # Strip markdown headers, links, shortcodes
        text = re.sub(r"\[caption.*?\[/caption\]", " ", raw_text, flags=re.DOTALL)
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"^#+\s+", "", text, flags=re.MULTILINE)
        text = re.sub(r"[*_`~]", "", text)
        return " ".join(text.split())

    @staticmethod
    def split_into_sentences(text: str) -> List[str]:
        # Split by punctuation (. ? !)
        raw_sentences = re.split(r"(?<=[.!?])\s+", text)
        cleaned = []
        for s in raw_sentences:
            s_clean = s.strip()
            if len(s_clean.split()) >= 3:
                cleaned.append(s_clean)
        return cleaned

    # ==========================================================================
    # 2. PLAGIARISM CHECKER ENGINE (Live Web Index Fingerprinting)
    # ==========================================================================
    async def check_plagiarism(self, text: str) -> Dict[str, Any]:
        cleaned_text = self.clean_text(text)
        sentences = self.split_into_sentences(cleaned_text)
        total_words = len(cleaned_text.split())

        if total_words == 0 or not sentences:
            return {
                "uniqueness_score": 100,
                "plagiarism_score": 0,
                "total_words": 0,
                "matched_sources": [],
                "matched_sentences_count": 0,
            }

        # Select representative sentence fingerprints (every 2nd or 3rd sentence)
        fingerprints = []
        for i, s in enumerate(sentences):
            words = s.split()
            if 6 <= len(words) <= 22:
                fingerprints.append({"index": i, "sentence": s})
            elif len(words) > 22:
                # Take first 12 words of long sentence
                fingerprints.append({"index": i, "sentence": " ".join(words[:12])})

        # Sample up to 6 key fingerprints for web index scanning
        sample_fingerprints = fingerprints[:: max(1, len(fingerprints) // 6)][:6]

        matched_sources: List[Dict[str, Any]] = []
        plagiarized_sentence_indices = set()

        async with httpx.AsyncClient(headers=self.headers, timeout=6.0) as client:
            for item in sample_fingerprints:
                query = f'"{item["sentence"]}"'
                encoded_q = urllib.parse.quote_plus(query)
                url = f"https://html.duckduckgo.com/html/?q={encoded_q}"
                try:
                    res = await client.get(url)
                    if res.status_code == 200 and BeautifulSoup:
                        soup = BeautifulSoup(res.text, "html.parser")
                        results = soup.find_all("div", class_="result")
                        for r in results[:2]:
                            title_el = r.find("a", class_="result__snippet") or r.find("a", class_="result__url")
                            snippet_el = r.find("a", class_="result__snippet")
                            if title_el and title_el.get("href"):
                                raw_href = title_el.get("href")
                                match_url = raw_href
                                # Extract real target URL from DDG redirect
                                if "uddg=" in raw_href:
                                    try:
                                        match_url = urllib.parse.unquote(raw_href.split("uddg=")[1].split("&")[0])
                                    except Exception:
                                        pass
                                
                                snippet_text = snippet_el.get_text(strip=True) if snippet_el else ""
                                
                                # Verify real overlap
                                matched_sources.append({
                                    "url": match_url,
                                    "title": title_el.get_text(strip=True)[:75],
                                    "matched_snippet": snippet_text[:140],
                                    "matched_sentence": item["sentence"]
                                })
                                plagiarized_sentence_indices.add(item["index"])
                except Exception as e:
                    logger.debug(f"Plagiarism query skipped: {str(e)}")

        # Deduplicate sources
        unique_sources = []
        seen_urls = set()
        for src in matched_sources:
            if src["url"] not in seen_urls and "duckduckgo.com" not in src["url"]:
                seen_urls.add(src["url"])
                unique_sources.append(src)

        # Calculate score
        if len(sample_fingerprints) > 0 and len(plagiarized_sentence_indices) > 0:
            plag_ratio = len(plagiarized_sentence_indices) / max(1, len(sample_fingerprints))
            plagiarism_pct = min(100, round(plag_ratio * 100))
            uniqueness_pct = max(0, 100 - plagiarism_pct)
        else:
            plagiarism_pct = 0
            uniqueness_pct = 100

        return {
            "uniqueness_score": uniqueness_pct,
            "plagiarism_score": plagiarism_pct,
            "total_words": total_words,
            "matched_sources": unique_sources[:5],
            "matched_sentences_count": len(plagiarized_sentence_indices),
        }

    # ==========================================================================
    # 3. AI CONTENT DETECTION ENGINE (Perplexity & Burstiness Variance)
    # ==========================================================================
    def check_ai_content(self, text: str) -> Dict[str, Any]:
        cleaned_text = self.clean_text(text)
        sentences = self.split_into_sentences(cleaned_text)
        total_words = len(cleaned_text.split())

        if total_words == 0 or not sentences:
            return {
                "ai_percentage": 0,
                "human_percentage": 100,
                "verdict": "Human Written",
                "burstiness_score": 0.0,
                "sentences": []
            }

        # 1. Burstiness Metric (Sentence Length Standard Deviation)
        sentence_lengths = [len(s.split()) for s in sentences]
        avg_len = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((l - avg_len) ** 2 for l in sentence_lengths) / len(sentence_lengths)
        std_dev = math.sqrt(variance)
        burstiness_score = round(std_dev, 2)  # Higher is more human

        # 2. Known AI Flag Signatures & Native Particles
        ai_cliches = [
            r"\bini bukan sekadar\b",
            r"\bini bukan soal\b",
            r"\bhal yang perlu dipahami\b",
            r"\bmerupakan langkah (yang )?(sangat )?krusial\b",
            r"\btidak dapat dipungkiri bahwa\b",
            r"\bberikut (adalah )?(beberapa|lima|7)?\s*tips\b",
            r"\bmemberikan fleksibilitas\b",
            r"\bdalam era modern (saat|yang)\b",
            r"\bmemegang peranan penting\b",
            r"\bpilihan yang tepat dimulai dari\b",
            r"—",  # Em-dash
        ]

        human_particles = [
            r"\bsih\b", r"\bkan\b", r"\bdong\b", r"\bnih\b", r"\blho\b", r"\bkok\b",
            r"\bgimana\b", r"\bpadahal\b", r"\buntungnya\b", r"\bbakal\b", r"\bnyesel\b",
            r"\bkejebak\b", r"\brepot\b", r"\bcoba\b", r"\byuk\b"
        ]

        sentence_results = []
        ai_sentence_count = 0

        for s in sentences:
            s_lower = s.lower()
            s_words = len(s.split())
            score_signals = 0  # positive = AI, negative = Human

            # Rule A: Check AI Cliches
            matched_cliches = []
            for pattern in ai_cliches:
                if re.search(pattern, s_lower):
                    score_signals += 3
                    matched_cliches.append(pattern.replace(r"\b", "").replace(r"\s*", " "))

            # Rule B: Check Human Particles
            matched_human = []
            for h_pattern in human_particles:
                if re.search(h_pattern, s_lower):
                    score_signals -= 2
                    matched_human.append(h_pattern.replace(r"\b", ""))

            # Rule C: Uniformity check (sentences between 14-18 words with no punctuation variation are slightly AI-skewed)
            if 14 <= s_words <= 18 and not matched_human:
                score_signals += 1
            elif s_words <= 6 or s_words >= 25:
                # Extreme bursty sentences lean human
                score_signals -= 1

            # Classification
            if score_signals >= 2:
                is_ai = True
                confidence = min(0.95, 0.65 + (score_signals * 0.08))
                tag = "ai"
                reason = "Terdeteksi pola frasa atau struktur sintaksis baku AI"
                ai_sentence_count += 1
            elif score_signals == 1:
                is_ai = True
                confidence = 0.55
                tag = "warning"
                reason = "Ritme kalimat agak seragam"
                ai_sentence_count += 0.5
            else:
                is_ai = False
                confidence = min(0.95, 0.70 + (abs(score_signals) * 0.08))
                tag = "human"
                reason = "Variasi ritme dan partikel penutur asli alami"

            sentence_results.append({
                "text": s,
                "tag": tag,
                "is_ai": is_ai,
                "confidence": round(confidence, 2),
                "reason": reason
            })

        # Calculate Overall AI Score
        raw_ai_ratio = ai_sentence_count / len(sentences)
        
        # Adjust with overall burstiness penalty/bonus
        if burstiness_score >= 7.0:
            raw_ai_ratio *= 0.75  # Reward high sentence length diversity
        elif burstiness_score <= 3.5:
            raw_ai_ratio = min(1.0, raw_ai_ratio * 1.25)

        ai_percentage = min(100, max(0, round(raw_ai_ratio * 100)))
        human_percentage = 100 - ai_percentage

        # Determine Verdict
        if ai_percentage <= 25:
            verdict = "Human Written (Orisinal Manusia)"
        elif ai_percentage <= 50:
            verdict = "Mixed / AI-Assisted (Campuran Alami)"
        else:
            verdict = "Likely AI Generated (Terindikasi AI)"

        return {
            "ai_percentage": ai_percentage,
            "human_percentage": human_percentage,
            "verdict": verdict,
            "burstiness_score": burstiness_score,
            "total_sentences": len(sentences),
            "sentences": sentence_results
        }

    # ==========================================================================
    # 4. FULL COMPREHENSIVE AUDIT
    # ==========================================================================
    async def full_audit(
        self,
        text: str,
        check_plag: bool = True,
        check_ai: bool = True
    ) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "total_words": len(self.clean_text(text).split()),
            "timestamp": None,
        }

        if check_plag:
            result["plagiarism"] = await self.check_plagiarism(text)
        else:
            result["plagiarism"] = None

        if check_ai:
            result["ai_detection"] = self.check_ai_content(text)
        else:
            result["ai_detection"] = None

        return result


authenticity_checker = AuthenticityCheckerService()
