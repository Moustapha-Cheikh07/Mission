# 📋 Guide de Synchronisation Automatique du Fichier Excel SAP

## 🎯 Objectif

Automatiser la copie quotidienne du fichier Excel SAP depuis le serveur vers le dossier local du projet Dashboard Merlin Gerin.

**Contexte:**
- Le fichier Excel original sur le serveur se met à jour automatiquement chaque jour à **7h00**
- Notre application doit récupérer ce fichier mis à jour pour afficher les données actuelles
- La synchronisation est programmée pour **7h30** (30 minutes après la mise à jour)
- Le cache de l'application est ensuite rafraîchi automatiquement à **8h00** (30 minutes après la synchronisation)

---

## 📦 Fichiers Fournis

Trois fichiers ont été créés pour gérer la synchronisation:

| Fichier | Description |
|---------|-------------|
| `sync-excel-file.ps1` | Script de synchronisation principal (copie le fichier) |
| `setup-scheduled-task.ps1` | Script de configuration de la tâche planifiée Windows |
| `GUIDE_SYNCHRONISATION_EXCEL.md` | Ce guide (documentation) |

---

## ⚙️ Installation et Configuration

### Prérequis

- ✅ Windows Server ou Windows 10/11
- ✅ PowerShell 5.1 ou supérieur
- ✅ Droits administrateur sur la machine
- ✅ Accès réseau au serveur contenant le fichier Excel SAP
- ✅ Permissions de lecture sur le partage réseau

### Étape 1: Localiser le Fichier Excel sur le Serveur

Avant de configurer la synchronisation, vous devez connaître le **chemin réseau complet** du fichier Excel.

**Exemples de chemins possibles:**
```
\\SERVEUR-SAP\Partages\Export\sap_export.xlsx
\\10.192.14.100\Data\SAP\sap_export.xlsx
\\SERVEUR-PROD\Public\Export_SAP_850MS.xlsx
```

**Comment trouver le chemin:**
1. Ouvrez l'Explorateur Windows
2. Naviguez vers le serveur contenant le fichier
3. Clic droit sur le fichier → **Propriétés** → Onglet **Général**
4. Copiez l'emplacement complet

---

### Étape 2: Configuration Manuelle (Méthode Alternative)

Si vous préférez configurer manuellement, éditez le fichier `sync-excel-file.ps1`:

```powershell
# Ligne 21-22: Remplacez le chemin par défaut
if ([string]::IsNullOrEmpty($SourcePath)) {
    $SourcePath = "\\VOTRE-SERVEUR\VOTRE-PARTAGE\sap_export.xlsx"  # ← ICI
}
```

---

### Étape 3: Configuration Automatique (Recommandée)

#### 3.1 Ouvrir PowerShell en Administrateur

1. Clic droit sur le menu **Démarrer**
2. Sélectionnez **Windows PowerShell (administrateur)** ou **Terminal (Admin)**
3. Acceptez l'UAC (contrôle de compte utilisateur)

#### 3.2 Naviguer vers le Dossier du Projet

```powershell
cd "C:\Users\DELL\Desktop\mssion"
```

*(Remplacez par le chemin où se trouve votre projet)*

#### 3.3 Autoriser l'Exécution des Scripts

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Confirmez avec **O** (Oui)

#### 3.4 Lancer la Configuration

```powershell
.\setup-scheduled-task.ps1
```

#### 3.5 Suivre les Instructions

Le script vous demandera:

1. **Chemin du serveur:** Entrez le chemin réseau complet
   ```
   Exemple: \\SERVEUR\Partage\SAP\sap_export.xlsx
   ```

2. **Vérification de l'accès:** Le script teste automatiquement l'accès au serveur

3. **Confirmation:** Vérifiez le récapitulatif et confirmez avec **O**

4. **Test optionnel:** Le script propose de tester immédiatement la synchronisation

---

### Étape 4: Vérification

