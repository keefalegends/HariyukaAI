"""
AI Article Editor Service for Hariyuka AI.
Enables conversational, prompt-based modifications of existing articles
using Claude 4.6 Opus Thinking (or any model via 9Router).
"""
import re
import json
import logging
from typing import Dict, Any, List, Optional
from app.services.ai_router import ai_router, sanitize_indonesian_symbols
from app.services.seo_analyzer import seo_analyzer

logger = logging.getLogger("hariyuka.ai_editor")


class AIArticleEditorService:
    async def edit_article(
        self,
        article_title: str,
        target_keyword: str,
        current_content_markdown: str,
        instruction: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        article_type: str = "backlink_article",
    ) -> Dict[str, Any]:
        """
        Processes a conversational revision instruction on an existing article.
        Returns the modified markdown article and a friendly explanation in Bahasa Indonesia.
        """
        selected_model = model or "ag/claude-opus-4-6-thinking"

        system_prompt = f"""You are an Expert Indonesian SEO Editor and Copywriting Copilot powered by Claude 4.6 Opus.
Your task is to modify the provided article strictly according to the user's instructions while preserving editorial quality and SEO integrity.

CRITICAL EDITING DIRECTIVES:
1. FAITHFUL & LASER-FOCUSED REVISION:
   - Follow the user's specific instruction accurately without unnecessary fluff.
   - ZERO HALLUCINATION: Strictly base changes on real facts and the provided context. Never invent fictional regulations, fake statistics, or off-topic information.
   - ZERO TOPICAL DRIFT: Keep every sentence laser-focused on '{target_keyword}' and the article title '{article_title}'.
2. EDITORIAL SOP COMPLIANCE:
   - Every H2/H3 subheading must maintain at least 2 distinct paragraphs.
   - Every paragraph must contain at least 3 full, substantive sentences.
   - Maintain natural Indonesian conversational tone with natural particles ('sih', 'kan', 'dong', 'nih', 'lho') where appropriate.
   - ZERO EM-DASHES: Do NOT use em-dashes (`—` or `--`). Use commas, parentheses, or periods.
   - ZERO COLONS as list introducers: Do NOT use `:` to introduce a list or for emphasis. Use a comma, period, or start a new sentence instead.
   - ZERO SEMICOLONS: Do NOT use `;`. Replace with a period or comma.
   - ZERO AMPERSANDS: Do NOT use `&` (ampersand). Always write the full word `dan`.
   - ZERO WEIRD SYMBOLS: Do NOT use `/` (use `atau`), `~`, `+`, `|`. Use natural Indonesian words.
   - ACTIVE VOICE MANDATE (min 80%): Write in active voice. Avoid 'dapat digunakan', 'perlu diperhatikan', 'telah dilakukan', 'akan diberikan'. Use direct constructions: 'gunakan', 'perhatikan', 'lakukan', 'kamu bisa pakai'.
   - Target Keyphrase: Keep focus keyphrase '{target_keyword}' naturally present (5-7 times total across the article).
3. STRUCTURE & LINK INTEGRITY:
   - Output must remain clean, valid Markdown.
   - Keep existing markdown links, affiliate anchors, and images completely intact unless explicitly asked to modify them.
   - Deliver the full updated markdown and the explanation inside the JSON schema.

Output valid JSON matching this schema:
{{
  "explanation": "Penjelasan singkat, ramah, dan jelas dalam Bahasa Indonesia tentang apa saja perubahan yang telah Anda lakukan pada artikel (2-3 kalimat)...",
  "modified_content_markdown": "Full updated markdown of the entire article..."
}}"""

        history_context = ""
        if chat_history and len(chat_history) > 0:
            history_lines = []
            for msg in chat_history[-6:]:  # Last 6 messages for context
                role = "User" if msg.get("role") == "user" else "Assistant"
                history_lines.append(f"{role}: {msg.get('content')}")
            history_context = "\nRecent Conversation Context:\n" + "\n".join(history_lines) + "\n"

        user_prompt = f"""Target Keyphrase: "{target_keyword}"
Article Title: "{article_title}"
Article Type: {article_type.upper()}
{history_context}
CURRENT ARTICLE CONTENT (MARKDOWN):
---
{current_content_markdown}
---

USER INSTRUCTION:
"{instruction}"

Please execute the modification and output the JSON with explanation and modified_content_markdown:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            raw = await ai_router.complete(
                model=selected_model,
                messages=messages,
                temperature=0.35,
                response_format={"type": "json_object"},
            )
            data = ai_router.extract_json(raw)
            modified_markdown = data.get("modified_content_markdown") or current_content_markdown
            explanation = data.get("explanation") or "Artikel telah diperbarui sesuai instruksi Anda."

            # Sanitize any lingering em-dashes
            modified_markdown = modified_markdown.replace(" — ", ", ").replace("—", ", ")
            # Sanitize ampersands & weird symbols
            modified_markdown = sanitize_indonesian_symbols(modified_markdown)

            # Calculate updated SEO audit
            seo_audit = seo_analyzer.analyze(
                content_markdown=modified_markdown,
                target_keyword=target_keyword,
                article_type=article_type,
            )

            return {
                "success": True,
                "explanation": explanation,
                "modified_content_markdown": modified_markdown,
                "word_count": seo_audit["word_count"],
                "seo_score": seo_audit["score"],
                "seo_audit": seo_audit,
            }
        except Exception as e:
            logger.error(f"Failed to execute AI edit: {str(e)}")
            raise e


ai_editor = AIArticleEditorService()
