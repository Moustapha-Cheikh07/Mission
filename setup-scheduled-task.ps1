# ========================================
# Configuration de la Tâche Planifiée Windows
# ========================================
# Ce script configure une tâche planifiée qui exécute automatiquement
# la synchronisation du fichier Excel chaque jour à 7h30
#
# IMPORTANT: Ce script doit être exécuté avec des droits administrateur

param(
    [string]$TaskTime = "07:30",  # Heure d'exécution (format 24h)
    [string]$ServerPath = "",     # Chemin du fichier sur le serveur
    [switch]$Remove                # Supprimer la tâche existante
)

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERREUR: Ce script doit être exécuté en tant qu'administrateur!" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Clic droit sur PowerShell → 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    Write-Host "Puis exécutez: .\setup-scheduled-task.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION TÂCHE PLANIFIÉE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Nom de la tâche
$TaskName = "Dashboard MG - Sync Excel SAP"
$TaskDescription = "Synchronise automatiquement le fichier Excel SAP depuis le serveur vers le dossier local du projet Dashboard Merlin Gerin"

# Chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$syncScriptPath = Join-Path $scriptDir "sync-excel-file.ps1"

# Vérifier si le script de synchronisation existe
if (-not (Test-Path $syncScriptPath)) {
    Write-Host "❌ ERREUR: Script de synchronisation introuvable!" -ForegroundColor Red
    Write-Host "   Chemin attendu: $syncScriptPath" -ForegroundColor Yellow
    exit 1
}