#### 4.1 Vérifier la Tâche Planifiée

**Via PowerShell:**
```powershell
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"
```

**Via l'Interface Windows:**
1. Ouvrez **Planificateur de tâches** (Rechercher "Planificateur" dans le menu Démarrer)
2. Bibliothèque du Planificateur de tâches
3. Cherchez la tâche **"Dashboard MG - Sync Excel SAP"**
4. Vérifiez l'état: **Prêt**

#### 4.2 Tester Manuellement

```powershell
Start-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"
```

#### 4.3 Consulter les Logs

Les logs sont créés automatiquement dans:
```
C:\Users\DELL\Desktop\mssion\logs\sync-excel-2025-12.log
```

**Exemple de contenu (succès):**
```
[2025-12-04 07:30:15] [INFO] ========================================
[2025-12-04 07:30:15] [INFO] SYNCHRONISATION FICHIER EXCEL SAP
[2025-12-04 07:30:15] [INFO] ========================================
[2025-12-04 07:30:15] [INFO] Étape 1: Vérification du fichier source...
[2025-12-04 07:30:15] [SUCCESS]   ✓ Fichier source trouvé
[2025-12-04 07:30:15] [INFO]   Taille: 28.45 MB
[2025-12-04 07:30:17] [SUCCESS]   ✓ Fichier copié avec succès
[2025-12-04 07:30:17] [INFO]   Durée: 1.89 secondes
```

---

## 🔧 Fonctionnement Détaillé

### Processus de Synchronisation

```
┌──────────────────────────────────────────────────────────────┐
│                   FLUX DE SYNCHRONISATION                     │
└──────────────────────────────────────────────────────────────┘

 7h00 │ Fichier Excel sur le serveur mis à jour (SAP)
      │
      ↓
 7h30 │ ⚙️  Tâche planifiée Windows se déclenche
      │     └─→ Exécute sync-excel-file.ps1
      │
      ↓
      │ 🔍 Vérification:
      │    • Fichier source existe?
      │    • Fichier destination existe?
      │    • Dates de modification différentes?
      │    • Tailles différentes?
      │
      ↓
      │ 💾 Si copie nécessaire:
      │    • Sauvegarde ancien fichier → /backend/data/backup/
      │    • Copie nouveau fichier → /backend/data/sap_export.xlsx
      │    • Nettoyage anciennes sauvegardes (garde 7 dernières)
      │
      ↓
      │ ✅ Vérification intégrité (comparaison tailles)
      │
      ↓
      │ 📝 Écriture logs → /logs/sync-excel-YYYY-MM.log
      │
      ↓
 8h00 │ 🔄 Cache automatiquement rafraîchi (cache-manager.js)
      │    └─→ Données disponibles dans l'application
```

### Sécurités Intégrées

Le script inclut plusieurs mécanismes de sécurité:

1. **Sauvegarde automatique:** Ancien fichier sauvegardé avant écrasement
2. **Vérification d'intégrité:** Comparaison des tailles après copie
3. **Nettoyage intelligent:** Conservation des 7 dernières sauvegardes
4. **Logs détaillés:** Traçabilité complète de chaque synchronisation
5. **Gestion d'erreurs:** Arrêt immédiat en cas de problème avec code d'erreur

---

## 📊 Commandes Utiles

### Gestion de la Tâche Planifiée

```powershell
# Voir les détails de la tâche
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" | Format-List

# Voir l'historique d'exécution
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" | Get-ScheduledTaskInfo

# Lancer manuellement (pour tester)
Start-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"

# Désactiver temporairement
Disable-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"

# Réactiver
Enable-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"

# Supprimer la tâche
.\setup-scheduled-task.ps1 -Remove
# OU
Unregister-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" -Confirm:$false
```

### Synchronisation Manuelle

