import os
import re
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
    serp_fallback_enabled: Optional[bool] = None
    serp_fallback_model: Optional[str] = None
    serp_fallback_provider: Optional[str] = "api_2"

    # Pipeline Model 2: Section Writer & SEO Polish
    model_writer: Optional[str] = None
    writer_provider: Optional[str] = "api_2"
    writer_fallback_enabled: Optional[bool] = None
    writer_fallback_model: Optional[str] = None
    writer_fallback_provider: Optional[str] = "api_1"

    # Legacy support
    base_url: Optional[str] = None
    api_key: Optional[str] = None


def save_to_env_file(updates: Dict[str, Any]):
    """
    Safely persist settings into .env file so changes survive server restarts.
    """
    possible_paths = [
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.getcwd(), "../.env"),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.env")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env")),
    ]
    target_path = None
    for p in possible_paths:
        if os.path.exists(p):
            target_path = p
            break

    if not target_path:
        return

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            content = f.read()

        for key, val in updates.items():
            if val is None:
                continue
            str_val = str(val).lower() if isinstance(val, bool) else str(val)
            pattern = rf"^{key}=.*$"
            if re.search(pattern, content, flags=re.MULTILINE):
                content = re.sub(pattern, f"{key}={str_val}", content, flags=re.MULTILINE)
            else:
                content += f"\n{key}={str_val}"

        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        logger.info(f"Persisted settings to {target_path}")
    except Exception as e:
        logger.error(f"Failed to persist settings to .env: {e}")


@router.post("/test-gateway")
@router.post("/test-9router")
async def test_gateway_connection(req: TestConnectionRequest):
    """
    Perform a REAL live validation test against any OpenAI-compatible Gateway
    using the provided base_url and API key. Returns available models on success.
    """
    base_url = (req.base_url or settings.API_1_BASE_URL or settings.NINEROUTER_BASE_URL).rstrip("/")
    api_key = req.api_key or settings.API_1_API_KEY or settings.NINEROUTER_API_KEY

    if not api_key or api_key in ["your_api_1_key_here", "your_9router_api_key_here", "your_api_2_key_here"]:
        return {
            "success": False,
            "status_code": 401,
            "error": "API Key belum diisi.",
            "models": []
        }

    try:
        models_url = f"{base_url}/models"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.get(models_url, headers=headers)
            
            if res.status_code == 200:
                data = res.json()
                raw_models = data.get("data", [])
                
                model_ids = []
                for m in raw_models:
                    if isinstance(m, dict):
                        # Filter enabled and available if provided, or take id
                        if m.get("available") is False or m.get("enabled") is False:
                            continue
                        if "id" in m:
                            model_ids.append(m["id"])
                    elif isinstance(m, str):
                        model_ids.append(m)

                return {
                    "success": True,
                    "status_code": 200,
                    "message": f"Koneksi Gateway Terverifikasi! {len(model_ids)} model aktif tersedia.",
                    "total_models": len(model_ids),
                    "models": model_ids
                }
            elif res.status_code in [401, 403]:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": "Autentikasi Gagal: API Key tidak valid atau ditolak oleh server gateway.",
                    "models": []
                }
            else:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": f"Gateway mengembalikan status HTTP {res.status_code}: {res.text[:200]}",
                    "models": []
                }

    except httpx.ConnectError:
        return {
            "success": False,
            "status_code": 503,
            "error": f"Tidak dapat terhubung ke gateway di {base_url}. Pastikan server aktif dan URL dapat dijangkau.",
            "models": []
        }
    except Exception as e:
        logger.error(f"Error testing gateway connection: {e}")
        return {
            "success": False,
            "status_code": 500,
            "error": f"Koneksi gagal: {str(e)}",
            "models": []
        }


@router.get("/models")
async def fetch_available_models():
    """Fetch the list of all available models hosted on default gateway."""
    res = await test_gateway_connection(TestConnectionRequest(
        base_url=settings.API_1_BASE_URL,
        api_key=settings.API_1_API_KEY
    ))
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res


