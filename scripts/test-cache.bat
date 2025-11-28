@echo off
REM ========================================
REM Test du système de cache
REM ========================================

echo.
echo ==========================================
echo   Test du système de cache
echo ==========================================
echo.

cd /d "%~dp0..\server"

echo Exécution du test...
echo.

node test-cache.js

echo.
echo ==========================================
echo   Test terminé
echo ==========================================
echo.

pause