```powershell
# Avec détection automatique du chemin serveur (si configuré)
.\sync-excel-file.ps1

# Avec spécification explicite du chemin
.\sync-excel-file.ps1 -SourcePath "\\SERVEUR\Partage\sap_export.xlsx"

# Avec destination personnalisée
.\sync-excel-file.ps1 -SourcePath "\\SERVEUR\Partage\sap_export.xlsx" `
                      -DestinationPath "C:\MonDossier\sap_export.xlsx"
```

### Consultation des Logs

```powershell
# Afficher les logs du mois en cours
Get-Content "logs\sync-excel-$(Get-Date -Format 'yyyy-MM').log"

# Afficher en temps réel (tail -f)
Get-Content "logs\sync-excel-$(Get-Date -Format 'yyyy-MM').log" -Wait

# Afficher uniquement les erreurs
Get-Content "logs\sync-excel-*.log" | Select-String "ERROR"

# Afficher uniquement les succès
Get-Content "logs\sync-excel-*.log" | Select-String "TERMINÉE AVEC SUCCÈS"
```

---

## 🐛 Dépannage

### Problème 1: "Fichier source introuvable"

**Symptôme:** Erreur dans les logs
```
[ERROR] Fichier source introuvable!
```

**Causes possibles:**
- Chemin réseau incorrect
- Serveur inaccessible (réseau, VPN)
- Permissions insuffisantes

**Solutions:**
1. Vérifier le chemin avec l'Explorateur Windows
2. Tester la connectivité réseau: `Test-Path "\\SERVEUR\Partage\fichier.xlsx"`
3. Vérifier les permissions d'accès au partage réseau
4. Contacter l'équipe IT si le serveur est inaccessible

---

### Problème 2: "Erreur lors de la copie"

**Symptôme:**
```
[ERROR] ERREUR lors de la copie du fichier!
```

**Causes possibles:**
- Espace disque insuffisant
- Permissions d'écriture manquantes
- Fichier verrouillé par un autre processus

**Solutions:**
1. Vérifier l'espace disque disponible: `Get-PSDrive C`
2. Vérifier les permissions du dossier `/backend/data/`
3. Arrêter temporairement l'application si elle utilise le fichier
4. Exécuter le script en tant qu'administrateur

---

### Problème 3: "Tâche ne s'exécute pas"

**Symptôme:** Aucune synchronisation à 7h30

**Diagnostic:**
```powershell
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" | Get-ScheduledTaskInfo
```

**Vérifier:**
- **État:** Doit être "Ready" (Prêt)
- **Dernière exécution:** Vérifier LastRunTime
- **Code de résultat:** 0 = succès, autre = erreur

**Solutions:**
1. Vérifier que la tâche est activée
   ```powershell
   Enable-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"
   ```

2. Vérifier l'historique dans le Planificateur de tâches:
   - Ouvrir **Planificateur de tâches**
   - Sélectionner la tâche
   - Onglet **Historique**

3. Recréer la tâche:
   ```powershell
   .\setup-scheduled-task.ps1 -Remove
   .\setup-scheduled-task.ps1
   ```

---

### Problème 4: "Tâche s'exécute mais échoue"

**Diagnostic:**
```powershell
# Voir le code de résultat
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" | Get-ScheduledTaskInfo
```

**Codes d'erreur courants:**

| Code | Signification | Solution |
|------|---------------|----------|
| 0 | Succès | Aucune action |
| 1 | Erreur générale | Consulter les logs |
| 2 | Fichier non trouvé | Vérifier le chemin source |
| 5 | Accès refusé | Vérifier les permissions |
| 267011 | Tâche encore en cours | Augmenter le timeout |

**Solutions:**
1. Consulter les logs détaillés dans `/logs/`
2. Tester manuellement: `.\sync-excel-file.ps1`
3. Vérifier que le compte SYSTEM a accès au partage réseau

---

### Problème 5: "Données pas à jour dans l'application"

**Symptôme:** Le dashboard affiche d'anciennes données

**Vérifications:**

1. **Synchronisation effectuée?**
   ```powershell
   Get-Item "backend\data\sap_export.xlsx" | Select-Object LastWriteTime
   ```
   Doit afficher une date récente (aujourd'hui à 7h30)

2. **Cache rafraîchi?**
   ```powershell
   Get-Item "backend\cache\data_cache.json" | Select-Object LastWriteTime
   ```
   Doit être rafraîchi à 8h00 du matin

3. **Serveur en cours d'exécution?**
   ```powershell
   Test-NetConnection localhost -Port 1880
   ```

**Solutions:**
1. Rafraîchir manuellement le cache:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:1880/api/cache/refresh" -Method POST
   ```

