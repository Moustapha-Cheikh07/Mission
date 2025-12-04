# 🚀 Déploiement sur Serveur Local d'Entreprise

## 📋 Configuration de Déploiement

- **Serveur IP**: 10.192.14.223
- **Port**: 1880
- **Application**: Dashboard Qualité Merlin Gerin
- **Environnement**: Production

### ✅ Prérequis

- **Node.js 14+** installé sur le serveur
- **PM2** pour la gestion des processus
- **Accès administrateur** pour configuration réseau et pare-feu
- **Fichier Excel SAP** (`sap_export.xlsx`) accessible
- **IP fixe** 10.192.14.223 configurée sur le serveur

### 🎯 Déploiement en 3 Étapes

#### 1. Installation des Dépendances

```powershell
# Naviguer vers le dossier backend
cd backend

# Installer les dépendances
npm install
```

#### 2. Démarrage avec PM2 (Production)

```powershell
# Installer PM2 (une seule fois)
npm install -g pm2

# Retourner au dossier racine
cd ..

# Démarrer l'application
pm2 start ecosystem.config.js --env production

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

#### 3. Vérification

Ouvrez un navigateur et accédez à:
- **Local**: `http://localhost:1880`
- **Réseau**: `http://10.192.14.223:1880`

---

## 📁 Fichiers Importants

### Scripts de Déploiement

| Fichier | Description |
|---------|-------------|
| `deploy.ps1` | Script d'installation automatique |
| `backup.ps1` | Script de sauvegarde des données |
| `ecosystem.config.js` | Configuration PM2 (production) |

### Configuration à Modifier

> [!IMPORTANT]
> **Avant le déploiement**, modifiez le chemin du fichier Excel SAP

#### Mise à Jour du Chemin Excel

**Actuellement**, le système utilise le chemin par défaut: `sap_export.xlsx`

**Quand vous aurez le chemin réseau du fichier Excel**, mettez à jour:

**Fichier**: `.env.production`

```env
HOST=10.192.14.223
PORT=1880
EXCEL_FILE_PATH=\\chemin\reseau\vers\sap_export.xlsx
NODE_ENV=production
```

**Exemples de chemins possibles**:
```env
# Option 1: Chemin local
EXCEL_FILE_PATH=C:\Data\SAP\export_production.xlsx

# Option 2: Lecteur réseau (UNC)
EXCEL_FILE_PATH=\\SERVEUR-SAP\Partage\export_production.xlsx

# Option 3: Lecteur mappé
EXCEL_FILE_PATH=Z:\SAP\export_production.xlsx
```

Après modification, redémarrez l'application:
```powershell
pm2 restart dashboard-qualite
```

---

## 🌐 Configuration Réseau

### IP Fixe du Serveur

Le serveur est configuré pour écouter sur:
- **IP**: 10.192.14.223
- **Port**: 1880

### Pare-feu Windows

**Configuration manuelle du pare-feu**:
```powershell
New-NetFirewallRule -DisplayName "Dashboard Qualité - Port 1880" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 1880 `
    -Action Allow
```

**Vérification**:
```powershell
Get-NetFirewallRule -DisplayName "Dashboard Qualité - Port 1880"
```

**Test de connectivité depuis un autre poste**:
```powershell
Test-NetConnection -ComputerName 10.192.14.223 -Port 1880
```

---

## 🔧 Commandes Utiles

### Gestion PM2

```powershell
# Voir le statut
pm2 status

# Voir les logs en temps réel
pm2 logs dashboard-qualite

# Voir les dernières 100 lignes de logs
pm2 logs dashboard-qualite --lines 100

# Redémarrer l'application
pm2 restart dashboard-qualite

# Arrêter l'application
pm2 stop dashboard-qualite

# Supprimer du gestionnaire PM2
pm2 delete dashboard-qualite

# Informations détaillées
pm2 show dashboard-qualite

