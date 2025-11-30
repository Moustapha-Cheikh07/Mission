@echo off
echo ========================================
echo   Visualiser les fiches etoile MySQL
echo ========================================
echo.
echo Connexion a MySQL...
echo.

REM Remplacez "root" par votre utilisateur MySQL si different
REM Si vous avez un mot de passe, ajoutez -p
mysql -u root -e "USE merlin_gerin_dashboard; SELECT * FROM fiche_etoile ORDER BY created_at DESC;"

echo.
echo ========================================
pause
