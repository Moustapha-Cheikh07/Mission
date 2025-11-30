@echo off
REM ========================================
REM Dashboard Qualit\u00e9 - Script de d\u00e9marrage Windows
REM ========================================

echo.
echo ==========================================
echo   Dashboard Qualit\u00e9 - D\u00e9marrage
echo ==========================================
echo.

REM V\u00e9rifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas install\u00e9 !
    echo.
    echo T\u00e9l\u00e9charger Node.js : https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js install\u00e9 :
node --version
echo.

REM Aller dans le dossier server
cd /d "%~dp0..\server"

REM V\u00e9rifier si node_modules existe
if not exist "node_modules\" (
    echo [INFO] Premi\u00e8re installation d\u00e9tect\u00e9e
    echo [INFO] Installation des d\u00e9pendances...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation a \u00e9chou\u00e9 !
        pause
        exit /b 1
    )
    echo.
    echo [OK] D\u00e9pendances install\u00e9es
    echo.
)

echo [INFO] D\u00e9marrage du serveur...
echo.
echo ==========================================
echo.

REM D\u00e9marrer le serveur
node server.js

pause
