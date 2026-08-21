"""
Projects and Brand Voice settings API for Hariyuka AI.
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/projects", tags=["Projects"])

MOCK_PROJECTS_DB: Dict[str, Dict[str, Any]] = {
    "proj-default": {
        "id": "proj-default",
        "name": "Hariyuka AI Blog",
        "target_domain": "hariyuka.ai",
        "brand_voice_instructions": "Tone: Authoritative, modern, actionable, no robotic filler.",
        "default_language": "id",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
}


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=2)
    target_domain: Optional[str] = None
    brand_voice_instructions: Optional[str] = None
    default_language: str = "id"


class ProjectResponse(BaseModel):
    id: str
    name: str
    target_domain: Optional[str] = None
    brand_voice_instructions: Optional[str] = None
    default_language: str
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=List[ProjectResponse])
async def list_projects():
    return list(MOCK_PROJECTS_DB.values())


@router.post("", response_model=ProjectResponse)
async def create_project(req: ProjectCreateRequest):
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    project = {
        "id": project_id,
        "name": req.name,
        "target_domain": req.target_domain,
        "brand_voice_instructions": req.brand_voice_instructions,
        "default_language": req.default_language,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    MOCK_PROJECTS_DB[project_id] = project
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    if project_id not in MOCK_PROJECTS_DB:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
    return MOCK_PROJECTS_DB[project_id]


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if project_id in MOCK_PROJECTS_DB:
        del MOCK_PROJECTS_DB[project_id]
        return {"success": True}
    raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
