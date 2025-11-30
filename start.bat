@echo off
echo ===================================================
echo   DEMARRAGE DU DASHBOARD QUALITE MERLIN GERIN
echo ===================================================
echo.
echo 1. Demarrage du serveur de donnees (Node.js)...
echo    Ne fermez PAS cette fenetre noire !
echo.

cd server
start "Serveur de Donnees (Ne pas fermer)" node server.js

echo 2. Attente du serveur (2 secondes)...
timeout /t 2 /nobreak >nul

echo 3. Ouverture du Dashboard dans le navigateur...
cd ..
start index.html

echo.
echo ===================================================
echo   TOUT EST PRET !
echo   Vous pouvez reduire cette fenetre, mais ne la fermez pas.
echo ===================================================
pause
