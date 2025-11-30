# 🎯 Dashboard Qualité - Système de Gestion de Production

> Tableau de bord professionnel pour le suivi qualité et production des machines 850MS

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

---

## 🚀 Démarrage Ultra-Rapide (5 minutes)

### Prérequis
- ✅ **Node.js 16+** installé ([Télécharger](https://nodejs.org/))
- ✅ **Fichier Excel** SAP dans `server/data/`

### Installation & Lancement

**Windows :**
```cmd
cd server
npm install
node server.js
```

**Linux/Mac :**
```bash
cd server
npm install
node server.js
```

### Accès
1. Ouvrir navigateur : **http://localhost:3000**
2. Connexion : `admin` / `admin123`

✅ **C'est tout !** Le système est opérationnel.

---

## 📚 Documentation Complète

Documentation organisée par niveau de complexité :

| 📄 Document | 🎯 Pour qui ? | ⏱️ Temps |
|-------------|---------------|----------|
| **[00-GUIDE-RAPIDE](docs/00-GUIDE-RAPIDE.md)** | Tout le monde | 5 min |
| **[01-INSTALLATION](docs/01-INSTALLATION.md)** | Administrateur IT | 15 min |
| **[02-CONFIGURATION](docs/02-CONFIGURATION.md)** | Administrateur IT | 10 min |
| **[03-DEPLOIEMENT](docs/03-DEPLOIEMENT.md)** | Équipe IT | 30 min |
| **[04-UTILISATION](docs/04-UTILISATION.md)** | Utilisateurs finaux | 10 min |
| **[05-MAINTENANCE](docs/05-MAINTENANCE.md)** | Administrateur système | 15 min |
| **[FAQ](docs/FAQ.md)** | Tout le monde | - |

---

## 📊 Fonctionnalités Principales

### ✅ Analyse de Production
- Suivi des quantités produites par machine 850MS
- Graphiques de performance par îlot (PM1, PM2, BZ1, BZ2, GRM)
- Calcul automatique du chiffre d'affaires
- Filtrage par date et machine

### ✅ Analyse des Rebuts
- Suivi des quantités rebutées avec coûts associés
- Classification par motif (dimension, apparence, fonction, matière)
- Top machines à problèmes
- Analyse par îlot de production

### ✅ Gestion Documentaire
- Upload de documents qualité par machine
- Documents de formation professionnelle
- Stockage permanent en base de données
- Recherche et filtrage avancés

### ✅ Fiches Étoile
- Création de fiches de non-conformité
- Suivi des actions correctives
- Délais de résolution
- Historique complet

### ✅ Tableau de Bord Temps Réel
- Actualisation automatique toutes les 5 minutes
- Lecture directe du fichier Excel SAP
- Indicateurs clés de performance (KPI)
- Interface responsive (PC, tablette, mobile)

---

## 🏗️ Architecture Technique

```
┌─────────────────┐
│  Fichier Excel  │  (Source de données SAP)
│   SAP Export    │
└────────┬────────┘
         │ Lecture toutes les 5 min
         ▼
┌─────────────────┐
│   Node.js API   │  (Backend - Port 3000)
│   + SQLite DB   │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Interface Web  │  (Frontend - HTML/CSS/JS)
│   Dashboard     │
└─────────────────┘
```

### Technologies Utilisées
- **Backend** : Node.js, Express.js
- **Base de données** : SQLite (embarquée, sans installation)
- **Frontend** : HTML5, CSS3, JavaScript Vanilla, Bootstrap 5
- **Graphiques** : Chart.js
- **Excel** : XLSX.js (lecture fichiers Excel)

---

## 📁 Structure du Projet

```
dashboard-qualite/
│
├── 📄 README.md                    # ← Vous êtes ici
├── 📄 index.html                   # Page principale
├── 📄 login.html                   # Page de connexion
│
├── 📁 docs/                        # Documentation complète
│   ├── 00-GUIDE-RAPIDE.md
│   ├── 01-INSTALLATION.md
│   ├── 02-CONFIGURATION.md
│   ├── 03-DEPLOIEMENT.md
│   ├── 04-UTILISATION.md
│   ├── 05-MAINTENANCE.md
│   └── FAQ.md
│
├── 📁 server/                      # Backend (Node.js)
│   ├── server.js                   # Serveur principal
│   ├── database.js                 # Gestion SQLite
│   ├── package.json
│   ├── data/                       # Fichier Excel source
│   └── database/                   # Base de données (auto-créée)
│
├── 📁 src/                         # Frontend (Application web)
│   ├── app.js                      # Point d'entrée
│   ├── core/                       # Modules essentiels
│   ├── modules/                    # Fonctionnalités
│   └── ui/                         # Interface utilisateur
│
├── 📁 assets/                      # Ressources statiques
│   ├── css/                        # Styles
│   ├── images/                     # Images
│   ├── documents/                  # Documents uploadés
│   └── training/                   # Documents formation
│
└── 📁 scripts/                     # Scripts utilitaires
    ├── start.bat                   # Démarrage Windows
    ├── start.sh                    # Démarrage Linux
    └── backup.sh                   # Sauvegarde auto
```

---

## 🔧 Configuration Rapide

### 1. Emplacement du Fichier Excel

**Éditer `server/server.js` ligne 20 :**

```javascript
// DÉVELOPPEMENT (fichier local)
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// PRODUCTION (serveur réseau)
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\sap_export.xlsx';
```

### 2. Port du Serveur

**Éditer `server/server.js` ligne 10 :**

```javascript
const PORT = 3000;  // Modifier si nécessaire (ex: 80, 8080)
```

### 3. Actualisation Automatique

**Éditer `src/modules/data-connector.js` ligne 7 :**

```javascript
refreshInterval: 300000  // 5 minutes (en millisecondes)
```

---

## 📋 Colonnes Excel Requises

Le fichier Excel SAP doit contenir ces colonnes (noms flexibles) :

| Colonne | Noms acceptés | Exemple |
|---------|---------------|---------|
| **Machine** | WORKCENTER, machine | 850MS085 |
| **Date** | date, confirmation date | 2025-01-26 |
| **Matériel** | material, matériel | MAT-001 |
| **Description** | description, designation | COMPONENT XYZ |
| **Quantité rebut** | quantity, qte scrap, quantité | 150 |
| **Quantité production** | QTE PROD APP, production quantity | 5000 |
| **Prix unitaire** | prix unit, unit price, PRIX UNIT | 0.12 |

---

## 🚀 Déploiement en Production

### Serveur de l'Entreprise

1. **Installer Node.js** sur le serveur
2. **Copier le projet** dans `/var/www/dashboard-qualite/` (ou `C:\inetpub\`)
3. **Configurer le chemin Excel** (voir Configuration)
4. **Installer les dépendances** : `npm install`
5. **Démarrer en mode service** :

**Windows (PM2) :**
```cmd
npm install -g pm2
pm2 start server/server.js --name dashboard-qualite
pm2 startup
pm2 save
```

**Linux (systemd) :**
```bash
sudo systemctl enable dashboard-qualite
sudo systemctl start dashboard-qualite
```

📖 **Guide complet** : [docs/03-DEPLOIEMENT.md](docs/03-DEPLOIEMENT.md)

---

## 🔐 Sécurité

### Authentification
- Login requis pour modification
- Rôles : Admin / Utilisateur
- Configuration dans `src/core/auth.js`

### Données
- Base SQLite chiffrée (optionnel)
- Sauvegarde automatique recommandée
- Fichiers uploadés isolés

---

## 🆘 Support & Dépannage

### Problèmes Courants

**Le serveur ne démarre pas**
```bash
# Vérifier Node.js
node --version

# Vérifier le port
netstat -ano | findstr :3000
```

**Fichier Excel non trouvé**
- Vérifier le chemin dans `server/server.js` ligne 20
- Vérifier les permissions de lecture

**Données non affichées**
- Ouvrir console navigateur (F12)
- Vérifier les logs serveur
- Consulter [docs/FAQ.md](docs/FAQ.md)

### Logs

```bash
# Voir les logs en temps réel
pm2 logs dashboard-qualite

# Logs serveur Windows
# Event Viewer > Application Logs
```

---

## 📞 Contact & Contribution

- 📖 **Documentation** : `docs/`
- ❓ **FAQ** : [docs/FAQ.md](docs/FAQ.md)
- 🐛 **Bugs** : Créer un ticket
- 💡 **Suggestions** : Contacter l'équipe IT

---

## 📝 License

Proprietary - © 2025 Votre Entreprise

---

## 🎯 Prochaines Étapes

1. ✅ **Lire** ce README
2. ✅ **Suivre** [docs/00-GUIDE-RAPIDE.md](docs/00-GUIDE-RAPIDE.md)
3. ✅ **Configurer** le fichier Excel
4. ✅ **Tester** en local
5. ✅ **Déployer** en production

**Bon succès avec votre Dashboard Qualité ! 🚀**
