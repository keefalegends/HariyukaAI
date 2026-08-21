"""
Agentic Pipeline Orchestrator for Hariyuka AI.
Manages the 5-step lifecycle: SERP -> Outline (Pause) -> Section Writing -> SEO Polish -> Live Stream.
"""
import asyncio
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime
from app.services.ai_router import ai_router
from app.services.serp_scraper import serp_scraper
from app.services.seo_analyzer import seo_analyzer
from app.schemas.article import ArticleOutlineSchema, OutlineSectionItem

logger = logging.getLogger("hariyuka.pipeline")


class PipelineEvent:
    def __init__(self, event_type: str, data: Dict[str, Any]):
        self.event_type = event_type
        self.data = data
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event": self.event_type,
            "data": self.data,
            "timestamp": self.timestamp
        }


class ArticlePipelineOrchestrator:
    def __init__(self):
        self.active_streams: Dict[str, asyncio.Queue] = {}

    def get_event_queue(self, article_id: str) -> asyncio.Queue:
        if article_id not in self.active_streams:
            self.active_streams[article_id] = asyncio.Queue()
        return self.active_streams[article_id]

    async def emit_event(self, article_id: str, event_type: str, data: Dict[str, Any]):
        queue = self.get_event_queue(article_id)
        event = PipelineEvent(event_type, data)
        await queue.put(event.to_dict())

    # --------------------------------------------------------------------------
    # PHASE A: GENERATE OUTLINE (Steps 1 & 2)
    # --------------------------------------------------------------------------
    async def run_phase_outline(
        self,
        article_id: str,
        target_keyword: str,
        title: Optional[str] = None,
        language: str = "id",
        tone: str = "authoritative",
        target_length: int = 2000,
        brand_voice: Optional[str] = None,
        competitor_urls: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes Step 1 (SERP & Intent) and Step 2 (Outline Generation).
        Pauses and returns the structured outline for the user to review.
        """
        logger.info(f"[{article_id}] Starting Phase 1: SERP Scraping & Intent Analysis")
        await self.emit_event(article_id, "step_start", {
            "step": 1,
            "name": "Analisis SERP & Intent Kompetitor",
            "progress": 10
        })

        # 1. SERP Scraping
        competitor_content = ""
        if competitor_urls:
            for url in competitor_urls[:3]:
                scraped = await serp_scraper.scrape_page_content(url)
                if scraped:
                    competitor_content += f"\n\n--- Crawl {url} ---\n{scraped}"
        
        if not competitor_content:
            serp_raw = await serp_scraper.search_and_extract(target_keyword, language=language)
            competitor_content = serp_raw.get("competitor_summary", "")

        # 2. Step 1: AI Intent & LSI Extraction (Gemini 3.7)
        serp_data = await ai_router.analyze_serp_and_intent(
            target_keyword=target_keyword,
            competitor_content=competitor_content,
            language=language
        )

        final_title = title or serp_data.get("suggested_title", f"Panduan Lengkap {target_keyword}")

        await self.emit_event(article_id, "step_complete", {
            "step": 1,
            "progress": 30,
            "serp_data": serp_data,
            "suggested_title": final_title
        })

        # 3. Step 2: Interactive Outline Generator (Gemini 3.7)
        logger.info(f"[{article_id}] Starting Step 2: Outline Generation")
        await self.emit_event(article_id, "step_start", {
            "step": 2,
            "name": "Membuat Kerangka Artikel (H2/H3)",
            "progress": 40
        })

        outline_json = await ai_router.generate_outline(
            target_keyword=target_keyword,
            title=final_title,
            serp_analysis=serp_data,
            tone=tone,
            target_word_count=target_length,
            brand_voice=brand_voice
        )

        await self.emit_event(article_id, "outline_ready", {
            "step": 2,
            "progress": 50,
            "title": final_title,
            "outline": outline_json,
            "message": "Outline siap untuk ditinjau dan diedit oleh pengguna."
        })

        return {
            "title": final_title,
            "serp_data": serp_data,
            "outline": outline_json
        }

    # --------------------------------------------------------------------------
    # PHASE B: MULTI-PASS SECTION WRITING & SEO POLISH (Steps 3, 4, 5)
    # --------------------------------------------------------------------------
    async def run_phase_writing(
        self,
        article_id: str,
        title: str,
        target_keyword: str,
        outline: Dict[str, Any],
        tone: str = "authoritative",
        brand_voice: Optional[str] = None,
        secondary_keywords: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes Step 3 (Multi-Pass Section Writing), Step 4 (SEO Polish),
        and streams output live to Tiptap editor.
        """
        logger.info(f"[{article_id}] Starting Phase B: Multi-pass Section Writing")
        await self.emit_event(article_id, "step_start", {
            "step": 3,
            "name": "Menulis Konten Bagian per Bagian (Multi-Pass)",
            "progress": 55
        })

        sections = outline.get("sections", [])
        total_sections = len(sections)
        written_sections: List[str] = []
        full_content_markdown = f"# {title}\n\n"
        
        # Stream the Title first
        await self.emit_event(article_id, "stream_chunk", {
            "chunk": f"# {title}\n\n",
            "section_id": "title"
        })

        previous_summary = ""

        # Loop through each section with prompt chaining
        for idx, sec in enumerate(sections):
            sec_heading = sec.get("heading", "")
            sec_level = sec.get("level", "h2")
            key_points = sec.get("key_points", [])
            sec_keywords = sec.get("keywords_to_include", [target_keyword])
            target_words = sec.get("target_word_count", 300)
            subsections = sec.get("subsections", [])

            # Update progress
            section_progress = int(55 + ((idx / max(1, total_sections)) * 25))
            await self.emit_event(article_id, "section_writing_start", {
                "section_index": idx + 1,
                "total_sections": total_sections,
                "heading": sec_heading,
                "progress": section_progress
            })

            # Claude 4.6 Section Writing
            section_text = await ai_router.write_section(
                article_title=title,
                target_keyword=target_keyword,
                section_heading=sec_heading,
                section_level=sec_level,
                key_points=key_points,
                keywords_to_include=sec_keywords,
                target_word_count=target_words,
                tone=tone,
                brand_voice=brand_voice,
                previous_sections_summary=previous_summary,
                subsections_info=subsections
            )

            written_sections.append(section_text)
            full_content_markdown += f"\n\n{section_text}\n\n"

            # Stream section to frontend
            await self.emit_event(article_id, "stream_chunk", {
                "chunk": f"\n\n{section_text}\n\n",
                "section_id": sec.get("id", f"section-{idx}")
            })

            # Update context chain summary (last 150 words of recent section)
            words = section_text.split()
            previous_summary = f"Previous section '{sec_heading}' covered: " + " ".join(words[-60:])

            # Small delay to keep event stream smooth
            await asyncio.sleep(0.2)

        # ----------------------------------------------------------------------
        # Step 4: SEO Optimization & Polish (Claude 4.6)
        # ----------------------------------------------------------------------
        logger.info(f"[{article_id}] Starting Step 4: Final SEO Optimization & Formatting Polish")
        await self.emit_event(article_id, "step_start", {
            "step": 4,
            "name": "Optimasi SEO & Penyempurnaan Format E-E-A-T",
            "progress": 85
        })

        polished_markdown = await ai_router.polish_and_optimize_seo(
            full_article_markdown=full_content_markdown,
            target_keyword=target_keyword,
            secondary_keywords=secondary_keywords or [],
            tone=tone
        )

        # ----------------------------------------------------------------------
        # Step 5: SEO Analysis Audit & Final Stream
        # ----------------------------------------------------------------------
        await self.emit_event(article_id, "step_start", {
            "step": 5,
            "name": "Kalkulasi Skor SEO & Finalisasi",
            "progress": 95
        })

        seo_audit = seo_analyzer.analyze(
            content_markdown=polished_markdown,
            target_keyword=target_keyword,
            secondary_keywords=secondary_keywords or []
        )

        final_result = {
            "article_id": article_id,
            "title": title,
            "content_markdown": polished_markdown,
            "word_count": seo_audit["word_count"],
            "seo_score": seo_audit["score"],
            "seo_audit": seo_audit
        }

        await self.emit_event(article_id, "generation_completed", {
            "step": 5,
            "progress": 100,
            "result": final_result
        })

        return final_result


orchestrator = ArticlePipelineOrchestrator()
