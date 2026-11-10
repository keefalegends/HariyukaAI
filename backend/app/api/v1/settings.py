"""
Settings & 9Router Proxy Inspection API Endpoints.
Performs real live authentication check and fetches available models from 9Router.
"""
import os
import logging
import httpx
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger("hariyuka.settings")
router = APIRouter(prefix="/settings", tags=["Settings"])


class TestConnectionRequest(BaseModel):
    base_url: Optional[str] = None
    api_key: Optional[str] = None


class SaveSettingsRequest(BaseModel):
    # API 1
    api_1_base_url: Optional[str] = None
    api_1_api_key: Optional[str] = None
    # API 2
    api_2_base_url: Optional[str] = None
    api_2_api_key: Optional[str] = None

    # Pipeline Model 1: SERP & Outline
    model_serp: Optional[str] = None
    serp_provider: Optional[str] = "api_1"
    serp_fallback_enabled: Optional[bool] = False
    serp_fallback_model: Optional[str] = None
    serp_fallback_provider: Optional[str] = "api_2"

    # Pipeline Model 2: Section Writer & SEO Polish
    model_writer: Optional[str] = None
    writer_provider: Optional[str] = "api_2"
    writer_fallback_enabled: Optional[bool] = False
    writer_fallback_model: Optional[str] = None
    writer_fallback_provider: Optional[str] = "api_1"

    # Legacy support
    base_url: Optional[str] = None
    api_key: Optional[str] = None


@router.post("/test-9router")
async def test_9router_connection(req: TestConnectionRequest):
    """
    Perform a REAL live validation test against 9Router Proxy using the provided API key.
    Rejects invalid keys and returns the real model list on success.
    """
    base_url = (req.base_url or settings.NINEROUTER_BASE_URL).rstrip("/")
    api_key = req.api_key or settings.NINEROUTER_API_KEY

    if not api_key or api_key == "your_9router_api_key_here":
        return {
            "success": False,
            "status_code": 401,
            "error": "API Key 9Router belum diisi.",
            "models": []
        }

    try:
        # 1. Call 9Router /models endpoint via httpx to get raw response and status code
        models_url = f"{base_url}/models"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(models_url, headers=headers)
            
            if res.status_code == 200:
                data = res.json()
                raw_models = data.get("data", [])
                
                # Extract model IDs
                model_ids = []
                for m in raw_models:
                    if isinstance(m, dict) and "id" in m:
                        model_ids.append(m["id"])
                    elif isinstance(m, str):
                        model_ids.append(m)

                return {
                    "success": True,
                    "status_code": 200,
                    "message": f"Koneksi 9Router Terverifikasi! {len(model_ids)} model tersedia.",
                    "total_models": len(model_ids),
                    "models": model_ids
                }
            elif res.status_code in [401, 403]:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": "Autentikasi Gagal: 9Router API Key tidak valid atau ditolak oleh server proxy.",
                    "models": []
                }
            else:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": f"9Router mengembalikan status HTTP {res.status_code}: {res.text[:200]}",
                    "models": []
                }

    except httpx.ConnectError:
        return {
            "success": False,
            "status_code": 503,
            "error": f"Tidak dapat terhubung ke server 9Router di {base_url}. Pastikan server proxy aktif dan IP dapat dijangkau.",
            "models": []
        }
    except Exception as e:
        logger.error(f"Error testing AI Gateway connection: {e}")
        return {
            "success": False,
            "status_code": 500,
            "error": f"Koneksi gagal: {str(e)}",
            "models": []
        }


@router.post("/test-gateway")
async def test_generic_gateway(req: TestConnectionRequest):
    """
    Generic tester for ANY OpenAI-compatible Gateway (Re:Link, OpenRouter, LiteLLM, 9Router, etc.).
    Validates API key and returns available models list.
    """
    return await test_9router_connection(req)


@router.get("/models")
async def fetch_available_models():
    """
    Fetch the list of all available models hosted on 9Router.
    """
    res = await test_9router_connection(TestConnectionRequest(
        base_url=settings.NINEROUTER_BASE_URL,
        api_key=settings.NINEROUTER_API_KEY
    ))
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res


