"""
Projects and Brand Voice settings API for Hariyuka AI.
Persistent storage across server restarts with zero mock projects by default.
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.db.storage import storage

router = APIRouter(prefix="/projects", tags=["Projects"])


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
    projects = list(storage.projects.values())
    return sorted(projects, key=lambda x: x.get("created_at", datetime.min), reverse=True)


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
    storage.projects[project_id] = project
    storage.save_projects()
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    if project_id not in storage.projects:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
    return storage.projects[project_id]


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if project_id in storage.projects:
        del storage.projects[project_id]
        storage.save_projects()
        return {"success": True, "message": "Proyek berhasil dihapus"}
    raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
