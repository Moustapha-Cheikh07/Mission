# ========================================
# Script de Sauvegarde - Dashboard Merlin Gerin
# ========================================
# Sauvegarde automatique des données critiques

param(
    [string]$BackupPath = "C:\Backups\Dashboard"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $BackupPath $timestamp
$sourceDir = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE DASHBOARD MERLIN GERIN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Créer le dossier de sauvegarde
Write-Host "Création du dossier de sauvegarde..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "  ✓ Dossier créé: $backupDir`n" -ForegroundColor Green

# Liste des fichiers/dossiers à sauvegarder
$itemsToBackup = @(
    @{Path="backend\fiches-etoile.csv"; Name="Fiches NNCP"},
    @{Path="backend\quality-documents.json"; Name="Documents Qualité"},
    @{Path="backend\training-documents.json"; Name="Documents Formation"},
    @{Path="backend\assets"; Name="Assets (documents/images)"},
    @{Path="backend\cache"; Name="Cache JSON"},
    @{Path="backend\data"; Name="Données Excel"}
)

$successCount = 0
$totalSize = 0

foreach ($item in $itemsToBackup) {
    $sourcePath = Join-Path $sourceDir $item.Path
    
    if (Test-Path $sourcePath) {
        Write-Host "Sauvegarde: $($item.Name)..." -ForegroundColor Yellow
        
        try {
            if (Test-Path $sourcePath -PathType Container) {
                # C'est un dossier
                $destPath = Join-Path $backupDir (Split-Path $item.Path -Leaf)
                Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
                $size = (Get-ChildItem $sourcePath -Recurse | Measure-Object -Property Length -Sum).Sum
            } else {
                # C'est un fichier
                $destPath = Join-Path $backupDir (Split-Path $item.Path -Leaf)
                Copy-Item -Path $sourcePath -Destination $destPath -Force
                $size = (Get-Item $sourcePath).Length
            }
            
            $totalSize += $size
            $sizeInMB = [math]::Round($size / 1MB, 2)
            Write-Host "  ✓ $($item.Name) sauvegardé ($sizeInMB MB)" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ $($item.Name) non trouvé, ignoré" -ForegroundColor Yellow
    }
}

# Créer un fichier de métadonnées
$metadata = @{
    Date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    ItemsBackedUp = $successCount
    TotalSizeMB = [math]::Round($totalSize / 1MB, 2)
    BackupPath = $backupDir
}

$metadata | ConvertTo-Json | Out-File (Join-Path $backupDir "backup-info.json")

# Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE TERMINÉE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ $successCount/$($itemsToBackup.Count) éléments sauvegardés" -ForegroundColor Green
Write-Host "📦 Taille totale: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "📁 Emplacement: $backupDir`n" -ForegroundColor Cyan

# Nettoyage des anciennes sauvegardes (garder les 7 dernières)
Write-Host "Nettoyage des anciennes sauvegardes..." -ForegroundColor Yellow
$allBackups = Get-ChildItem -Path $BackupPath -Directory | Sort-Object Name -Descending
if ($allBackups.Count -gt 7) {
    $toDelete = $allBackups | Select-Object -Skip 7
    foreach ($old in $toDelete) {
        Remove-Item $old.FullName -Recurse -Force
        Write-Host "  ✓ Supprimé: $($old.Name)" -ForegroundColor Gray
    }
    Write-Host "  ✓ Anciennes sauvegardes nettoyées (gardé les 7 dernières)`n" -ForegroundColor Green
} else {
    Write-Host "  ✓ Aucun nettoyage nécessaire`n" -ForegroundColor Green
}

Write-Host "✅ Sauvegarde terminée avec succès!`n" -ForegroundColor Green