@router.post("/save")
async def save_settings(req: SaveSettingsRequest):
    """
    Save active dual-gateway credentials and per-box routing & fallback configurations.
    Also persists changes to .env file to survive server restarts.
    """
    env_updates: Dict[str, Any] = {}

    # 1. API 1
    api_1_url = req.api_1_base_url or req.base_url
    if api_1_url is not None and api_1_url.strip():
        clean_url = api_1_url.strip()
        settings.API_1_BASE_URL = clean_url
        settings.NINEROUTER_BASE_URL = clean_url
        env_updates["API_1_BASE_URL"] = clean_url
        env_updates["NINEROUTER_BASE_URL"] = clean_url

    api_1_key = req.api_1_api_key or req.api_key
    if api_1_key is not None and api_1_key.strip():
        clean_key = api_1_key.strip()
        settings.API_1_API_KEY = clean_key
        settings.NINEROUTER_API_KEY = clean_key
        env_updates["API_1_API_KEY"] = clean_key
        env_updates["NINEROUTER_API_KEY"] = clean_key

    # 2. API 2
    if req.api_2_base_url is not None and req.api_2_base_url.strip():
        clean_url2 = req.api_2_base_url.strip()
        settings.API_2_BASE_URL = clean_url2
        settings.PRIMARY_AI_BASE_URL = clean_url2
        env_updates["API_2_BASE_URL"] = clean_url2
        env_updates["PRIMARY_AI_BASE_URL"] = clean_url2

    if req.api_2_api_key is not None and req.api_2_api_key.strip():
        clean_key2 = req.api_2_api_key.strip()
        settings.API_2_API_KEY = clean_key2
        settings.PRIMARY_AI_API_KEY = clean_key2
        env_updates["API_2_API_KEY"] = clean_key2
        env_updates["PRIMARY_AI_API_KEY"] = clean_key2

    # 3. Box 1: SERP & Outline
    if req.model_serp and req.model_serp.strip():
        val = req.model_serp.strip()
        settings.MODEL_SERP_EXTRACTOR = val
        settings.MODEL_OUTLINE_GENERATOR = val
        env_updates["MODEL_SERP_EXTRACTOR"] = val
        env_updates["MODEL_OUTLINE_GENERATOR"] = val

    if req.serp_provider:
        settings.SERP_PROVIDER = req.serp_provider
        env_updates["SERP_PROVIDER"] = req.serp_provider

    if req.serp_fallback_enabled is not None:
        settings.SERP_FALLBACK_ENABLED = req.serp_fallback_enabled
        env_updates["SERP_FALLBACK_ENABLED"] = req.serp_fallback_enabled

    if req.serp_fallback_model is not None:
        val = req.serp_fallback_model.strip() or None
        settings.SERP_FALLBACK_MODEL = val
        env_updates["SERP_FALLBACK_MODEL"] = val or ""

    if req.serp_fallback_provider:
        settings.SERP_FALLBACK_PROVIDER = req.serp_fallback_provider
        env_updates["SERP_FALLBACK_PROVIDER"] = req.serp_fallback_provider

    # 4. Box 2: Section Writer & SEO Polish
    if req.model_writer and req.model_writer.strip():
        val = req.model_writer.strip()
        settings.MODEL_SECTION_WRITER = val
        settings.MODEL_SEO_POLISHER = val
        env_updates["MODEL_SECTION_WRITER"] = val
        env_updates["MODEL_SEO_POLISHER"] = val

    if req.writer_provider:
        settings.WRITER_PROVIDER = req.writer_provider
        env_updates["WRITER_PROVIDER"] = req.writer_provider

    if req.writer_fallback_enabled is not None:
        settings.WRITER_FALLBACK_ENABLED = req.writer_fallback_enabled
        env_updates["WRITER_FALLBACK_ENABLED"] = req.writer_fallback_enabled

    if req.writer_fallback_model is not None:
        val = req.writer_fallback_model.strip() or None
        settings.WRITER_FALLBACK_MODEL = val
        env_updates["WRITER_FALLBACK_MODEL"] = val or ""

    if req.writer_fallback_provider:
        settings.WRITER_FALLBACK_PROVIDER = req.writer_fallback_provider
        env_updates["WRITER_FALLBACK_PROVIDER"] = req.writer_fallback_provider

    # Save to disk (.env)
    save_to_env_file(env_updates)

    # Re-initialize AI Router singleton client
    from app.services.ai_router import ai_router
    ai_router._init_client()

    return {
        "success": True,
        "message": "Pengaturan model dan dual gateway berhasil disimpan permanen!",
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
    api_1_key = settings.API_1_API_KEY or ""
    if api_1_key in ["your_api_1_key_here", "your_9router_api_key_here"]:
        api_1_key = ""

    api_2_key = settings.API_2_API_KEY or settings.PRIMARY_AI_API_KEY or ""
    if api_2_key in ["your_api_2_key_here", "your_primary_ai_api_key_here"]:
        api_2_key = ""

    return {
        # API 1
        "api_1_base_url": settings.API_1_BASE_URL or settings.NINEROUTER_BASE_URL or "",
        "api_1_api_key": api_1_key,
        "api_1_api_key_set": bool(api_1_key),
        "base_url": settings.API_1_BASE_URL or settings.NINEROUTER_BASE_URL or "",

        # API 2
        "api_2_base_url": settings.API_2_BASE_URL or settings.PRIMARY_AI_BASE_URL or "",
        "api_2_api_key": api_2_key,
        "api_2_api_key_set": bool(api_2_key),

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
    """Calculate and return REAL metrics from generated articles."""
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
