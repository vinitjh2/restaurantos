@echo off
title DineSutra Mobile App Packager
echo ========================================================
echo   DineSutra - Mobile App & Capacitor Setup
echo   Target: Android Mobile & Tablet / PWA Standalone
echo ========================================================
echo.

cd /d "%~dp0\..\apps\web"

echo [1/3] Checking Capacitor dependencies...
call npm install --save @capacitor/core @capacitor/cli @capacitor/android

echo [2/3] Syncing web assets & Capacitor config...
call npx cap sync

echo [3/3] Mobile application ready.
echo To run in Android Studio:
echo   npx cap open android
echo.
echo For PWA 1-Tap Installation on Android / iOS:
echo   1. Open Chrome/Safari on your mobile device.
echo   2. Navigate to http://localhost:3000 (or https://dinesutra.sutrauniverse.com)
echo   3. Tap "Install App" or "Add to Home Screen".
echo ========================================================
pause
