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
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_serp: Optional[str] = None
    model_writer: Optional[str] = None


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
        logger.error(f"Error testing 9Router connection: {e}")
        return {
            "success": False,
            "status_code": 500,
            "error": f"Koneksi gagal: {str(e)}",
            "models": []
        }


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
    Save active model routing and API configurations.
    """
    if req.base_url:
        settings.NINEROUTER_BASE_URL = req.base_url
    if req.api_key:
        settings.NINEROUTER_API_KEY = req.api_key
    if req.model_serp:
        settings.MODEL_SERP_EXTRACTOR = req.model_serp
        settings.MODEL_OUTLINE_GENERATOR = req.model_serp
    if req.model_writer:
        settings.MODEL_SECTION_WRITER = req.model_writer
        settings.MODEL_SEO_POLISHER = req.model_writer

    # Re-initialize AI Router singleton client
    from app.services.ai_router import ai_router
    ai_router.base_url = settings.NINEROUTER_BASE_URL
    ai_router.api_key = settings.NINEROUTER_API_KEY
    ai_router.model_serp = settings.MODEL_SERP_EXTRACTOR
    ai_router.model_outline = settings.MODEL_OUTLINE_GENERATOR
    ai_router.model_writer = settings.MODEL_SECTION_WRITER
    ai_router.model_seo = settings.MODEL_SEO_POLISHER
    ai_router.client = AsyncOpenAI(
        base_url=settings.NINEROUTER_BASE_URL,
        api_key=settings.NINEROUTER_API_KEY
    )

    return {
        "success": True,
        "message": "Pengaturan model dan gateway berhasil disimpan!",
        "current_config": {
            "base_url": settings.NINEROUTER_BASE_URL,
            "serp_model": settings.MODEL_SERP_EXTRACTOR,
            "writer_model": settings.MODEL_SECTION_WRITER
        }
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
    
    sorted_recent = sorted(articles, key=lambda x: x.get("created_at", ""), reverse=True)[:5]

    return {
        "total_articles": total_articles,
        "total_words": total_words,
        "average_seo_score": avg_score,
        "completed_articles": completed,
        "recent_articles": sorted_recent
    }
