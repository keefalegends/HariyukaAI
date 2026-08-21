@echo off
title Hariyuka AI - FastAPI Backend Engine
cd /d "%~dp0\backend"
echo [Hariyuka AI] Starting Backend Engine on http://localhost:8000...
python -m uvicorn app.main:app --reload --port 8000
pause
