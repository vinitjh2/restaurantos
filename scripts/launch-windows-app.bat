@echo off
title DineSutra Restaurant OS & POS (Desktop Terminal)
echo =======================================================
echo    DineSutra - Restaurant Operating System & POS
echo    Launching Native Dedicated Desktop Terminal...
echo =======================================================
echo.

cd /d "%~dp0\..\apps\web"

REM Check if Electron is installed and launch via Electron if present
if exist "node_modules\electron" (
    echo [1/2] Launching Electron Native Terminal...
    start "" npx electron electron/main.js
    goto launched
)

REM Fallback 1: Detect Microsoft Edge Standalone App Mode
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo [1/2] Launching via Microsoft Edge Standalone App Mode...
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:3000/dashboard?source=desktop_terminal" --window-size=1440,900
    goto launched
)

REM Fallback 2: Detect Google Chrome Standalone App Mode
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [1/2] Launching via Google Chrome Standalone App Mode...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000/dashboard?source=desktop_terminal" --window-size=1440,900
    goto launched
)

REM Fallback 3: Standard Web Browser
start http://localhost:3000/dashboard?source=desktop_terminal

:launched
echo [OK] DineSutra Desktop Terminal successfully started.
exit /b 0
