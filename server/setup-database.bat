@echo off
chcp 65001 >nul
echo ========================================
echo   INITIALISATION BASE DE DONNÉES MYSQL
echo   Merlin Gerin Dashboard
echo ========================================
echo.

REM Vérifier si MySQL est accessible
echo [1/4] Vérification de MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL n'est pas trouvé dans le PATH
    echo.
    echo 💡 Solutions:
    echo    1. Si vous utilisez XAMPP, démarrez MySQL dans le Control Panel
    echo    2. Ajoutez MySQL au PATH ou utilisez le chemin complet
    echo       Exemple XAMPP: C:\xampp\mysql\bin\mysql.exe
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL trouvé
echo.

REM Demander le mot de passe
echo [2/4] Configuration de la connexion...
set /p "MYSQL_USER=Utilisateur MySQL (défaut: root): " || set MYSQL_USER=root
echo.
echo Pour XAMPP: Laissez vide (appuyez sur Entrée)
echo Pour MySQL standalone: Entrez votre mot de passe
set /p "MYSQL_PASS=Mot de passe MySQL: "
echo.

REM Choisir le script à exécuter
echo [3/4] Quel script voulez-vous exécuter ?
echo.
echo   1. Script COMPLET (recommandé)
echo      - 8 tables avec toutes les fonctionnalités
echo      - Vues, procédures stockées, triggers
echo      - Données initiales
echo.
echo   2. Script SIMPLIFIÉ
echo      - 3 tables essentielles seulement
echo      - Démarrage rapide
echo.
set /p "SCRIPT_CHOICE=Votre choix (1 ou 2): "

if "%SCRIPT_CHOICE%"=="1" (
    set SQL_FILE=init-database.sql
    echo ✅ Script complet sélectionné
) else if "%SCRIPT_CHOICE%"=="2" (
    set SQL_FILE=init-database-simple.sql
    echo ✅ Script simplifié sélectionné
) else (
    echo ❌ Choix invalide
    pause
    exit /b 1
)
echo.

REM Exécuter le script SQL
echo [4/4] Exécution du script %SQL_FILE%...
echo.

if "%MYSQL_PASS%"=="" (
    mysql -u %MYSQL_USER% < %SQL_FILE%
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASS% < %SQL_FILE%
)

if errorlevel 1 (
    echo.
    echo ❌ Erreur lors de l'exécution du script
    echo.
    echo 💡 Vérifiez:
    echo    1. MySQL est démarré
    echo    2. Le mot de passe est correct
    echo    3. L'utilisateur a les droits nécessaires
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ BASE DE DONNÉES INITIALISÉE !
echo ========================================
echo.
echo 📊 Base de données: merlin_gerin_dashboard
echo 📋 Consultez le guide: GUIDE-SCRIPTS-SQL.md
echo.
echo Prochaines étapes:
echo   1. Vérifiez dans phpMyAdmin: http://localhost/phpmyadmin
echo   2. Configurez server/config/db.config.js
echo   3. Démarrez le serveur: node server.js
echo.
pause