2. Redémarrer le serveur:
   ```powershell
   pm2 restart dashboard-mg
   ```

3. Vérifier les logs du serveur:
   ```powershell
   pm2 logs dashboard-mg
   ```

---

## 📅 Planification et Horaires

### Flux Temporel Complet

```
┌─────────┬────────────────────────────────────────────────────┐
│ Heure   │ Action                                              │
├─────────┼────────────────────────────────────────────────────┤
│ 7h00    │ 📊 SAP met à jour le fichier Excel sur le serveur  │
│ 7h30    │ 🔄 Synchronisation automatique du fichier          │
│ 8h00    │ 💾 Rafraîchissement du cache JSON                  │
│         │    └─→ Données disponibles dans l'application      │
│ 8h30    │ 🏭 Rafraîchissement des caches îlots               │
└─────────┴────────────────────────────────────────────────────┘
```

### Pourquoi 7h30 et pas immédiatement après 7h00?

- **Marge de sécurité:** Laisse 30 minutes pour que SAP termine complètement la mise à jour
- **Évite la corruption:** Ne copie pas un fichier en cours d'écriture
- **Fiabilité:** Garantit que le fichier est stable avant la copie

### Modifier l'Horaire

Pour changer l'heure d'exécution (par exemple à 8h00):

```powershell
.\setup-scheduled-task.ps1 -Remove
.\setup-scheduled-task.ps1 -TaskTime "08:00"
```

---

## 🔐 Sécurité et Permissions

### Permissions Requises

**Pour la configuration initiale:**
- ✅ Droits administrateur locaux (création tâche planifiée)
- ✅ Accès réseau au serveur SAP
- ✅ Permissions de lecture sur le partage réseau

**Pour l'exécution automatique:**
- ✅ La tâche s'exécute avec le compte SYSTEM
- ✅ Le compte SYSTEM doit avoir accès au partage réseau
- ✅ Permissions d'écriture dans `/backend/data/`

### Configuration des Permissions Réseau

Si la tâche échoue à accéder au serveur:

**Option 1: Mapper un lecteur réseau persistant (Recommandé)**
```powershell
# Mapper avec authentification
net use Z: \\SERVEUR\Partage /user:DOMAINE\Utilisateur MotDePasse /persistent:yes

# Puis configurer avec le lecteur mappé
.\setup-scheduled-task.ps1 -ServerPath "Z:\sap_export.xlsx"
```

**Option 2: Modifier le compte d'exécution de la tâche**
1. Ouvrir le **Planificateur de tâches**
2. Sélectionner la tâche **"Dashboard MG - Sync Excel SAP"**
3. Clic droit → **Propriétés**
4. Onglet **Général** → **Modifier** le compte
5. Entrer un compte avec accès réseau (ex: `DOMAINE\ServiceAccount`)

---

## 📦 Sauvegarde et Archivage

### Sauvegardes Automatiques

Chaque fois qu'un nouveau fichier est copié, l'ancien est automatiquement sauvegardé:

**Emplacement:** `/backend/data/backup/`

**Format de nom:** `sap_export_YYYY-MM-DD_HH-mm-ss.xlsx`

