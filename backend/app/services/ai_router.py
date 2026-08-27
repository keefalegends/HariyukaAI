"""
AI Router Service for 9Router Proxy.
Integrates Gemini 3.7 (SERP/Outline) and Claude 4.6 (Writer/SEO Polish).
Equipped with Deep Humanizer Anti-AI Detector Engineering (Ultra-Low Perplexity & High Burstiness).
"""
import re
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger("hariyuka.ai_router")


class AIRouterService:
    def __init__(self):
        self._init_client()

    def _init_client(self):
        self.base_url = settings.NINEROUTER_BASE_URL.rstrip("/")
        self.api_key = settings.NINEROUTER_API_KEY
        self.model_serp = settings.MODEL_SERP_EXTRACTOR
        self.model_outline = settings.MODEL_OUTLINE_GENERATOR
        self.model_writer = settings.MODEL_SECTION_WRITER
        self.model_seo = settings.MODEL_SEO_POLISHER

        self.client = AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )
        logger.info(f"Initialized 9Router Client -> Base URL: {self.base_url}")

    async def complete(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        try:
            kwargs: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            if max_tokens:
                kwargs["max_tokens"] = max_tokens
            if response_format:
                kwargs["response_format"] = response_format

            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"[9Router Error] Failed completion for model {model}: {str(e)}")
            raise e

    async def stream_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        try:
            kwargs: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": True,
            }
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

            stream = await self.client.chat.completions.create(**kwargs)
            async for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        yield delta
        except Exception as e:
            logger.error(f"[9Router Stream Error] Model {model}: {str(e)}")
            raise e

    @staticmethod
    def extract_json(raw_text: str) -> Dict[str, Any]:
        text = raw_text.strip()
        
        # 1. Check for markdown code fences
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        else:
            # 2. Bracket locator fallback (find outer { ... } or [ ... ])
            start_idx = text.find("{")
            end_idx = text.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                text = text[start_idx:end_idx + 1].strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # 3. Trailing comma cleanup
            cleaned = re.sub(r",\s*([\]}])", r"\1", text)
            return json.loads(cleaned)

    # --------------------------------------------------------------------------
    # STEP 1: SERP Scraping & Intent Analysis (Gemini 3.7)
    # --------------------------------------------------------------------------
    async def analyze_serp_and_intent(
        self,
        target_keyword: str,
        competitor_content: Optional[str] = None,
        language: str = "id",
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an Elite SEO Strategist and Search Intent Classifier for Indonesian/Global SERPs. "
            "Analyze the target keyword and competitive landscape to extract search intent, "
            "crucial semantic entities (LSI), People Also Ask (PAA) questions, and content gaps."
        )

        user_prompt = f"""
Target Keyword: "{target_keyword}"
Language: {language}
Competitor Context/Scraped Data:
{competitor_content or "No external competitor crawl provided. Perform deep intrinsic SERP intent modeling."}

Return a valid JSON object matching this schema exactly:
{{
  "search_intent": "Informational" | "Commercial" | "Transactional" | "Navigational",
  "primary_audience": "description of audience",
  "core_angle": "unique high-value angle to beat top SERP results",
  "lsi_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "semantic_entities": ["entity1", "entity2", "entity3", "entity4"],
  "paa_questions": ["Question 1?", "Question 2?", "Question 3?"],
  "content_gaps": ["Gap competitor missed 1", "Gap competitor missed 2"],
  "suggested_title": "Optimized Click-Worthy SEO Title with exact keyphrase"
}}
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        raw = await self.complete(
            model=self.model_serp,
            messages=messages,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        return self.extract_json(raw)

    # --------------------------------------------------------------------------
    # STEP 2: Interactive Outline Generator (Gemini 3.7) - Salna SOP
    # --------------------------------------------------------------------------
    async def generate_outline(
        self,
        target_keyword: str,
        title: str,
        serp_analysis: Dict[str, Any],
        article_type: str = "backlink_article",
        tone: str = "authoritative",
        target_word_count: Optional[int] = None,
        brand_voice: Optional[str] = None,
        product_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        if article_type == "pillar":
            exact_target = target_word_count if (target_word_count and 1450 <= target_word_count <= 1650) else 1550
            section_breakdown = f"""
