@echo off
title Hariyuka AI Launcher
echo ===================================================
echo   Starting Hariyuka AI (Backend + Frontend)
echo ===================================================
start "Hariyuka AI - Backend" cmd /c "%~dp0start-backend.bat"
start "Hariyuka AI - Frontend" cmd /c "%~dp0start-frontend.bat"
echo.
echo Kedua service sedang berjalan:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo ===================================================
