@echo off
setlocal enabledelayedexpansion
title GraminVikas 360 v2.0 - Cross-Platform Mobile Runner

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

cls
echo ==========================================================
echo   GraminVikas 360 v2.0 - Mobile App Runner (iOS & Android)
echo   Ministry of Rural Development * Government of India
echo ==========================================================
echo.
echo   [Mobile Simulator URL] : http://localhost:8080
echo.
echo ==========================================================
echo.

node serve-preview.js

pause