# Monitoring en temps réel
pm2 monit
```

### Sauvegarde

```powershell
# Sauvegarde manuelle
.\backup.ps1

# Sauvegarde vers un emplacement spécifique
.\backup.ps1 -BackupPath "D:\Backups\Dashboard"
```

### Rafraîchissement du Cache

```powershell
# Forcer le rafraîchissement du cache
Invoke-WebRequest -Uri "http://10.192.14.223:1880/api/cache/refresh" -Method POST
```

---

## 📅 Tâches Automatiques

L'application effectue automatiquement:

| Heure | Tâche | Description |
|-------|-------|-------------|
| **03:00** | Rafraîchissement cache principal | Lecture du fichier Excel SAP |
| **08:30** | Rafraîchissement caches îlots | Mise à jour des données par îlot |

---

## 🔍 Dépannage

### Le serveur ne démarre pas

```powershell
# Vérifier Node.js
node --version

# Vérifier les dépendances
cd backend
npm install

# Vérifier que le port n'est pas utilisé
netstat -ano | findstr :1880

# Tuer le processus si nécessaire
# taskkill /PID <PID> /F
```

### Impossible d'accéder depuis un autre poste

```powershell
# Vérifier la connectivité
Test-NetConnection -ComputerName 10.192.14.223 -Port 1880

# Vérifier le pare-feu
Get-NetFirewallRule -DisplayName "*Dashboard*"

# Vérifier que le serveur écoute sur la bonne IP
pm2 logs dashboard-qualite | Select-String "10.192.14.223"
```

### Données Excel non chargées

```powershell
# Vérifier le chemin du fichier dans .env.production
cat .env.production

# Tester l'accès au fichier Excel
Test-Path "sap_export.xlsx"

# Supprimer le cache et redémarrer
Remove-Item "backend\cache\*.json"
pm2 restart dashboard-qualite
```

### Les documents ne s'uploadent pas

```powershell
# Vérifier les permissions des dossiers
icacls frontend\assets\documents
icacls frontend\assets\training

# Vérifier l'espace disque
Get-PSDrive C

# Vérifier les logs pour les erreurs d'upload
pm2 logs dashboard-qualite --err
```

---

## 📞 Support et Diagnostic

### Logs à Collecter en Cas de Problème

```powershell
# Logs PM2
pm2 logs dashboard-qualite --lines 500 > logs-dashboard.txt

# Informations système
systeminfo > system-info.txt

# État PM2
pm2 status > pm2-status.txt

# Configuration réseau
ipconfig /all > network-config.txt
```

### Checklist de Diagnostic

- [ ] Node.js installé (version 14+)
- [ ] PM2 installé globalement
- [ ] Dépendances npm installées (backend)
- [ ] Fichier Excel SAP accessible
- [ ] Port 1880 ouvert dans le pare-feu
- [ ] IP 10.192.14.223 configurée et accessible
- [ ] Serveur écoute sur 10.192.14.223:1880
- [ ] Connectivité réseau testée depuis un autre poste
- [ ] Dossiers documents/ et training/ ont les bonnes permissions
- [ ] Application démarre avec PM2
- [ ] Logs ne montrent pas d'erreurs critiques

---

## ✅ Checklist de Déploiement

### Avant le Déploiement

- [ ] Serveur Windows avec IP fixe 10.192.14.223
- [ ] Node.js 14+ installé
- [ ] Fichiers du projet transférés sur le serveur
- [ ] Fichier Excel SAP `sap_export.xlsx` accessible
- [ ] Dossier `logs/` créé à la racine du projet

### Configuration

- [ ] Fichier `.env.production` créé avec les bonnes valeurs
- [ ] Chemin Excel dans `.env.production` (à mettre à jour quand disponible)
- [ ] Fichier `ecosystem.config.js` configuré
- [ ] Pare-feu Windows configuré pour le port 1880

### Installation

- [ ] Dépendances backend installées (`cd backend && npm install`)
- [ ] PM2 installé globalement (`npm install -g pm2`)
- [ ] Application démarrée avec PM2 (`pm2 start ecosystem.config.js --env production`)
- [ ] Démarrage automatique activé (`pm2 startup` puis `pm2 save`)

### Tests

- [ ] Application visible dans `pm2 status`
- [ ] Logs ne montrent pas d'erreurs (`pm2 logs dashboard-qualite`)
- [ ] Accès local testé: `http://localhost:1880`
- [ ] Accès réseau testé depuis un autre poste: `http://10.192.14.223:1880`
- [ ] Test upload d'un document dans Documents Qualité
- [ ] Test upload d'un document dans Formation
- [ ] Test création d'une fiche de non-conformité
- [ ] Vérification du chargement des données Excel