**Exemple:**
```
backend/
  data/
    sap_export.xlsx           ← Fichier actuel
    backup/
      sap_export_2025-12-03_07-30-15.xlsx
      sap_export_2025-12-02_07-30-12.xlsx
      sap_export_2025-12-01_07-30-18.xlsx
      ... (7 sauvegardes conservées)
```

### Restaurer une Sauvegarde

Si vous devez revenir à un fichier précédent:

```powershell
# Voir les sauvegardes disponibles
Get-ChildItem "backend\data\backup\" | Sort-Object LastWriteTime -Descending

# Restaurer une sauvegarde spécifique
Copy-Item "backend\data\backup\sap_export_2025-12-03_07-30-15.xlsx" `
          "backend\data\sap_export.xlsx" -Force

# Rafraîchir le cache
Invoke-RestMethod -Uri "http://localhost:1880/api/cache/refresh" -Method POST
```

### Archivage Long Terme

Pour archiver les fichiers au-delà de 7 jours, créez une tâche supplémentaire:

```powershell
# Exemple: Copier vers un dossier d'archive mensuel
$archiveDir = "C:\Archives\Dashboard\$(Get-Date -Format 'yyyy-MM')"
New-Item -ItemType Directory -Path $archiveDir -Force
Copy-Item "backend\data\sap_export.xlsx" "$archiveDir\sap_export_$(Get-Date -Format 'yyyy-MM-dd').xlsx"
```

---

## 🚀 Optimisations et Améliorations

### Option 1: Rafraîchir le Cache Immédiatement

Pour que les données soient disponibles immédiatement après la synchronisation (au lieu d'attendre 3h00 le lendemain):

**Éditer `sync-excel-file.ps1`, ligne 165-176:**
```powershell
# Décommenter ce bloc:
try {
    $apiUrl = "http://localhost:1880/api/cache/refresh"
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -TimeoutSec 120
    Write-Log "  ✓ Cache rafraîchi avec succès" "SUCCESS"
} catch {
    Write-Log "  ⚠ Impossible de rafraîchir le cache" "WARNING"
}
```

**Avantage:** Données disponibles immédiatement après 7h30
**Inconvénient:** Nécessite que le serveur Node.js soit en cours d'exécution

---

### Option 2: Vérification Hash MD5 (Sécurité Maximale)

Pour garantir l'intégrité complète du fichier (pas seulement la taille):

**Éditer `sync-excel-file.ps1`, ligne 126-131:**
```powershell
# Décommenter ce bloc:
$sourceHash = Get-FileHash-MD5 $SourcePath
$destHash = Get-FileHash-MD5 $DestinationPath
if ($sourceHash -ne $destHash) {
    $needCopy = $true
    $reason = "Contenus différents (hash MD5)"
}
```

**Avantage:** Détection garantie des différences
**Inconvénient:** Plus lent (calcul MD5 sur 28MB)

---

### Option 3: Notification par Email

Pour recevoir un email après chaque synchronisation:

**Ajouter à la fin de `sync-excel-file.ps1`:**
```powershell
# Configuration email
$emailParams = @{
    From = "dashboard@votre-entreprise.com"
    To = "admin@votre-entreprise.com"
    Subject = "Synchronisation Excel - $(Get-Date -Format 'dd/MM/yyyy')"
    Body = "Synchronisation terminée avec succès.`nFichier: $DestinationPath`nTaille: $sourceSizeMB MB"
    SmtpServer = "smtp.votre-entreprise.com"
}

Send-MailMessage @emailParams
```

---

### Option 4: Surveillance Proactive

Créer un script de surveillance qui alerte si la synchronisation échoue:

**Créer `check-sync-health.ps1`:**
```powershell
$lastSyncFile = "backend\data\sap_export.xlsx"
$lastModified = (Get-Item $lastSyncFile).LastWriteTime
$hoursSinceSync = ((Get-Date) - $lastModified).TotalHours