@router.post("/save")
async def save_settings(req: SaveSettingsRequest):
    """
    Save active dual-gateway credentials and per-box routing & fallback configurations.
    """
    # 1. API 1
    api_1_url = req.api_1_base_url or req.base_url
    if api_1_url is not None:
        settings.API_1_BASE_URL = api_1_url.strip()
        settings.NINEROUTER_BASE_URL = api_1_url.strip()
    api_1_key = req.api_1_api_key or req.api_key
    if api_1_key is not None and api_1_key.strip():
        settings.API_1_API_KEY = api_1_key.strip()
        settings.NINEROUTER_API_KEY = api_1_key.strip()

    # 2. API 2
    if req.api_2_base_url is not None:
        settings.API_2_BASE_URL = req.api_2_base_url.strip() or None
        settings.PRIMARY_AI_BASE_URL = settings.API_2_BASE_URL
    if req.api_2_api_key is not None and req.api_2_api_key.strip():
        settings.API_2_API_KEY = req.api_2_api_key.strip() or None
        settings.PRIMARY_AI_API_KEY = settings.API_2_API_KEY

    # 3. Box 1: SERP & Outline
    if req.model_serp:
        settings.MODEL_SERP_EXTRACTOR = req.model_serp.strip()
        settings.MODEL_OUTLINE_GENERATOR = req.model_serp.strip()
    if req.serp_provider:
        settings.SERP_PROVIDER = req.serp_provider
    if req.serp_fallback_enabled is not None:
        settings.SERP_FALLBACK_ENABLED = req.serp_fallback_enabled
    if req.serp_fallback_model is not None:
        settings.SERP_FALLBACK_MODEL = req.serp_fallback_model.strip() or None
    if req.serp_fallback_provider:
        settings.SERP_FALLBACK_PROVIDER = req.serp_fallback_provider

    # 4. Box 2: Section Writer & SEO Polish
    if req.model_writer:
        settings.MODEL_SECTION_WRITER = req.model_writer.strip()
        settings.MODEL_SEO_POLISHER = req.model_writer.strip()
    if req.writer_provider:
        settings.WRITER_PROVIDER = req.writer_provider
    if req.writer_fallback_enabled is not None:
        settings.WRITER_FALLBACK_ENABLED = req.writer_fallback_enabled
    if req.writer_fallback_model is not None:
        settings.WRITER_FALLBACK_MODEL = req.writer_fallback_model.strip() or None
    if req.writer_fallback_provider:
        settings.WRITER_FALLBACK_PROVIDER = req.writer_fallback_provider

    # Re-initialize AI Router singleton client
    from app.services.ai_router import ai_router
    ai_router._init_client()

    return {
        "success": True,
        "message": "Pengaturan model dan dual gateway berhasil disimpan!",
        "current_config": {
            "api_1_base_url": settings.API_1_BASE_URL,
            "api_2_base_url": settings.API_2_BASE_URL,
            "serp_model": settings.MODEL_SERP_EXTRACTOR,
            "writer_model": settings.MODEL_SECTION_WRITER,
        }
    }


@router.get("/current")
async def get_current_settings():
    """Get currently active settings from environment/memory."""
    return {
        # API 1
        "api_1_base_url": settings.API_1_BASE_URL or settings.NINEROUTER_BASE_URL or "",
        "api_1_api_key_set": bool(settings.API_1_API_KEY and settings.API_1_API_KEY != "your_api_1_key_here"),
        "base_url": settings.API_1_BASE_URL or settings.NINEROUTER_BASE_URL or "",

        # API 2
        "api_2_base_url": settings.API_2_BASE_URL or settings.PRIMARY_AI_BASE_URL or "",
        "api_2_api_key_set": bool(settings.API_2_API_KEY or settings.PRIMARY_AI_API_KEY),

        # Box 1: SERP & Outline
        "model_serp": settings.MODEL_SERP_EXTRACTOR,
        "serp_provider": settings.SERP_PROVIDER,
        "serp_fallback_enabled": settings.SERP_FALLBACK_ENABLED,
        "serp_fallback_model": settings.SERP_FALLBACK_MODEL or "",
        "serp_fallback_provider": settings.SERP_FALLBACK_PROVIDER or "api_2",

        # Box 2: Section Writer & SEO Polish
        "model_writer": settings.MODEL_SECTION_WRITER,
        "writer_provider": settings.WRITER_PROVIDER,
        "writer_fallback_enabled": settings.WRITER_FALLBACK_ENABLED,
        "writer_fallback_model": settings.WRITER_FALLBACK_MODEL or "",
        "writer_fallback_provider": settings.WRITER_FALLBACK_PROVIDER or "api_1",
    }


@router.get("/dashboard-stats")
async def get_dashboard_stats():
    """
    Calculate and return REAL metrics from generated articles.
    """
    from app.api.v1.articles import MOCK_ARTICLES_DB
    
    articles = list(MOCK_ARTICLES_DB.values())
    total_articles = len(articles)
    
    if total_articles == 0:
        return {
            "total_articles": 0,
            "total_words": 0,
            "average_seo_score": 0,
            "completed_articles": 0,
            "recent_articles": []
        }

    total_words = sum(a.get("word_count", 0) for a in articles)
    scores = [a.get("seo_score", 0) for a in articles if a.get("seo_score", 0) > 0]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    completed = len([a for a in articles if a.get("status") == "completed"])
    
    sorted_recent = sorted(articles, key=lambda x: str(x.get("created_at") or ""), reverse=True)[:5]

    return {
        "total_articles": total_articles,
        "total_words": total_words,
        "average_seo_score": avg_score,
        "completed_articles": completed,
        "recent_articles": sorted_recent
    }
