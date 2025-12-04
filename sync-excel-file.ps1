# ========================================
# Script de Synchronisation - Fichier Excel SAP
# ========================================
# Ce script copie automatiquement le fichier Excel depuis le serveur
# vers le dossier local du projet
#
# UTILISATION:
#   Exécution manuelle: .\sync-excel-file.ps1
#   Tâche planifiée: Configurée pour s'exécuter à 7h30 chaque jour

param(
    [string]$SourcePath = "",  # Chemin du fichier sur le serveur (à configurer)
    [string]$DestinationPath = ""  # Chemin de destination local (à configurer)
)

# ========================================
# CONFIGURATION
# ========================================

# Si les paramètres ne sont pas fournis, utiliser les valeurs par défaut
if ([string]::IsNullOrEmpty($SourcePath)) {
    # IMPORTANT: Remplacez ce chemin par le chemin réel du fichier sur le serveur
    # Exemple: "\\SERVEUR\Partage\SAP\sap_export.xlsx"
    $SourcePath = "\\SERVEUR_NAME\PARTAGE\sap_export.xlsx"
}

if ([string]::IsNullOrEmpty($DestinationPath)) {
    # Destination par défaut: dossier data du backend
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $DestinationPath = Join-Path $scriptDir "backend\data\sap_export.xlsx"
}

# Dossier de logs
$logDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "logs"
$logFile = Join-Path $logDir "sync-excel-$(Get-Date -Format 'yyyy-MM').log"

# ========================================
# FONCTIONS
# ========================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    # Créer le dossier logs s'il n'existe pas
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    # Écrire dans le fichier log
    Add-Content -Path $logFile -Value $logMessage

    # Afficher dans la console avec couleur
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage -ForegroundColor White }
    }
}

function Get-FileHash-MD5 {
    param([string]$FilePath)

    if (Test-Path $FilePath) {
        $md5 = [System.Security.Cryptography.MD5]::Create()
        $stream = [System.IO.File]::OpenRead($FilePath)
        $hash = [System.BitConverter]::ToString($md5.ComputeHash($stream))
        $stream.Close()
        return $hash.Replace("-", "").ToLower()
    }
    return $null
}

# ========================================
# DÉBUT DU SCRIPT
# ========================================

Write-Log "========================================" "INFO"
Write-Log "SYNCHRONISATION FICHIER EXCEL SAP" "INFO"
Write-Log "========================================" "INFO"
Write-Log "Heure de démarrage: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "INFO"
Write-Log "" "INFO"

# Vérifier si le chemin source est configuré
if ($SourcePath -eq "\\SERVEUR_NAME\PARTAGE\sap_export.xlsx") {
    Write-Log "ERREUR: Le chemin source n'est pas configuré!" "ERROR"
    Write-Log "Veuillez éditer le script et remplacer le chemin par défaut" "ERROR"
    Write-Log "ou fournir le paramètre -SourcePath" "ERROR"
    exit 1
}

# Étape 1: Vérifier l'existence du fichier source
Write-Log "Étape 1: Vérification du fichier source..." "INFO"
Write-Log "  Chemin source: $SourcePath" "INFO"

if (-not (Test-Path $SourcePath)) {
    Write-Log "ERREUR: Fichier source introuvable!" "ERROR"
    Write-Log "  Vérifiez que le chemin réseau est accessible" "ERROR"
    Write-Log "  Vérifiez vos droits d'accès au serveur" "ERROR"
    exit 1
}

Write-Log "  ✓ Fichier source trouvé" "SUCCESS"

# Obtenir les informations du fichier source
$sourceFile = Get-Item $SourcePath
$sourceSizeMB = [math]::Round($sourceFile.Length / 1MB, 2)
$sourceModified = $sourceFile.LastWriteTime
Write-Log "  Taille: $sourceSizeMB MB" "INFO"
Write-Log "  Dernière modification: $($sourceModified.ToString('dd/MM/yyyy HH:mm:ss'))" "INFO"

# Étape 2: Vérifier si une copie est nécessaire
Write-Log "" "INFO"
Write-Log "Étape 2: Vérification de la nécessité de copie..." "INFO"

$needCopy = $false
$reason = ""

if (-not (Test-Path $DestinationPath)) {
    $needCopy = $true
    $reason = "Fichier de destination n'existe pas"
} else {
    $destFile = Get-Item $DestinationPath
    $destModified = $destFile.LastWriteTime

    # Comparer les dates de modification
    if ($sourceFile.LastWriteTime -gt $destFile.LastWriteTime) {
        $needCopy = $true
        $reason = "Fichier source plus récent"
    }

    # Comparer les tailles (sécurité supplémentaire)
    if ($sourceFile.Length -ne $destFile.Length) {
        $needCopy = $true
        $reason = "Tailles différentes"
    }

    # Comparer les hash MD5 pour être sûr (optionnel, peut être long)
    # Décommentez si vous voulez une vérification complète
    # $sourceHash = Get-FileHash-MD5 $SourcePath
    # $destHash = Get-FileHash-MD5 $DestinationPath
    # if ($sourceHash -ne $destHash) {
    #     $needCopy = $true
    #     $reason = "Contenus différents (hash MD5)"
    # }
}