if ($hoursSinceSync -gt 24) {
    Write-Host "⚠️ ALERTE: Fichier non synchronisé depuis $([math]::Round($hoursSinceSync, 1)) heures!"
    # Envoyer email d'alerte
}
```

**Exécuter quotidiennement à 10h00 pour vérifier que la sync de 7h30 a réussi**

---

## 📞 Support et Maintenance

### Checklist Mensuelle

- [ ] Vérifier les logs du mois écoulé
- [ ] Contrôler l'espace disque disponible
- [ ] Vérifier que les sauvegardes sont créées
- [ ] Tester manuellement une synchronisation
- [ ] Vérifier l'accès au serveur réseau

### Checklist en Cas de Problème

1. ✅ Consulter les logs dans `/logs/`
2. ✅ Tester l'accès au serveur: `Test-Path "\\SERVEUR\..."`
3. ✅ Vérifier l'état de la tâche planifiée
4. ✅ Tester manuellement: `.\sync-excel-file.ps1`
5. ✅ Consulter l'historique de la tâche dans le Planificateur

### Contact

Pour toute question ou problème:
- **Documentation:** Ce guide (GUIDE_SYNCHRONISATION_EXCEL.md)
- **Logs:** `C:\Users\DELL\Desktop\mssion\logs\`
- **Équipe IT:** Contacter le support technique

---

## ✅ Résumé Rapide

### Installation en 3 Étapes

```powershell
# 1. Ouvrir PowerShell en administrateur
# 2. Naviguer vers le projet
cd "C:\Users\DELL\Desktop\mssion"

# 3. Configurer
.\setup-scheduled-task.ps1
```

### Commandes Essentielles

```powershell
# Tester
Start-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP"

# Vérifier
Get-ScheduledTask -TaskName "Dashboard MG - Sync Excel SAP" | Get-ScheduledTaskInfo

# Logs
Get-Content "logs\sync-excel-$(Get-Date -Format 'yyyy-MM').log"

# Supprimer
.\setup-scheduled-task.ps1 -Remove
```

---

## 📚 Annexes

### Annexe A: Structure Complète des Fichiers

```
C:\Users\DELL\Desktop\mssion\
├── sync-excel-file.ps1                     ← Script de synchronisation
├── setup-scheduled-task.ps1                ← Configuration tâche planifiée
├── GUIDE_SYNCHRONISATION_EXCEL.md          ← Ce guide
├── backend\
│   ├── data\
│   │   ├── sap_export.xlsx                 ← Fichier Excel synchronisé
│   │   └── backup\                         ← Sauvegardes automatiques
│   │       ├── sap_export_2025-12-03_07-30-15.xlsx
│   │       ├── sap_export_2025-12-02_07-30-12.xlsx
│   │       └── ... (7 dernières)
│   ├── cache\
│   │   └── data_cache.json                 ← Cache JSON (rafraîchi à 3h00)
│   └── cache-manager.js                    ← Gestionnaire de cache
└── logs\
    └── sync-excel-2025-12.log              ← Logs mensuels
```

### Annexe B: Codes de Sortie du Script

| Code | Signification |
|------|---------------|
| 0 | Succès (synchronisation effectuée ou non nécessaire) |
| 1 | Erreur (fichier introuvable, accès refusé, etc.) |

### Annexe C: Variables d'Environnement

Vous pouvez configurer ces variables d'environnement pour personnaliser le comportement:

```powershell
# Chemin source permanent
$env:SAP_EXCEL_SOURCE = "\\SERVEUR\Partage\sap_export.xlsx"

# Chemin destination personnalisé
$env:SAP_EXCEL_DEST = "C:\MonDossier\sap_export.xlsx"
```

---

**Document créé le:** 04/12/2025
**Version:** 1.0
**Auteur:** Dashboard Merlin Gerin - Équipe Développement
