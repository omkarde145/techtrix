@echo off
setlocal enabledelayedexpansion
title GraminVikas 360 v2.0 - GovTech Platform Runner

:: Navigate to script directory
cd /d "%~dp0"

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ==========================================================
    echo  [ERROR] Node.js is not installed or not found in PATH!
    echo ==========================================================
    echo.
    echo  Please download and install Node.js (LTS version 18 or 20)
    echo  from: https://nodejs.org/
    echo.
    echo  After installing, restart your terminal or double-click this
    echo  file again.
    echo.
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not detected in your PATH.
    pause
    exit /b 1
)

:: Auto-detect local Wi-Fi / Ethernet IPv4 address for mobile testing
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set TMP_IP=%%a
    set TMP_IP=!TMP_IP: =!
    if not defined LOCAL_IP set LOCAL_IP=!TMP_IP!
)

cls
echo ==========================================================
echo   GraminVikas 360 v2.0 - Final Production GovTech Suite
echo   Ministry of Rural Development * Government of India
echo ==========================================================
echo.
echo   [PC Desktop Web] : http://localhost:3000
if defined LOCAL_IP (
    echo   [Mobile Wi-Fi]   : http://!LOCAL_IP!:3000
    echo   [Mobile Field PWA]: http://!LOCAL_IP!:3000/field
)
echo.
echo   [Inspector Login] : FO-8821 / 1234
echo   [BDO Admin Login] : DSC PIN: 2024
echo   [Citizen Portal]  : http://localhost:3000/citizen
echo ==========================================================
echo.

:: Clean up any stale process holding port 3000 or 5001 from a previous run
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%p >nul 2>nul
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%p >nul 2>nul

:: 1. Auto-install dependencies if missing on fresh clone
if not exist "frontend\node_modules" if not exist "node_modules" (
    echo [Step 1/3] Dependencies not found. Installing project packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
)

:: 2. Clean corrupted Next.js cache if present
if exist "frontend\.next\cache" (
    rmdir /s /q "frontend\.next\cache" >nul 2>nul
)

:: 3. Build backend microservice if dist is missing
if not exist "backend\dist\server.js" (
    echo [Step 2/3] Building backend microservice...
    call npm run build --prefix backend
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to compile backend TypeScript server.
        pause
        exit /b 1
    )
)

:: 4. Start Backend API Server in background on port 5001
echo [Step 3/3] Starting Backend Microservice on port 5001...
start "GraminVikas Backend Microservice" /min node backend/dist/server.js

:: 5. Open Default Web Browser after 3 seconds
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 6. Launch Frontend Next.js Dev Server (bound to 0.0.0.0 for LAN/mobile access)
echo.
echo ==========================================================
echo   Application is starting up!
echo   Opening http://localhost:3000 in your browser...
echo   Press Ctrl+C to stop the servers at any time.
echo ==========================================================
echo.

call npm run dev --prefix frontend

pause
