"""
API Endpoints for Content Authenticity & Plagiarism / AI Detection.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.authenticity_checker import authenticity_checker

router = APIRouter(prefix="/checker", tags=["Checker"])


class AuditRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Article content markdown or plain text")
    check_plagiarism: bool = Field(True, description="Run live web index plagiarism check")
    check_ai: bool = Field(True, description="Run AI Content detection check")


@router.post("/audit", response_model=Dict[str, Any])
async def run_content_audit(req: AuditRequest):
    """
    Run authentic plagiarism scan and AI detection on provided text.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Teks konten tidak boleh kosong")

    try:
        report = await authenticity_checker.full_audit(
            text=req.text,
            check_plag=req.check_plagiarism,
            check_ai=req.check_ai
        )
        return {
            "success": True,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan audit konten: {str(e)}")