### Post-Déploiement

- [ ] Script de sauvegarde `backup.ps1` testé
- [ ] Monitoring des logs configuré
- [ ] Documentation distribuée aux utilisateurs
- [ ] Formation des utilisateurs effectuée

---

## 🌐 URLs de l'Application

Une fois déployée, l'application est accessible via:

### Pages Principales
- **Dashboard**: http://10.192.14.223:1880/dashboard.html
- **Formulaires**: http://10.192.14.223:1880/forms.html
- **Documents Qualité**: http://10.192.14.223:1880/documents.html
- **Formation**: http://10.192.14.223:1880/training.html

### Pages Îlots (Dashboards par Îlot)
- **Îlot PM1**: http://10.192.14.223:1880/ilots/pm1.html
- **Îlot PM2**: http://10.192.14.223:1880/ilots/pm2.html
- **Îlot BZ1**: http://10.192.14.223:1880/ilots/bz1.html
- **Îlot BZ2**: http://10.192.14.223:1880/ilots/bz2.html
- **Îlot GRM**: http://10.192.14.223:1880/ilots/grm.html

### API Endpoints
- **Données**: http://10.192.14.223:1880/api/data
- **Documents Qualité**: http://10.192.14.223:1880/api/documents/quality
- **Documents Formation**: http://10.192.14.223:1880/api/documents/training
- **Fiches Étoile**: http://10.192.14.223:1880/api/fiches-etoile
- **Références**: http://10.192.14.223:1880/api/references/850ms
- **Îlot PM1**: http://10.192.14.223:1880/api/ilot/PM1
- **Îlot PM2**: http://10.192.14.223:1880/api/ilot/PM2
- **Îlot BZ1**: http://10.192.14.223:1880/api/ilot/BZ1
- **Îlot BZ2**: http://10.192.14.223:1880/api/ilot/BZ2
- **Îlot GRM**: http://10.192.14.223:1880/api/ilot/GRM

---

## 📋 Structure de Déploiement

```
Serveur: 10.192.14.223
│
├── Application Dashboard Qualité (Port 1880)
│   ├── Backend (Node.js + Express)
│   │   ├── API REST
│   │   ├── Gestion fichiers Excel
│   │   ├── Upload documents
│   │   └── Cache des données
│   │
│   └── Frontend (HTML/CSS/JS)
│       ├── Dashboard analytique
│       ├── Formulaires de non-conformité
│       ├── Gestion documents qualité
│       └── Gestion documents formation
│
├── Données
│   ├── sap_export.xlsx (à configurer)
│   ├── Cache JSON (auto-généré)
│   └── Documents uploadés
│
└── PM2 (Gestionnaire de processus)
    ├── Redémarrage automatique
    ├── Logs centralisés
    └── Monitoring temps réel
```

---

**🎉 Félicitations ! Votre Dashboard Qualité est prêt pour le déploiement !**

Pour démarrer l'application sur le serveur:
```powershell
cd C:\chemin\vers\le\projet
pm2 start ecosystem.config.js --env production
pm2 save
```
