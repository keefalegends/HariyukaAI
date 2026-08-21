"""
Dedicated AI Service Module for Hariyuka AI
Configured for self-hosted 9Router Proxy (OpenAI-compatible) routing to Gemini 3.7 and Claude 4.6.
"""

import json
import logging
import re
from typing import AsyncGenerator, Dict, Any, List, Optional
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger("hariyuka.ai_router")


class NineRouterService:
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None
    ):
        self.base_url = base_url or settings.NINEROUTER_BASE_URL
        self.api_key = api_key or settings.NINEROUTER_API_KEY
        
        # Initialize OpenAI SDK client overriding baseURL and apiKey for 9Router
        self.client = AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )
        
        # Model Aliases configured in 9Router
        self.model_serp = settings.MODEL_SERP_EXTRACTOR      # gemini-3.7
        self.model_outline = settings.MODEL_OUTLINE_GENERATOR # gemini-3.7
        self.model_writer = settings.MODEL_SECTION_WRITER     # claude-4.6
        self.model_seo = settings.MODEL_SEO_POLISHER          # claude-4.6

    # --------------------------------------------------------------------------
    # Generic Completion & Streaming Helpers
    # --------------------------------------------------------------------------
    async def complete(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        response_format: Optional[Dict[str, str]] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Execute non-streaming completion through 9Router."""
        try:
            kwargs: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            if response_format:
                kwargs["response_format"] = response_format
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

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
        """Stream chunks via AsyncGenerator for real-time SSE streaming."""
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

    # --------------------------------------------------------------------------
    # Utility: JSON Parser with Markdown Codeblock Strip
    # --------------------------------------------------------------------------
    @staticmethod
    def extract_json(raw_text: str) -> Dict[str, Any]:
        """Safely parse JSON even when wrapped in markdown ```json blocks."""
        text = raw_text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        return json.loads(text)

    # --------------------------------------------------------------------------
    # STEP 1: SERP Scraping & Intent Analysis (Gemini 3.7)
    # --------------------------------------------------------------------------
    async def analyze_serp_and_intent(
        self,
        target_keyword: str,
        competitor_content: Optional[str] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Step 1: Extract intent, search queries, secondary LSI keywords, and entity clusters.
        Powered by Gemini 3.7 for rapid data parsing.
        """
        system_prompt = (
            "You are an Elite SEO Strategist and Search Intent Classifier. "
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
  "suggested_title": "Optimized Click-Worthy SEO Title"
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
    # STEP 2: Interactive Outline Generator (Gemini 3.7)
    # --------------------------------------------------------------------------
    async def generate_outline(
        self,
        target_keyword: str,
        title: str,
        serp_analysis: Dict[str, Any],
        tone: str = "authoritative",
        target_word_count: int = 2000,
        brand_voice: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Step 2: Generate a hierarchical H2/H3 article outline in JSON.
        Powered by Gemini 3.7 for logical, comprehensive structure.
        """
        system_prompt = (
            "You are a Master Content Architect. Create an exhaustive, highly structured "
            "article outline designed to outrank the top 3 Google results. "
            "Structure logical H2s and sub-H3s with target word counts, key points to cover, "
            "and specific keyword placements."
        )

        user_prompt = f"""
Article Title: {title}
Target Keyword: {target_keyword}
Target Total Words: {target_word_count}
Tone: {tone}
Brand Voice Instructions: {brand_voice or "Professional, authoritative, high-clarity"}

SERP & Intent Context:
- Search Intent: {serp_analysis.get('search_intent')}
- LSI Keywords: {', '.join(serp_analysis.get('lsi_keywords', []))}
- Semantic Entities: {', '.join(serp_analysis.get('semantic_entities', []))}
- PAA Questions: {', '.join(serp_analysis.get('paa_questions', []))}
- Content Gaps: {', '.join(serp_analysis.get('content_gaps', []))}

Output valid JSON matching this schema:
{{
  "title": "{title}",
  "estimated_total_words": {target_word_count},
  "sections": [
    {{
      "id": "section-1",
      "heading": "Introduction: ...",
      "level": "h2",
      "target_word_count": 250,
      "key_points": ["Hook reader with problem", "Provide brief preview", "Define core premise"],
      "keywords_to_include": ["{target_keyword}"]
    }},
    {{
      "id": "section-2",
      "heading": "...",
      "level": "h2",
      "target_word_count": 400,
      "key_points": ["..."],
      "keywords_to_include": ["..."],
      "subsections": [
        {{
          "id": "section-2-1",
          "heading": "...",
          "level": "h3",
          "target_word_count": 200,
          "key_points": ["..."],
          "keywords_to_include": ["..."]
        }}
      ]
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
    # STEP 3: Multi-Pass Section Writer (Claude 4.6 / Sonnet)
    # --------------------------------------------------------------------------
    async def write_section(
        self,
        article_title: str,
        target_keyword: str,
        section_heading: str,
        section_level: str,
        key_points: List[str],
        keywords_to_include: List[str],
        target_word_count: int,
        tone: str,
        brand_voice: Optional[str] = None,
        previous_sections_summary: Optional[str] = None,
        subsections_info: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """
        Step 3: Write an individual section with prompt-chaining context.
        Powered by Claude 4.6 for human-grade, non-robotic prose.
        """
        system_prompt = (
            "You are a Pulitzer-caliber Technical & SEO Writer. "
            "You write human-grade, engaging, insightful content with NO AI fluff, "
            "no overused cliches (e.g., 'In today's fast-paced world', 'Delve into', 'Tapestry', 'Testament to'). "
            "Use active voice, short readable paragraphs, concrete examples, and authoritative depth. "
            "Output strictly in clean Markdown format."
        )

        user_prompt = f"""
Article Title: {article_title}
Target Primary Keyword: {target_keyword}
Tone: {tone}
Brand Voice Guidelines: {brand_voice or "Authoritative, practical, actionable"}

Currently Writing Section:
- Heading: {section_heading} ({section_level.upper()})
- Target Word Count: ~{target_word_count} words
- Key Points to Cover:
{chr(10).join(f"  * {pt}" for pt in key_points)}
- Keywords to naturally weave in: {', '.join(keywords_to_include)}

Context from Previous Sections (Maintain flow, DO NOT repeat these points):
{previous_sections_summary or "This is the first section."}

Instructions:
1. Write the section content in Markdown, starting with `{section_level.upper()} {section_heading}`.
2. Include short, punchy paragraphs (2-3 sentences max per paragraph).
3. Weave bullet points, bold key insights, and actionable advice.
4. Do NOT output meta-commentary or concluding phrases like 'In conclusion'.
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        return await self.complete(
            model=self.model_writer,
            messages=messages,
            temperature=0.7,
        )

    # --------------------------------------------------------------------------
    # STEP 4: SEO Optimization & Formatting Polish (Claude 4.6)
    # --------------------------------------------------------------------------
    async def polish_and_optimize_seo(
        self,
        full_article_markdown: str,
        target_keyword: str,
        secondary_keywords: List[str],
        tone: str,
    ) -> str:
        """
        Step 4: Polish formatting, balance paragraphs, insert image placeholders,
        and maximize E-E-A-T signals.
        Powered by Claude 4.6.
        """
        system_prompt = (
            "You are an Elite SEO Editor & Quality Assurance Director. "
            "Your job is to take the full draft and apply final high-performance SEO polish: "
            "1. Insert strategic [IMAGE: description | alt='target keyword rich alt text'] placeholders where visual aids enhance reader retention. "
            "2. Bold critical takeaway sentences (1-2 per section). "
            "3. Ensure seamless transitions between sections. "
            "4. Eliminate any lingering robotic phrasing or repetitive transition words. "
            "Return ONLY the perfected final Markdown."
        )

        user_prompt = f"""
Target Primary Keyword: {target_keyword}
Secondary Keywords: {', '.join(secondary_keywords)}
Tone: {tone}

Full Article Draft to Polish:
{full_article_markdown}
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        return await self.complete(
            model=self.model_seo,
            messages=messages,
            temperature=0.4,
        )


# Singleton instance
ai_router = NineRouterService()
