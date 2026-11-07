@echo off
REM ==============================================================================
REM RESTAURANTOS AUTOMATED DATABASE BACKUP SCRIPT (WINDOWS BAT)
REM ==============================================================================

setlocal enabledelayedexpansion

set BACKUP_DIR=.\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

set SQLITE_DB=dev.db
set BACKUP_FILE=%BACKUP_DIR%\restaurantos_sqlite_%TIMESTAMP%.db

echo =================================================================
echo   RESTAURANTOS DATABASE BACKUP (WINDOWS)
echo   Target: %SQLITE_DB%
echo   Output: %BACKUP_FILE%
echo =================================================================

if exist "%SQLITE_DB%" (
    copy /y "%SQLITE_DB%" "%BACKUP_FILE%"
    echo [SUCCESS] Backup created successfully at %BACKUP_FILE%
) else (
    echo [ERROR] Database file %SQLITE_DB% not found.
    exit /b 1
)
