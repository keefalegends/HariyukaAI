import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
ARTICLES_FILE = DATA_DIR / "articles_db.json"
JOBS_FILE = DATA_DIR / "jobs_db.json"
PROJECTS_FILE = DATA_DIR / "projects_db.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def _serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def _deserialize_datetime(d: Dict[str, Any]) -> Dict[str, Any]:
    for key in ["created_at", "updated_at"]:
        if key in d and isinstance(d[key], str):
            try:
                d[key] = datetime.fromisoformat(d[key])
            except Exception:
                pass
    return d


class PersistentStorage:
    def __init__(self):
        self.articles: Dict[str, Dict[str, Any]] = self._load_articles()
        self.jobs: Dict[str, Dict[str, Any]] = self._load_jobs()
        self.projects: Dict[str, Dict[str, Any]] = self._load_projects()

    def _load_articles(self) -> Dict[str, Dict[str, Any]]:
        if not ARTICLES_FILE.exists():
            return {}
        try:
            with open(ARTICLES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {k: _deserialize_datetime(v) for k, v in data.items()}
        except Exception as e:
            print(f"[Storage] Error loading articles: {e}")
            return {}

    def _load_jobs(self) -> Dict[str, Dict[str, Any]]:
        if not JOBS_FILE.exists():
            return {}
        try:
            with open(JOBS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {k: _deserialize_datetime(v) for k, v in data.items()}
        except Exception as e:
            print(f"[Storage] Error loading jobs: {e}")
            return {}

    def _load_projects(self) -> Dict[str, Dict[str, Any]]:
        if not PROJECTS_FILE.exists():
            return {}
        try:
            with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {k: _deserialize_datetime(v) for k, v in data.items()}
        except Exception as e:
            print(f"[Storage] Error loading projects: {e}")
            return {}

    def save_articles(self):
        try:
            with open(ARTICLES_FILE, "w", encoding="utf-8") as f:
                json.dump(self.articles, f, default=_serialize_datetime, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Storage] Error saving articles to disk: {e}")

    def save_jobs(self):
        try:
            with open(JOBS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.jobs, f, default=_serialize_datetime, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Storage] Error saving jobs to disk: {e}")

    def save_projects(self):
        try:
            with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.projects, f, default=_serialize_datetime, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Storage] Error saving projects to disk: {e}")


storage = PersistentStorage()