# Mode suppression
if ($Remove) {
    Write-Host "Suppression de la tâche planifiée..." -ForegroundColor Yellow

    try {
        $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

        if ($existingTask) {
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            Write-Host "✓ Tâche planifiée supprimée avec succès`n" -ForegroundColor Green
        } else {
            Write-Host "⚠ Aucune tâche planifiée trouvée avec ce nom`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erreur lors de la suppression: $($_.Exception.Message)`n" -ForegroundColor Red
        exit 1
    }

    exit 0
}

# Demander le chemin du serveur si non fourni
if ([string]::IsNullOrEmpty($ServerPath)) {
    Write-Host "📁 Configuration du chemin source" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

    Write-Host "Entrez le chemin réseau complet du fichier Excel SAP:" -ForegroundColor White
    Write-Host "Exemple: \\SERVEUR\Partage\SAP\sap_export.xlsx" -ForegroundColor Gray
    Write-Host "Exemple: \\10.192.14.100\Data\Export\sap_export.xlsx`n" -ForegroundColor Gray

    $ServerPath = Read-Host "Chemin serveur"

    if ([string]::IsNullOrEmpty($ServerPath)) {
        Write-Host "`n❌ ERREUR: Vous devez fournir un chemin serveur!" -ForegroundColor Red
        exit 1
    }

    # Vérifier l'accès au serveur
    Write-Host "`nVérification de l'accès au serveur..." -ForegroundColor Yellow
    if (-not (Test-Path $ServerPath)) {
        Write-Host "⚠ ATTENTION: Impossible d'accéder au fichier!" -ForegroundColor Yellow
        Write-Host "   Vérifiez le chemin et vos droits d'accès" -ForegroundColor Yellow
        Write-Host "   La tâche sera créée mais pourrait échouer à l'exécution`n" -ForegroundColor Yellow

        $continue = Read-Host "Continuer quand même? (O/N)"
        if ($continue -ne "O" -and $continue -ne "o") {
            Write-Host "Configuration annulée`n" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "✓ Accès au serveur confirmé`n" -ForegroundColor Green
    }
}

Write-Host "`n📋 Récapitulatif de la configuration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Nom de la tâche    : $TaskName" -ForegroundColor White
Write-Host "Heure d'exécution  : $TaskTime (tous les jours)" -ForegroundColor White
Write-Host "Script à exécuter  : $syncScriptPath" -ForegroundColor White
Write-Host "Fichier source     : $ServerPath" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Confirmer la création de la tâche? (O/N)"
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "Configuration annulée`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n[1/4] Vérification des tâches existantes..." -ForegroundColor Yellow

# Supprimer la tâche existante si elle existe
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "      → Tâche existante trouvée, suppression..." -ForegroundColor Gray
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "      ✓ Ancienne tâche supprimée" -ForegroundColor Green
} else {
    Write-Host "      ✓ Aucune tâche existante" -ForegroundColor Green
}

# Créer l'action (commande à exécuter)
Write-Host "`n[2/4] Configuration de l'action..." -ForegroundColor Yellow

$actionArguments = "-NoProfile -ExecutionPolicy Bypass -File `"$syncScriptPath`" -SourcePath `"$ServerPath`""
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument $actionArguments

Write-Host "      ✓ Action configurée" -ForegroundColor Green

# Créer le déclencheur (horaire)
Write-Host "`n[3/4] Configuration du déclencheur..." -ForegroundColor Yellow

$trigger = New-ScheduledTaskTrigger -Daily -At $TaskTime

Write-Host "      ✓ Déclencheur configuré (quotidien à $TaskTime)" -ForegroundColor Green

# Créer les paramètres de la tâche
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Créer la tâche
Write-Host "`n[4/4] Enregistrement de la tâche planifiée..." -ForegroundColor Yellow

try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Description $TaskDescription `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Force | Out-Null

    Write-Host "      ✓ Tâche planifiée créée avec succès" -ForegroundColor Green

} catch {
    Write-Host "      ❌ ERREUR lors de la création de la tâche!" -ForegroundColor Red
    Write-Host "      Message: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Afficher les informations de la tâche créée
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION TERMINÉE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ La tâche planifiée a été créée avec succès!`n" -ForegroundColor Green

Write-Host "📋 Informations de la tâche:" -ForegroundColor Yellow
Write-Host "   Nom               : $TaskName" -ForegroundColor White
Write-Host "   État              : Activée" -ForegroundColor Green
Write-Host "   Fréquence         : Quotidienne" -ForegroundColor White
Write-Host "   Heure d'exécution : $TaskTime" -ForegroundColor White
Write-Host "   Dernière exécution: Jamais (nouvelle tâche)" -ForegroundColor Gray
Write-Host "   Prochaine exécution:" -ForegroundColor White

# Calculer la prochaine exécution
$now = Get-Date
$timeComponents = $TaskTime.Split(":")
$nextRun = Get-Date -Hour $timeComponents[0] -Minute $timeComponents[1] -Second 0

if ($nextRun -lt $now) {
    $nextRun = $nextRun.AddDays(1)
}

Write-Host "      → $($nextRun.ToString('dd/MM/yyyy à HH:mm:ss'))" -ForegroundColor Cyan

Write-Host "`n🔧 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   Tester maintenant       : " -NoNewline -ForegroundColor White
Write-Host "Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "   Voir les détails        : " -NoNewline -ForegroundColor White
Write-Host "Get-ScheduledTask -TaskName '$TaskName' | Format-List" -ForegroundColor Cyan
Write-Host "   Voir l'historique       : " -NoNewline -ForegroundColor White
Write-Host "Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo" -ForegroundColor Cyan
Write-Host "   Désactiver temporairement:" -NoNewline -ForegroundColor White
Write-Host "Disable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "   Réactiver               : " -NoNewline -ForegroundColor White
Write-Host "Enable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "   Supprimer               : " -NoNewline -ForegroundColor White
Write-Host ".\setup-scheduled-task.ps1 -Remove" -ForegroundColor Cyan

Write-Host "`n📁 Fichiers de logs:" -ForegroundColor Yellow
Write-Host "   Les logs de synchronisation seront dans:" -ForegroundColor White
Write-Host "   $scriptDir\logs\sync-excel-YYYY-MM.log`n" -ForegroundColor Cyan

Write-Host "💡 Conseil:" -ForegroundColor Yellow
Write-Host "   Testez la synchronisation maintenant avec:" -ForegroundColor White
Write-Host "   Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "   Puis vérifiez les logs pour confirmer que tout fonctionne`n" -ForegroundColor White

# Demander si l'utilisateur veut tester maintenant
$testNow = Read-Host "Voulez-vous tester la synchronisation maintenant? (O/N)"
if ($testNow -eq "O" -or $testNow -eq "o") {
    Write-Host "`nLancement du test de synchronisation..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

    try {
        Start-ScheduledTask -TaskName $TaskName
        Write-Host "✓ Tâche lancée!" -ForegroundColor Green
        Write-Host "  Patientez quelques secondes pendant l'exécution...`n" -ForegroundColor Yellow

        # Attendre un peu pour laisser la tâche s'exécuter
        Start-Sleep -Seconds 5

        # Récupérer les informations de la dernière exécution
        $taskInfo = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo

        if ($taskInfo.LastRunTime) {
            Write-Host "Dernière exécution   : $($taskInfo.LastRunTime.ToString('dd/MM/yyyy HH:mm:ss'))" -ForegroundColor White
            Write-Host "Code de résultat     : $($taskInfo.LastTaskResult)" -ForegroundColor White

            if ($taskInfo.LastTaskResult -eq 0) {
                Write-Host "Statut               : " -NoNewline -ForegroundColor White
                Write-Host "✓ Succès" -ForegroundColor Green
            } else {
                Write-Host "Statut               : " -NoNewline -ForegroundColor White
                Write-Host "⚠ Erreur (code: $($taskInfo.LastTaskResult))" -ForegroundColor Yellow
                Write-Host "`nConsultez les logs pour plus de détails:" -ForegroundColor Yellow
                Write-Host "$scriptDir\logs\" -ForegroundColor Cyan
            }
        }

        Write-Host ""

    } catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

Write-Host "✅ Configuration terminée avec succès!`n" -ForegroundColor Green
