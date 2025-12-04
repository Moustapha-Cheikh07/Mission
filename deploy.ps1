# ========================================
# Script de Déploiement - Dashboard Merlin Gerin
# ========================================
# Ce script automatise le déploiement sur un serveur local

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉPLOIEMENT DASHBOARD MERLIN GERIN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Variables de configuration
$APP_NAME = "Dashboard Merlin Gerin"
$APP_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $APP_DIR "backend"
$PORT = 3000

# Étape 1: Vérification de Node.js
Write-Host "[1/7] Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERREUR: Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "  Téléchargez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Vérification de npm
Write-Host "`n[2/7] Vérification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm installé: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERREUR: npm n'est pas installé!" -ForegroundColor Red
    exit 1
}

# Étape 3: Installation des dépendances
Write-Host "`n[3/7] Installation des dépendances..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
try {
    npm install --production
    Write-Host "  ✓ Dépendances installées avec succès" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERREUR lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

# Étape 4: Vérification du fichier Excel
Write-Host "`n[4/7] Vérification du fichier Excel SAP..." -ForegroundColor Yellow
$excelPath = Join-Path $BACKEND_DIR "data\sap_export.xlsx"
if (Test-Path $excelPath) {
    Write-Host "  ✓ Fichier Excel trouvé: $excelPath" -ForegroundColor Green
} else {
    Write-Host "  ⚠ ATTENTION: Fichier Excel non trouvé!" -ForegroundColor Yellow
    Write-Host "  Chemin attendu: $excelPath" -ForegroundColor Yellow
    Write-Host "  L'application démarrera mais les données ne seront pas disponibles." -ForegroundColor Yellow
}

# Étape 5: Création du dossier logs
Write-Host "`n[5/7] Création du dossier logs..." -ForegroundColor Yellow
$logsDir = Join-Path $APP_DIR "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    Write-Host "  ✓ Dossier logs créé: $logsDir" -ForegroundColor Green
} else {
    Write-Host "  ✓ Dossier logs existe déjà" -ForegroundColor Green
}

# Étape 6: Configuration du pare-feu
Write-Host "`n[6/7] Configuration du pare-feu Windows..." -ForegroundColor Yellow
try {
    # Vérifier si la règle existe déjà
    $existingRule = Get-NetFirewallRule -DisplayName "Dashboard Merlin Gerin" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "  ✓ Règle de pare-feu existe déjà" -ForegroundColor Green
    } else {
        # Créer la règle (nécessite des droits administrateur)
        New-NetFirewallRule -DisplayName "Dashboard Merlin Gerin" `
            -Direction Inbound `
            -Protocol TCP `
            -LocalPort $PORT `
            -Action Allow `
            -ErrorAction Stop | Out-Null
        Write-Host "  ✓ Règle de pare-feu créée (Port $PORT)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Impossible de configurer le pare-feu (droits administrateur requis)" -ForegroundColor Yellow
    Write-Host "  Exécutez manuellement:" -ForegroundColor Yellow
    Write-Host "  New-NetFirewallRule -DisplayName 'Dashboard Merlin Gerin' -Direction Inbound -Protocol TCP -LocalPort $PORT -Action Allow" -ForegroundColor Cyan
}

# Étape 7: Affichage des informations réseau
Write-Host "`n[7/7] Informations réseau..." -ForegroundColor Yellow
$networkInterfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" }

Write-Host "  Adresses IP disponibles:" -ForegroundColor Cyan
foreach ($interface in $networkInterfaces) {
    Write-Host "    • http://$($interface.IPAddress):$PORT" -ForegroundColor Green
}

# Résumé final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DÉPLOIEMENT TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ L'application est prête à être démarrée!`n" -ForegroundColor Green

Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Démarrage manuel (test):" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Cyan
Write-Host "     node server.js`n" -ForegroundColor Cyan

Write-Host "  2. Démarrage avec PM2 (production - recommandé):" -ForegroundColor White
Write-Host "     npm install -g pm2" -ForegroundColor Cyan
Write-Host "     pm2 start ecosystem.config.js" -ForegroundColor Cyan
Write-Host "     pm2 save" -ForegroundColor Cyan
Write-Host "     pm2 startup`n" -ForegroundColor Cyan

Write-Host "📖 Consultez le guide complet:" -ForegroundColor Yellow
Write-Host "   guide_deploiement_serveur_local.md`n" -ForegroundColor Cyan

Set-Location $APP_DIR
