"""
Article API Endpoints for Hariyuka AI.
Handles Outline Creation, Editing, Multi-pass Writing, and Article CRUD with Persistent Storage.
Updated with Salna's Yoast WordPress SEO SOP & Humanizer Mode.
"""
import uuid
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from app.schemas.article import (
    GenerateOutlineRequest,
    ContinueWritingRequest,
    ArticleResponse,
    UpdateArticleContentRequest,
    JobStatusResponse
)
from app.pipeline.orchestrator import orchestrator
from app.services.seo_analyzer import seo_analyzer
from app.db.storage import storage

router = APIRouter(prefix="/articles", tags=["Articles"])

# Expose storage dictionary for backwards compatibility
MOCK_ARTICLES_DB = storage.articles
MOCK_JOBS_DB = storage.jobs


@router.post("/generate-outline", response_model=Dict[str, Any])
async def generate_outline_endpoint(
    req: GenerateOutlineRequest,
    background_tasks: BackgroundTasks
):
    """
    Step 1 & 2: Analyzes SERP, search intent, and creates an interactive H2/H3 outline based on article_type.
    Pauses at Step 2 to allow user review.
    """
    article_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())

    article_record = {
        "id": article_id,
        "user_id": "default-user",
        "project_id": req.project_id,
        "title": req.title or f"Artikel: {req.target_keyword}",
        "target_keyword": req.target_keyword,
        "article_type": req.article_type,
        "secondary_keywords": req.secondary_keywords or [],
        "language": req.language,
        "tone": req.tone,
        "target_length": req.target_length or (1550 if req.article_type == "pillar" else 550),
        "outline_json": None,
        "serp_data": None,
        "content_markdown": "",
        "content_html": "",
        "status": "outline_pending",
        "word_count": 0,
        "seo_score": 0,
        "seo_audit": {},
        "humanize_writing": req.humanize_writing,
        "include_image_placeholder": req.include_image_placeholder,
        "target_link_1_url": req.target_link_1_url,
        "target_link_1_anchor": req.target_link_1_anchor,
        "target_link_2_url": req.target_link_2_url,
        "target_link_2_anchor": req.target_link_2_anchor,
        "product_name": req.product_name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    storage.articles[article_id] = article_record
    storage.save_articles()

    job_record = {
        "id": job_id,
        "article_id": article_id,
        "current_step": 1,
        "total_steps": 5,
        "step_name": "serp_analysis",
        "progress_percentage": 10,
        "status": "processing",
        "logs": [{"time": datetime.utcnow().isoformat(), "message": "Memulai analisis SERP & Intent"}],
        "error_message": None,
        "updated_at": datetime.utcnow()
    }
    storage.jobs[job_id] = job_record
    storage.save_jobs()

    # Asynchronous outline generation task
    async def process_outline_task():
        try:
            res = await orchestrator.run_phase_outline(
                article_id=article_id,
                target_keyword=req.target_keyword,
                title=req.title,
                article_type=req.article_type,
                language=req.language,
                tone=req.tone,
                target_length=req.target_length,
                brand_voice=req.brand_voice_instructions,
                competitor_urls=req.competitor_urls,
                product_name=req.product_name
            )
            # Update Article record
            article_record["title"] = res["title"]
            article_record["outline_json"] = res["outline"]
            article_record["serp_data"] = res["serp_data"]
            article_record["status"] = "outline_pending"
            article_record["updated_at"] = datetime.utcnow()
            storage.save_articles()

            # Update Job record
            job_record["current_step"] = 2
            job_record["progress_percentage"] = 50
            job_record["status"] = "waiting_user_input"
            job_record["step_name"] = "outline_review"
            job_record["updated_at"] = datetime.utcnow()
            storage.save_jobs()
        except Exception as e:
            article_record["status"] = "failed"
            article_record["updated_at"] = datetime.utcnow()
            storage.save_articles()
            job_record["status"] = "failed"
            job_record["error_message"] = str(e)
            job_record["updated_at"] = datetime.utcnow()
            storage.save_jobs()

    background_tasks.add_task(process_outline_task)

    return {
        "success": True,
        "article_id": article_id,
        "job_id": job_id,
        "message": "Pembuatan outline sedang diproses di background. Pantau via SSE stream."
    }


@router.post("/{article_id}/continue-writing", response_model=Dict[str, Any])
async def continue_writing_endpoint(
    article_id: str,
    req: ContinueWritingRequest,
    background_tasks: BackgroundTasks
):
    """
    Step 3, 4 & 5: Takes the edited/approved outline and writes sections sequentially with Claude 4.6.
    """
    if article_id not in storage.articles:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")

    article = storage.articles[article_id]
    
    # Update article with latest outline and optional title changes
    if req.title:
        article["title"] = req.title
    article["outline_json"] = req.outline.model_dump()
    article["status"] = "generating"
    article["updated_at"] = datetime.utcnow()

    # Link & product & image & humanize updates if provided
    link_1_url = req.target_link_1_url or article.get("target_link_1_url")
    link_1_anchor = req.target_link_1_anchor or article.get("target_link_1_anchor")
    link_2_url = req.target_link_2_url or article.get("target_link_2_url")
    link_2_anchor = req.target_link_2_anchor or article.get("target_link_2_anchor")
    product_name = req.product_name or article.get("product_name")
    art_type = req.article_type or article.get("article_type", "backlink_article")
    include_image = req.include_image_placeholder if req.include_image_placeholder is not None else article.get("include_image_placeholder", False)
    humanize = req.humanize_writing if req.humanize_writing is not None else article.get("humanize_writing", True)

    storage.save_articles()

    async def process_writing_task():
        try:
            result = await orchestrator.run_phase_writing(
                article_id=article_id,
                title=article["title"],
                target_keyword=article["target_keyword"],
                outline=req.outline.model_dump(),
                article_type=art_type,
                tone=req.tone or article["tone"],
                brand_voice=req.brand_voice_instructions or article.get("brand_voice_instructions"),
                secondary_keywords=article.get("secondary_keywords", []),
                humanize_writing=humanize,
                include_image_placeholder=include_image,
                target_link_1_url=link_1_url,
                target_link_1_anchor=link_1_anchor,
                target_link_2_url=link_2_url,
                target_link_2_anchor=link_2_anchor,
                product_name=product_name,
                product_promotion_context=req.product_promotion_context
            )
            article["content_markdown"] = result["content_markdown"]
            article["word_count"] = result["word_count"]
            article["seo_score"] = result["seo_score"]
            article["seo_audit"] = result["seo_audit"]
            article["status"] = "completed"
            article["updated_at"] = datetime.utcnow()
            storage.save_articles()
        except Exception as e:
            article["status"] = "failed"
            article["updated_at"] = datetime.utcnow()
            storage.save_articles()

    background_tasks.add_task(process_writing_task)

    return {
        "success": True,
        "article_id": article_id,
        "message": "Penulisan artikel berlanjut. Pantau streaming konten di /api/v1/stream/{article_id}"
    }


@router.get("", response_model=List[ArticleResponse])
async def list_articles(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """List all user articles with optional status filtering."""
    articles = list(storage.articles.values())
    if status:
        articles = [a for a in articles if a["status"] == status]
    return sorted(articles, key=lambda x: x.get("created_at", datetime.min), reverse=True)[:limit]


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    """Get single article by ID with full content and SEO audit."""
    if article_id not in storage.articles:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    return storage.articles[article_id]


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article_content(article_id: str, req: UpdateArticleContentRequest):
    """Update article content from Tiptap Editor and re-evaluate SEO score."""
    if article_id not in storage.articles:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")

    article = storage.articles[article_id]
    if req.content_markdown is not None:
        article["content_markdown"] = req.content_markdown
        # Recalculate SEO Audit live with Yoast 12-Rules
        seo = seo_analyzer.analyze(
            content_markdown=req.content_markdown,
            target_keyword=article["target_keyword"],
            secondary_keywords=article.get("secondary_keywords", []),
            article_type=article.get("article_type", "backlink_article"),
            include_image_placeholder=article.get("include_image_placeholder", False)
        )
        article["word_count"] = seo["word_count"]
        article["seo_score"] = seo["score"]
        article["seo_audit"] = seo

    if req.content_html is not None:
        article["content_html"] = req.content_html
    if req.title is not None:
        article["title"] = req.title

    article["updated_at"] = datetime.utcnow()
    storage.save_articles()
    return article


@router.delete("/{article_id}")
async def delete_article(article_id: str):
    """Delete an article."""
    if article_id in storage.articles:
        del storage.articles[article_id]
        storage.save_articles()
        return {"success": True, "message": "Artikel berhasil dihapus"}
    raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
