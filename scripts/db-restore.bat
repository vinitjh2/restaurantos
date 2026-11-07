@echo off
REM ==============================================================================
REM RESTAURANTOS DATABASE RESTORATION SCRIPT (WINDOWS BAT)
REM ==============================================================================

if "%~1"=="" (
    echo Usage: %0 ^<path-to-backup-file^> [target-db-path]
    echo Example: %0 backups\restaurantos_sqlite_20261106_120000.db dev.db
    exit /b 1
)

set BACKUP_FILE=%~1
set TARGET_DB=%~2
if "%TARGET_DB%"=="" set TARGET_DB=dev.db

if not exist "%BACKUP_FILE%" (
    echo [ERROR] Backup file not found: %BACKUP_FILE%
    exit /b 1
)

echo =================================================================
echo   RESTAURANTOS DATABASE RESTORATION (WINDOWS)
echo   Source: %BACKUP_FILE%
echo   Target: %TARGET_DB%
echo =================================================================

copy /y "%BACKUP_FILE%" "%TARGET_DB%"
echo [SUCCESS] Restored database from %BACKUP_FILE% to %TARGET_DB%