1. Section 1 (H2 Pembuka & Urgensi Topik): ~250 words - Pengenalan mendalam {target_keyword} & masalah nyata pembaca
2. Section 2 (H2 Metode Utama & Langkah Teknis {target_keyword}): ~450 words - Panduan inti bertahap yang presisi
3. Section 3 (H2 Best Practices & Trik Efisiensi {target_keyword}): ~400 words - Optimasi hasil & tips ahli lapangan
4. Section 4 (H2 Kesalahan Fatal yang Harus Dihindari Terkait {target_keyword}): ~300 words - Troubleshooting & solusi antisipasi
5. Section 5 (H2 Kesimpulan {target_keyword}): ~150 words - Rangkuman konseptual & aksi praktis pembaca
Total: ~1550 words
"""
        else:
            exact_target = 550
            section_breakdown = f"""
1. Section 1 (H2 Pembuka & Relevansi Topik): ~120 words - Mengapa {target_keyword} penting dan apa masalah yang ingin diselesaikan
2. Section 2 (H2 Panduan Inti / Solusi Utama {target_keyword}): ~280 words - 4-5 poin konkret, langkah teknis, atau tips praktis utama
3. Section 3 (H2 Trik Efisiensi & Hal yang Perlu Diperhatikan Terkait {target_keyword}): ~100 words - Optimasi hasil dan kesalahan yang sering terjadi
4. Section 4 (H2 Kesimpulan {target_keyword}): ~70 words - Rekomendasi ringkas & langkah tindak lanjut langsung
Total: ~550 words (strictly 500-599 words)
"""

        system_prompt = (
            "You are a Senior SEO Content Architect trained on WordPress Yoast & RankMath SOP standards.\n"
            "CRITICAL TOPICAL FOCUS & STRUCTURE RULES:\n"
            f"1. 🎯 LASER TOPICAL FOCUS: Every heading, sub-heading, and key point MUST strictly revolve around '{target_keyword}'. ZERO OFF-TOPIC DRIFT. Do NOT introduce unrelated buying/generic advice unless the keyword specifically asks for it.\n"
            "2. ONLY use H2 and H3 levels. NEVER output H1.\n"
            f"3. Total word count must strictly target {exact_target} words ({'1500-1599 words' if article_type == 'pillar' else '500-599 words'}).\n"
            f"4. Include '{target_keyword}' in at least 1 or 2 subheadings naturally to satisfy Yoast SEO.\n"
            f"5. End with an actionable conclusion: 'Kesimpulan {target_keyword}'."
        )

        user_prompt = f"""
Article Title: {title}
Target Keyword: {target_keyword}
Article Type: {article_type.upper()}
Target Total Words: {exact_target}
Tone: {tone}
Product Focus: {product_name or 'None (General SEO)'}
Brand Voice Instructions: {brand_voice or "Clear, engaging, human-written editorial"}

Section Word Allocation Target:
{section_breakdown}

SERP & Intent Context:
- Search Intent: {serp_analysis.get('search_intent')}
- LSI Keywords: {', '.join(serp_analysis.get('lsi_keywords', []))}

