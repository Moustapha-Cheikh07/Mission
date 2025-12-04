@echo off
echo ================================================
echo   Redemarrage Dashboard Qualite Merlin Gerin
echo ================================================
echo.

REM Verifier si PM2 est installe
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] PM2 n'est pas installe!
    echo Installez PM2 avec: npm install -g pm2
    pause
    exit /b 1
)

echo [1/3] Arret de l'application...
pm2 stop dashboard-qualite 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Redemarrage de l'application...
pm2 restart dashboard-qualite

echo [3/3] Verification du statut...
echo.
pm2 status

echo.
echo ================================================
echo   Application redemarree avec succes!
echo ================================================
echo.
echo URL Local:  http://localhost:1880
echo URL Reseau: http://10.192.14.223:1880
echo.
echo Pour voir les logs en temps reel:
echo   pm2 logs dashboard-qualite
echo.
pause
