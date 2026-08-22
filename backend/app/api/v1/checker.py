"""
API Endpoints for Content Authenticity, Plagiarism, AI Detection, and Audit History.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.services.authenticity_checker import authenticity_checker
from app.db.storage import storage

router = APIRouter(prefix="/checker", tags=["Checker"])


class AuditRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Article content markdown or plain text")
    check_plagiarism: bool = Field(True, description="Run live web index plagiarism check")
    check_ai: bool = Field(True, description="Run AI Content detection check")
    title: Optional[str] = None


@router.post("/audit", response_model=Dict[str, Any])
async def run_content_audit(req: AuditRequest):
    """
    Run authentic plagiarism scan and AI detection on provided text and save to audit history.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Teks konten tidak boleh kosong")

    try:
        report = await authenticity_checker.full_audit(
            text=req.text,
            check_plag=req.check_plagiarism,
            check_ai=req.check_ai
        )

        # Extract title or snippet for history
        first_line = req.text.strip().split("\n")[0].replace("#", "").strip()
        display_title = req.title or (first_line[:65] if first_line else "Teks Tanpa Judul")
        
        history_id = str(uuid.uuid4())
        history_entry = {
            "id": history_id,
            "title": display_title,
            "text": req.text,
            "word_count": report["total_words"],
            "uniqueness_score": report["plagiarism"]["uniqueness_score"] if report.get("plagiarism") else 100,
            "plagiarism_score": report["plagiarism"]["plagiarism_score"] if report.get("plagiarism") else 0,
            "ai_percentage": report["ai_detection"]["ai_percentage"] if report.get("ai_detection") else 0,
            "human_percentage": report["ai_detection"]["human_percentage"] if report.get("ai_detection") else 100,
            "verdict": report["ai_detection"]["verdict"] if report.get("ai_detection") else "Human Written",
            "report": report,
            "created_at": datetime.utcnow().isoformat(),
        }

        storage.checker_history[history_id] = history_entry
        storage.save_checker_history()

        return {
            "success": True,
            "history_id": history_id,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan audit konten: {str(e)}")


@router.get("/history", response_model=List[Dict[str, Any]])
async def get_checker_history(limit: int = Query(25, ge=1, le=100)):
    """
    Get list of past authenticity scans sorted from newest to oldest.
    """
    history_items = list(storage.checker_history.values())
    return sorted(history_items, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]


@router.delete("/history/{history_id}")
async def delete_checker_history_item(history_id: str):
    """
    Delete a specific history entry by ID.
    """
    if history_id in storage.checker_history:
        del storage.checker_history[history_id]
        storage.save_checker_history()
        return {"success": True, "message": "Riwayat audit berhasil dihapus"}
    raise HTTPException(status_code=404, detail="Riwayat audit tidak ditemukan")


@router.delete("/history")
async def clear_all_checker_history():
    """
    Clear all checker audit history.
    """
    storage.checker_history.clear()
    storage.save_checker_history()
    return {"success": True, "message": "Semua riwayat audit berhasil dibersihkan"}