Output valid JSON matching this schema:
{{
  "title": "{title}",
  "estimated_total_words": {exact_target},
  "sections": [
    {{
      "id": "section-1",
      "heading": "...",
      "level": "h2",
      "target_word_count": 120,
      "key_points": ["Hook reader", "Introduce {target_keyword} in first 2 sentences"],
      "keywords_to_include": ["{target_keyword}"]
    }},
    {{
      "id": "section-2",
      "heading": "5 Alasan Pentingnya {target_keyword}",
      "level": "h2",
      "target_word_count": 280,
      "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
      "keywords_to_include": ["{target_keyword}"]
    }},
    {{
      "id": "section-3",
      "heading": "...",
      "level": "h2",
      "target_word_count": 100,
      "key_points": ["..."],
      "keywords_to_include": []
    }},
    {{
      "id": "section-4",
      "heading": "Kesimpulan {target_keyword}",
      "level": "h2",
      "target_word_count": 70,
      "key_points": ["Summary", "Actionable takeaway"],
      "keywords_to_include": ["{target_keyword}"]
    }}
  ]
}}
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        raw = await self.complete(
            model=self.model_outline,
            messages=messages,
            temperature=0.4,
            response_format={"type": "json_object"},
        )
        return self.extract_json(raw)

    # --------------------------------------------------------------------------
    # STEP 3: Multi-Pass Section Writer (Claude 4.6) - Deep Humanizer
    # --------------------------------------------------------------------------
    async def write_section(
        self,
        article_title: str,
        target_keyword: str,
        article_type: str,
        section_index: int,
        total_sections: int,
        section_heading: str,
        section_level: str,
        key_points: List[str],
        keywords_to_include: List[str],
        target_word_count: int,
        tone: str,
        brand_voice: Optional[str] = None,
        previous_sections_summary: Optional[str] = None,
        subsections_info: Optional[List[Dict[str, Any]]] = None,
        link_1_url: Optional[str] = None,
        link_1_anchor: Optional[str] = None,
        link_2_url: Optional[str] = None,
        link_2_anchor: Optional[str] = None,
        product_name: Optional[str] = None,
        product_promotion_context: Optional[str] = None,
        include_image_placeholder: bool = False,
        humanize_writing: bool = True,
    ) -> str:
        is_first_section = (section_index == 1)
        is_last_section = (section_index == total_sections)

        link_instructions = ""
        if link_1_url and (is_first_section or section_index == 2):
            anchor = link_1_anchor or target_keyword
            link_instructions += f"\n- CONTEXTUAL LINK: Naturally wrap `[{anchor}]({link_1_url})` into the body text."

        if link_2_url and is_last_section:
            anchor = link_2_anchor or (product_name or "Official Website")
            link_instructions += f"\n- BRAND/PRODUCT LINK: In this conclusion, naturally mention `[{anchor}]({link_2_url})`."

        product_instruction = ""
        if article_type == "backlink_product" and product_name:
            product_instruction = f"\n- PRODUCT SOFT-SELL: Naturally weave in **{product_name}** ({product_promotion_context or 'rekomendasi peralatan terpercaya'}) as an actionable solution."

        image_instruction = ""
        if include_image_placeholder and (section_index == 2 or (is_first_section and "pengenalan" not in section_heading.lower())):
            image_instruction = f"""
- WORDPRESS IMAGE EMBED: Right under `{section_level.upper()} {section_heading}`, include:
[caption id="attachment_8609" align="alignnone" width="885"]<img class="wp-image-8609" src="https://placehold.co/885x590/292524/d97757?text={target_keyword.replace(' ', '+')}" alt="{target_keyword}" width="885" height="590" /> {target_keyword}[/caption]
"""

        # Deep Humanizer Rules to bypass AI Detectors (<15% AI Score)
        if humanize_writing:
            humanizer_directives = """
🚨 ULTRA HUMANIZER & ANTI-AI DETECTOR DIRECTIVES (TARGET: 0-15% AI SCORE):
1. FORBIDDEN PUNCTUATION:
   - DO NOT USE EM-DASHES (`—` or `--`). Real Indonesian writers use commas, parentheses, or start fresh sentences.
2. BANNED AI RHETORICAL ARCHETYPES (DO NOT USE):
   - "Ini bukan sekadar X, ini soal Y..." / "Ini bukan soal gengsi..."
   - "A, bahkan B saat C..."
   - "Hal yang perlu dipahami sejak awal adalah..."
   - "Merupakan langkah yang sangat krusial / penting..."
   - "Berikut adalah beberapa tips/langkah praktis..."
   - "Tidak dapat dipungkiri bahwa..."
   - "Memberikan fleksibilitas memasak yang nyata..."
   - "Pilihan yang tepat dimulai dari pengetahuan yang benar." (Hapus kalimat moral kesimpulan di akhir paragraf!)
3. NATIVE INDONESIAN WRITING PARTICLES & EXPERIENTIAL FLOW:
   - Write like a real Indonesian blogger / technical reviewer who uses natural conversational particles: 'sih', 'kan', 'dong', 'nih', 'lho', 'kok'.
   - Use vivid expressions: 'Gimana caranya?', 'Jangan sampai salah pilih,', 'Bakal kerasa banget di...', 'Repot kalau...', 'Untungnya sekarang...', 'Coba cek dulu...'.
4. EXTREME SENTENCE BURSTINESS:
   - Mix ultra-short 3-5 word sentences ("Jangan buru-buru beli.", "Kuncinya ada di sini.", "Simpel tapi krusial.") with natural compound sentences.
   - Break monotonous Subject-Verb-Object patterns.
"""
        else:
            humanizer_directives = ""

        system_prompt = f"""You are an Authentic Indonesian SEO Writer crafting high-ranking, human-written editorial content using Claude 4.6 Opus.
{humanizer_directives}
🎯 CRITICAL LASER TOPICAL FOCUS & ANTI-DRIFT GUARDRAIL (STRICT):
1. ZERO TOPICAL DRIFT: Every single sentence in this section MUST strictly explain, solve, or elaborate on '{target_keyword}'.
2. NEVER wander into unrelated philosophical musings, generic kitchen/life analogies, or tangential subtopics that do not directly answer '{target_keyword}'. The reader searched specifically for '{target_keyword}' — give them dense, direct, practical, and highly useful insights immediately!
3. DENSE ACTIONABLE WRITING: Avoid generic filler or repetitive restatements. Deliver real-world techniques, tangible steps, cause-and-effect reasoning, and practical criteria.

🚨 STRICT PARAGRAPH & SENTENCE STRUCTURE SOP (SALNA EDITORIAL RULES):
1. MINIMUM 2 PARAGRAPHS PER SUBHEADING: Under EVERY H2 and H3 heading, you MUST write at least 2 distinct paragraphs separated by a double newline (`\\n\\n`). Single-paragraph sections are STRICTLY FORBIDDEN.
2. MINIMUM 3 SENTENCES PER PARAGRAPH: Every single paragraph MUST contain at least 3 well-crafted, substantive sentences (each ending with a period, question mark, or exclamation mark). Never write a paragraph with only 1 or 2 sentences.
3. PARAGRAPH FLOW FORMULA:
   - Paragraph 1: Specific core challenge, technical context, and why this matters for '{target_keyword}'.
   - Paragraph 2+: Concrete actionable steps, practical field application, and direct tangible benefit for the reader.
4. HEADINGS: ONLY use H2 (##) or H3 (###). NEVER output H1 (#).
5. WORD COUNT: Target ~{target_word_count} words for this section.
6. KEYPHRASE DENSITY: Mention the exact focus keyphrase '{target_keyword}' AT MOST 1 or 2 times in this section. Use natural pronouns ('alat ini', 'langkah tersebut') elsewhere.
7. If this is Section 1, mention keyphrase in the very first sentence.
"""

        user_prompt = f"""
Article Title: {article_title}
Target Primary Keyword: "{target_keyword}"
Article Type: {article_type.upper()}
Section Index: {section_index} of {total_sections}
Currently Writing Section:
- Heading: {section_heading} ({section_level.upper()})
- Target Word Count: EXACTLY ~{target_word_count} words (Consisting of MINIMUM 2 paragraphs, each with MINIMUM 3 sentences)
- Key Points to Cover:
{chr(10).join(f"  * {pt}" for pt in key_points)}

Special Section Requirements:{link_instructions}{product_instruction}{image_instruction}

Context from Previous Sections:
{previous_sections_summary or "Opening section."}

Output the section in Markdown starting with `{section_level.upper()} {section_heading}`:
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        raw_output = await self.complete(
            model=self.model_writer,
            messages=messages,
            temperature=0.42 if humanize_writing else 0.35,
        )

        # Post-clean any remaining em-dashes
        if humanize_writing:
            raw_output = raw_output.replace(" — ", ", ").replace("—", ", ")

        return raw_output

    # --------------------------------------------------------------------------
    # STEP 4: Final SEO Polish & Anti-AI Sanitizer (Claude 4.6 Opus)
    # --------------------------------------------------------------------------
    async def polish_and_optimize_seo(
        self,
        full_article_markdown: str,
        target_keyword: str,
        article_type: str = "backlink_article",
        secondary_keywords: Optional[List[str]] = None,
        tone: str = "authoritative",
        include_image_placeholder: bool = False,
        humanize_writing: bool = True,
    ) -> str:
        target_min = 1500 if article_type == "pillar" else 510
        target_max = 1590 if article_type == "pillar" else 585
        target_range = f"{target_min} – {target_max} kata"

        image_rule = "Ensure no [caption] or img tags exist; output clean pure text markdown." if not include_image_placeholder else "Preserve [caption] block intact."

        if humanize_writing:
            humanizer_polish = """
