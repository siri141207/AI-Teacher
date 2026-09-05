@echo off
title AI Teacher - Starting Servers...
color 0A

echo.
echo  ============================================
echo    AI TEACHER - Virtual Educator Platform
echo  ============================================
echo.
echo  Starting Backend + Frontend servers...
echo.

:: Start Backend (FastAPI + Uvicorn)
echo  [1/2] Launching Backend Server (port 8000)...
cd /d "%~dp0backend"
start "AI-Teacher Backend" cmd /k ".\venv\Scripts\uvicorn.exe app:app --host 127.0.0.1 --port 8000 --reload"

:: Wait a moment for backend to initialize
ping -n 3 127.0.0.1 >nul

:: Start Frontend (Vite React)
echo  [2/2] Launching Frontend Server (port 5173)...
cd /d "%~dp0frontend"
start "AI-Teacher Frontend" cmd /k "npm run dev"

:: Wait for frontend to spin up
ping -n 4 127.0.0.1 >nul

:: Open browser
echo.
echo  Opening browser...
start http://localhost:5173

echo.
echo  ============================================
echo    Both servers are running!
echo    Backend:  http://127.0.0.1:8000
echo    Frontend: http://localhost:5173
echo  ============================================
echo.
echo  Close this window anytime. The servers
echo  will keep running in their own windows.
echo.
pause
