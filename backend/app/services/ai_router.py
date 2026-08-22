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
1. Section 1 (H2 Intro): ~250 words
2. Section 2 (H2 Core Method): ~450 words
3. Section 3 (H2 Best Practices): ~400 words
4. Section 4 (H2 Troubleshooting/Tips): ~300 words
5. Section 5 (H2 Kesimpulan {target_keyword}): ~150 words
Total: ~1550 words
"""
        else:
            exact_target = 550
            section_breakdown = f"""
1. Section 1 (H2 Pembuka & Konteks Lapangan): ~120 words
2. Section 2 (H2 5 Alasan / Tips Praktis {target_keyword}): ~280 words
3. Section 3 (H2 Pertimbangan Penting Sebelum Beli): ~100 words
4. Section 4 (H2 Kesimpulan {target_keyword}): ~70 words
Total: ~550 words (strictly 500-599 words)
"""

        system_prompt = (
            "You are a Senior SEO Content Architect trained on WordPress Yoast & RankMath SOP standards.\n"
            "CRITICAL RULES:\n"
            "1. ONLY use H2 and H3 levels. NEVER output H1.\n"
            f"2. Total word count must strictly target {exact_target} words ({'1500-1599 words' if article_type == 'pillar' else '500-599 words'}).\n"
            "3. Include the keyphrase in at most 2 or 3 subheadings (NOT in all subheadings to prevent keyword stuffing).\n"
            f"4. End with a conclusion section: 'Kesimpulan {target_keyword}'."
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

        system_prompt = f"""You are an Authentic Indonesian SEO Writer crafting high-ranking, human-written editorial content.
{humanizer_directives}
RULES:
1. ONLY use H2 (##) or H3 (###). NEVER output H1 (#).
2. Word count target for this section: EXACTLY ~{target_word_count} words. Write substantive, engaging paragraphs.
3. KEYPHRASE DENSITY: Mention the exact focus keyphrase AT MOST 1 or 2 times in this section. Use natural pronouns ('alat ini', 'langkah tersebut') elsewhere.
4. If this is Section 1, mention keyphrase in the very first sentence.
"""

        user_prompt = f"""
Article Title: {article_title}
Target Primary Keyword: "{target_keyword}"
Article Type: {article_type.upper()}
Section Index: {section_index} of {total_sections}
Currently Writing Section:
- Heading: {section_heading} ({section_level.upper()})
- Target Word Count: EXACTLY ~{target_word_count} words
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
            temperature=0.85 if humanize_writing else 0.65,
        )

        # Post-clean any remaining em-dashes
        if humanize_writing:
            raw_output = raw_output.replace(" — ", ", ").replace("—", ", ")

        return raw_output

    # --------------------------------------------------------------------------
    # STEP 4: Final SEO Polish & Anti-AI Sanitizer (Claude 4.6)
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
6. ANTI-AI DETECTOR SANITIZATION PASS:
   - Eliminate ALL em-dashes (`—` and `--`). Replace with commas or clean periods.
   - Break any remaining formulaic AI transitions ('Ini bukan sekadar...', 'Hal yang perlu dipahami...', 'Berikut lima tips...', 'Merupakan langkah krusial...').
   - Infuse native Indonesian conversational ease ('kan', 'sih', 'lho', 'nih', 'Gimana solusinya?') so AI detector gives < 15% score.
   - Ensure the prose reads 100% natural and passes both Yoast SEO and PlagiarismDetector.
"""
        else:
            humanizer_polish = ""

        system_prompt = f"""You are a Master Indonesian Editor and Anti-AI SEO Specialist.
CALIBRATION REQUIREMENTS:
1. STRICT WORD COUNT: Final text length MUST be between {target_range}.
   If under 500 words, expand paragraphs with helpful details and actionable real-world tips.
2. STRICT KEYPHRASE FREQUENCY (5 TO 7 TIMES ONLY):
   Count occurrences of '{target_keyword}'. It MUST appear between 5 and 7 times total across the entire article!
   If it appears > 7 times, replace repetitive instances with natural pronouns ('alat ini', 'langkah ini', 'perangkat tersebut').
3. SINGLE H1 RULE: Body MUST only contain ## H2 and ### H3.
4. IMAGE RULE: {image_rule}
5. Preserve all markdown links `[anchor](url)`.
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
            temperature=0.4 if humanize_writing else 0.25,
        )

        # Final pass: Strip any lingering em-dashes
        if humanize_writing:
            polished = polished.replace(" — ", ", ").replace("—", ", ")

        return polished


ai_router = AIRouterService()