7. ANTI-AI DETECTOR SANITIZATION PASS:
   - Eliminate ALL em-dashes (`—` and `--`). Replace with commas or clean periods.
   - Break any remaining formulaic AI transitions ('Ini bukan sekadar...', 'Hal yang perlu dipahami...', 'Berikut lima tips...', 'Merupakan langkah krusial...').
   - Infuse native Indonesian conversational ease ('kan', 'sih', 'lho', 'nih', 'Gimana solusinya?') so AI detector gives < 15% score.
   - Ensure the prose reads 100% natural and passes both Yoast SEO and PlagiarismDetector.
"""
        else:
            humanizer_polish = ""

        system_prompt = f"""You are a Master Indonesian Editor and Anti-AI SEO Specialist using Claude 4.6 Opus.
CALIBRATION REQUIREMENTS (SALNA EDITORIAL & YOAST SOP):
1. 🎯 LASER TOPICAL PRUNING (ELIMINATE OFF-TOPIC RAMBLING):
   - Scan the entire article for any sentences that drift away from '{target_keyword}'.
   - If any paragraph drifts into unrelated philosophy, generic filler, or tangential topics, CUT IT OUT or REWRITE it so it strictly delivers dense, actionable, high-value insights about '{target_keyword}'.
   - Every single section must directly answer and explain '{target_keyword}'.
