@echo off
REM ========================================
REM Rafraîchir le cache manuellement
REM ========================================

echo.
echo ==========================================
echo   Rafraîchissement manuel du cache
echo ==========================================
echo.

echo Cette commande force la mise à jour du cache
echo en relisant le fichier Excel et en le convertissant en JSON.
echo.

echo Appuyez sur une touche pour continuer ou fermez la fenêtre pour annuler...
pause >nul

echo.
echo Envoi de la requête au serveur...

curl -X POST http://localhost:3000/api/cache/refresh

echo.
echo.
echo ==========================================
echo   Opération terminée
echo ==========================================
echo.

pause
