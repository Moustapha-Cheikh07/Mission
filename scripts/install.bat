@echo off
REM ========================================
REM Dashboard Qualit\u00e9 - Installation compl\u00e8te
REM ========================================

echo.
echo ==========================================
echo   Installation Dashboard Qualit\u00e9
echo ==========================================
echo.

REM V\u00e9rifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas install\u00e9 !
    echo.
    echo 1. T\u00e9l\u00e9charger : https://nodejs.org/
    echo 2. Installer Node.js
    echo 3. Red\u00e9marrer ce script
    echo.
    pause
    exit /b 1
)

echo [1/3] V\u00e9rification de Node.js...
node --version
npm --version
echo [OK]
echo.

echo [2/3] Installation des d\u00e9pendances...
cd /d "%~dp0..\server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Installation \u00e9chou\u00e9e !
    pause
    exit /b 1
)
echo [OK]
echo.

echo [3/3] V\u00e9rification du fichier Excel...
if exist "data\sap_export.xlsx" (
    echo [OK] Fichier Excel trouv\u00e9 : data\sap_export.xlsx
) else (
    echo [ATTENTION] Fichier Excel non trouv\u00e9 !
    echo.
    echo Veuillez placer votre fichier Excel dans :
    echo   %CD%\data\sap_export.xlsx
    echo.
)
echo.

echo ==========================================
echo   Installation termin\u00e9e !
echo ==========================================
echo.
echo Prochaines \u00e9tapes :
echo   1. Si fichier Excel manquant : le placer dans server\data\
echo   2. D\u00e9marrer : scripts\start.bat
echo   3. Acc\u00e9der : http://localhost:3000
echo.

pause