if (-not $needCopy) {
    Write-Log "  ✓ Aucune copie nécessaire (fichiers identiques)" "SUCCESS"
    Write-Log "" "INFO"
    Write-Log "========================================" "INFO"
    Write-Log "SYNCHRONISATION TERMINÉE - Aucune action requise" "SUCCESS"
    Write-Log "========================================" "INFO"
    exit 0
}

Write-Log "  → Copie nécessaire: $reason" "WARNING"

# Étape 3: Créer le dossier de destination si nécessaire
Write-Log "" "INFO"
Write-Log "Étape 3: Préparation du dossier de destination..." "INFO"

$destDir = Split-Path -Parent $DestinationPath
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Write-Log "  ✓ Dossier créé: $destDir" "SUCCESS"
} else {
    Write-Log "  ✓ Dossier existe déjà" "INFO"
}

# Étape 4: Sauvegarder l'ancien fichier (si existe)
if (Test-Path $DestinationPath) {
    Write-Log "" "INFO"
    Write-Log "Étape 4: Sauvegarde de l'ancien fichier..." "INFO"

    $backupDir = Join-Path (Split-Path -Parent $DestinationPath) "backup"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }

    $backupName = "sap_export_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').xlsx"
    $backupPath = Join-Path $backupDir $backupName

    try {
        Copy-Item -Path $DestinationPath -Destination $backupPath -Force
        Write-Log "  ✓ Ancien fichier sauvegardé: $backupName" "SUCCESS"

        # Nettoyer les anciennes sauvegardes (garder les 7 dernières)
        $oldBackups = Get-ChildItem -Path $backupDir -Filter "sap_export_*.xlsx" |
                      Sort-Object LastWriteTime -Descending |
                      Select-Object -Skip 7

        if ($oldBackups) {
            foreach ($old in $oldBackups) {
                Remove-Item $old.FullName -Force
                Write-Log "  ✓ Ancienne sauvegarde supprimée: $($old.Name)" "INFO"
            }
        }
    } catch {
        Write-Log "  ⚠ Impossible de sauvegarder l'ancien fichier: $($_.Exception.Message)" "WARNING"
    }
}

# Étape 5: Copier le fichier
Write-Log "" "INFO"
Write-Log "Étape 5: Copie du fichier Excel..." "INFO"

$startTime = Get-Date

try {
    # Copier avec progression (pour les gros fichiers)
    Copy-Item -Path $SourcePath -Destination $DestinationPath -Force -ErrorAction Stop

    $duration = ((Get-Date) - $startTime).TotalSeconds
    $durationStr = [math]::Round($duration, 2)

    Write-Log "  ✓ Fichier copié avec succès" "SUCCESS"
    Write-Log "  Durée: $durationStr secondes" "INFO"
    Write-Log "  Taille: $sourceSizeMB MB" "INFO"

} catch {
    Write-Log "ERREUR lors de la copie du fichier!" "ERROR"
    Write-Log "  Message: $($_.Exception.Message)" "ERROR"
    Write-Log "  Vérifiez les permissions d'écriture" "ERROR"
    exit 1
}

# Étape 6: Vérifier l'intégrité de la copie
Write-Log "" "INFO"
Write-Log "Étape 6: Vérification de l'intégrité..." "INFO"

if (Test-Path $DestinationPath) {
    $destFile = Get-Item $DestinationPath
    $destSizeMB = [math]::Round($destFile.Length / 1MB, 2)

    if ($destFile.Length -eq $sourceFile.Length) {
        Write-Log "  ✓ Tailles identiques ($destSizeMB MB)" "SUCCESS"
    } else {
        Write-Log "  ⚠ ATTENTION: Tailles différentes!" "WARNING"
        Write-Log "    Source: $sourceSizeMB MB" "WARNING"
        Write-Log "    Destination: $destSizeMB MB" "WARNING"
    }
} else {
    Write-Log "  ✗ Fichier de destination introuvable après copie!" "ERROR"
    exit 1
}

# Étape 7: Déclencher le rafraîchissement du cache (optionnel)
Write-Log "" "INFO"
Write-Log "Étape 7: Rafraîchissement du cache..." "INFO"

# Note: Cette étape nécessite que le serveur Node.js soit en cours d'exécution
# Elle peut être décommentée si vous voulez rafraîchir le cache automatiquement
<#
try {
    $apiUrl = "http://localhost:1880/api/cache/refresh"
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -TimeoutSec 120
    Write-Log "  ✓ Cache rafraîchi avec succès" "SUCCESS"
} catch {
    Write-Log "  ⚠ Impossible de rafraîchir le cache (serveur non démarré?)" "WARNING"
    Write-Log "    Le cache sera rafraîchi automatiquement à 8h00" "INFO"
}
#>
Write-Log "  ℹ Le cache sera rafraîchi automatiquement à 8h00" "INFO"

# Résumé final
Write-Log "" "INFO"
Write-Log "========================================" "INFO"
Write-Log "SYNCHRONISATION TERMINÉE AVEC SUCCÈS" "SUCCESS"
Write-Log "========================================" "INFO"
Write-Log "Date/Heure de fin: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "INFO"
Write-Log "Fichier destination: $DestinationPath" "INFO"
Write-Log "" "INFO"

# Retourner un code de succès
exit 0
