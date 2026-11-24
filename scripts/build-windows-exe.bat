@echo off
title DineSutra Windows .EXE Builder
echo ========================================================
echo   DineSutra - Compiling Dedicated Windows .EXE Installer
echo   Product: DineSutra Restaurant OS (Windows x64)
echo ========================================================
echo.

cd /d "%~dp0\..\apps\web"

echo [1/3] Verifying dependencies...
call npm install --save-dev electron electron-builder

echo [2/3] Building Next.js production bundle...
call npm run build

echo [3/3] Packaging into standalone Windows Installer & Portable EXE...
call npx electron-builder --win

echo.
echo ========================================================
echo [SUCCESS] Windows Executables created in:
echo   apps\web\dist_electron\
echo ========================================================
pause