2. SUBHEADING PARAGRAPH DEPTH: Every single H2 (##) and H3 (###) MUST have AT LEAST 2 distinct paragraphs under it. If any section has only 1 paragraph, split and elaborate it into 2 substantive paragraphs.
3. PARAGRAPH SENTENCE DEPTH: Every single paragraph MUST contain AT LEAST 3 complete sentences. Never leave thin 1-sentence or 2-sentence paragraphs.
4. STRICT WORD COUNT: Final text length MUST be between {target_range}.
   If under 500 words, expand paragraphs with helpful details and actionable real-world tips directly related to '{target_keyword}'.
5. STRICT KEYPHRASE FREQUENCY (5 TO 7 TIMES ONLY):
   Count occurrences of '{target_keyword}'. It MUST appear between 5 and 7 times total across the entire article!
   If it appears > 7 times, replace repetitive instances with natural pronouns ('alat ini', 'langkah ini', 'perangkat tersebut').
6. SINGLE H1 RULE: Body MUST only contain ## H2 and ### H3.
7. IMAGE RULE: {image_rule}
8. Preserve all markdown links `[anchor](url)`.
{humanizer_polish}
Output only the final polished article in Markdown.
"""

        user_prompt = f"""
Target Keyphrase: "{target_keyword}"
Target Word Count: {target_range}

Full Draft to Polish:
{full_article_markdown}

Return the final polished markdown:
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        polished = await self.complete(
            model=self.model_seo,
            messages=messages,
            temperature=0.30 if humanize_writing else 0.20,
        )

        # Final pass: Strip any lingering em-dashes
        if humanize_writing:
            polished = polished.replace(" — ", ", ").replace("—", ", ")

        return polished

    # --------------------------------------------------------------------------
    # STEP 5: Yoast SEO Snippet & Metadata Generator (Slug, Meta Desc, Tags)
    # --------------------------------------------------------------------------
    async def generate_seo_metadata(
        self,
        title: str,
        target_keyword: str,
        content_markdown: str
    ) -> Dict[str, str]:
        """
        Generates Yoast WordPress SEO Snippet Metadata:
        - Slug: strictly clean permalink containing the primary keyphrase
        - Meta Description: 130-155 characters, includes primary keyphrase at the start, engaging call to action
        - SEO Title: High CTR Title under 60 characters
        - Tags: 8-10 high-relevance WordPress tags / keyphrase synonyms separated strictly by commas (no numbering)
        """
        clean_slug = re.sub(r"[^a-zA-Z0-9\s-]", "", target_keyword).strip().lower()
        default_slug = re.sub(r"[\s-]+", "-", clean_slug)
        
        # Smart fallback for tags (concise 1-3 word phrases)
        kw_words = [w for w in re.sub(r"[^a-zA-Z0-9\s]", "", target_keyword).split() if len(w) > 2]
        core_kw = " ".join(kw_words[:2]) if kw_words else "seo"
        default_tags = f"{core_kw}, tips {core_kw}, rekomendasi {core_kw}, panduan {core_kw}, cara memilih {core_kw}"

        system_prompt = """You are a Yoast SEO WordPress Metadata Specialist.
Generate clean, concise, click-worthy metadata in JSON format:
{
  "seo_title": "Max 60 chars, includes focus keyphrase naturally",
  "slug": "url-friendly-slug-containing-only-keyphrase",
  "meta_description": "130-155 characters, MUST contain primary keyphrase near the beginning, high CTR appeal without em-dashes",
  "tags": "8 to 10 SHORT keyword tags (each tag MUST be only 1 to 3 words max, Indonesian), strictly separated by commas. NEVER include long sentences or repeat the full article title! (e.g. 'steamer rice cooker, inner pot keramik, wadah kukusan, hemat listrik, tips memilih, rice cooker awet, panci anti lengket, peralatan dapur')"
}"""
        user_prompt = f"""
Focus Keyphrase: "{target_keyword}"
Article Title: "{title}"
Content Sample:
{content_markdown[:600]}

Generate the JSON metadata:
"""
        try:
            raw = await self.complete(
                model=self.model_outline,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            data = self.extract_json(raw)
            raw_tags = data.get("tags")
            if isinstance(raw_tags, list):
                clean_list = [re.sub(r"^\d+[\.\-\)]\s*", "", str(t)).strip().strip('"\'') for t in raw_tags if t]
                tags_str = ", ".join(clean_list)
            elif isinstance(raw_tags, str):
                parts = [re.sub(r"^\d+[\.\-\)]\s*", "", p).strip().strip('"\'') for p in raw_tags.split(",") if p.strip()]
                tags_str = ", ".join(parts)
            else:
                tags_str = default_tags

            return {
                "seo_title": data.get("seo_title", title)[:65],
                "slug": data.get("slug", default_slug),
                "meta_description": data.get("meta_description", f"Panduan lengkap {target_keyword}. Temukan tips penting, cara memilih, dan rekomendasi terbaik di sini.")[:160],
                "tags": tags_str
            }
        except Exception:
            return {
                "seo_title": title[:65],
                "slug": default_slug,
                "meta_description": f"Panduan lengkap {target_keyword}. Temukan tips penting, cara memilih, dan rekomendasi terbaik di sini.",
                "tags": default_tags
            }


ai_router = AIRouterService()
