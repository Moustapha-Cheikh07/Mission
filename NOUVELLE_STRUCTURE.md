# 📁 Nouvelle Structure du Projet - Dashboard Qualité

## 🎯 Objectif
Réorganiser le projet pour qu'il soit **simple, clair et facile à comprendre** pour n'importe qui.

---

## 📂 Structure Proposée

```
dashboard-qualite/
│
├── 📄 README.md                          # Guide principal - LIRE EN PREMIER
├── 📄 CHANGELOG.md                       # Historique des modifications
│
├── 📁 docs/                              # 📚 TOUTE LA DOCUMENTATION
│   ├── 📄 00-GUIDE-RAPIDE.md            # Guide ultra-rapide (5 min)
│   ├── 📄 01-INSTALLATION.md            # Installation pas à pas
│   ├── 📄 02-CONFIGURATION.md           # Configuration du fichier Excel
│   ├── 📄 03-DEPLOIEMENT.md             # Déploiement en production
│   ├── 📄 04-UTILISATION.md             # Guide utilisateur
│   ├── 📄 05-MAINTENANCE.md             # Sauvegarde et maintenance
│   ├── 📄 FAQ.md                        # Questions fréquentes
│   └── 📁 images/                       # Screenshots et diagrammes
│       ├── architecture.png
│       ├── ecran-principal.png
│       └── flux-donnees.png
│
├── 📁 server/                            # ⚙️ SERVEUR (BACKEND)
│   ├── 📄 README.md                     # Documentation serveur
│   ├── 📄 server.js                     # Point d'entrée principal
│   ├── 📄 database.js                   # Gestion base de données
│   ├── 📄 package.json                  # Dépendances Node.js
│   │
│   ├── 📁 config/                       # Configuration serveur
│   │   └── 📄 server-config.js         # Paramètres du serveur
│   │
│   ├── 📁 database/                     # Base de données SQLite
│   │   ├── 📄 dashboard.db             # Base de données (auto-créée)
│   │   └── 📄 .gitkeep
│   │
│   ├── 📁 data/                         # Données sources
│   │   ├── 📄 sap_export.xlsx          # Fichier Excel (dev)
│   │   └── 📄 README.md                # Instructions fichier Excel
│   │
│   └── 📁 uploads/                      # Fichiers uploadés (auto-créé)
│
├── 📁 src/                               # 💻 APPLICATION (FRONTEND)
│   ├── 📄 app.js                        # Point d'entrée application
│   │
│   ├── 📁 core/                         # Fonctions essentielles
│   │   ├── 📄 auth.js                  # Authentification
│   │   ├── 📄 data-manager.js          # Gestion des données
│   │   └── 📄 utils.js                 # Utilitaires
│   │
│   ├── 📁 modules/                      # Modules fonctionnels
│   │   ├── 📄 data-connector.js        # Connexion serveur
│   │   ├── 📄 server-sync.js           # Synchronisation DB
│   │   ├── 📄 production.js            # Analyse production
│   │   ├── 📄 rejects.js               # Analyse rebuts
│   │   ├── 📄 documents.js             # Gestion documents
│   │   ├── 📄 training.js              # Formation
│   │   ├── 📄 fiche-etoile.js          # Fiches étoile
│   │   └── 📄 chart.js                 # Graphiques
│   │
│   ├── 📁 ui/                           # Interface utilisateur
│   │   ├── 📄 ui-manager.js            # Gestionnaire UI
│   │   └── 📄 auth-ui.js               # UI authentification
│   │
│   └── 📁 config/                       # Configuration frontend
│       └── 📄 app-config.js            # Paramètres application
│
├── 📁 assets/                            # 🎨 RESSOURCES STATIQUES
│   ├── 📁 css/                          # Styles
│   │   └── 📄 style.css
│   │
│   ├── 📁 images/                       # Images
│   │   └── 📄 logo.png
│   │
│   ├── 📁 documents/                    # Documents qualité (uploads)
│   │   └── 📄 .gitkeep
│   │
│   └── 📁 training/                     # Documents formation (uploads)
│       └── 📄 .gitkeep
│
├── 📁 scripts/                           # 🛠️ SCRIPTS UTILITAIRES
│   ├── 📄 start.bat                     # Démarrage Windows
│   ├── 📄 start.sh                      # Démarrage Linux
│   ├── 📄 backup.sh                     # Sauvegarde automatique
│   └── 📄 install.bat                   # Installation auto
│
├── 📁 tests/                             # ✅ TESTS (optionnel)
│   └── 📄 test-api.js
│
├── 📄 index.html                         # Page principale
├── 📄 login.html                         # Page de connexion
├── 📄 .gitignore                         # Fichiers à ignorer
└── 📄 package.json                       # Dépendances projet
```

---

## 📝 Nouveaux Fichiers de Documentation

### 1. `README.md` (Racine) - Point d'entrée unique

```markdown
# 🎯 Dashboard Qualité - Système de Gestion de Production

> Tableau de bord professionnel pour le suivi qualité et production des machines 850MS

## 🚀 Démarrage Rapide (5 minutes)

1. **Installer Node.js** : https://nodejs.org/
2. **Ouvrir un terminal** dans le dossier du projet
3. **Lancer** : `npm run quick-start`
4. **Ouvrir** : http://localhost:3000

📖 **Guide complet** : Voir `docs/00-GUIDE-RAPIDE.md`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Guide Rapide](docs/00-GUIDE-RAPIDE.md) | Démarrage en 5 minutes |
| [Installation](docs/01-INSTALLATION.md) | Installation détaillée |
| [Configuration](docs/02-CONFIGURATION.md) | Configuration fichier Excel |
| [Déploiement](docs/03-DEPLOIEMENT.md) | Mise en production |
| [Utilisation](docs/04-UTILISATION.md) | Guide utilisateur |
| [FAQ](docs/FAQ.md) | Questions fréquentes |

## 🏗️ Architecture

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Node.js + Express
- **Base de données** : SQLite
- **Lecture Excel** : XLSX

## 📊 Fonctionnalités

✅ Analyse de production (machines 850MS)
✅ Suivi des rebuts
✅ Gestion documentaire
✅ Fiches étoile
✅ Formation professionnelle
✅ Stockage permanent (SQLite)

## 🆘 Support

- 📖 Documentation : `docs/`
- ❓ FAQ : `docs/FAQ.md`
- 🐛 Problèmes : Voir logs dans `server/logs/`
```

### 2. `docs/00-GUIDE-RAPIDE.md`

```markdown
# ⚡ Guide de Démarrage Ultra-Rapide

## Prérequis (1 minute)

✅ Node.js installé (vérifier : `node --version`)
✅ Fichier Excel dans `server/data/sap_export.xlsx`

## Installation (2 minutes)

### Windows
```cmd
cd server
npm install
node server.js
```

### Linux/Mac
```bash
cd server
npm install
node server.js
```

## Accès (1 minute)

1. Ouvrir navigateur
2. Aller sur : http://localhost:3000
3. Connexion : admin / admin123

## Vérification

✅ Console serveur affiche "Serveur démarré"
✅ Lignes Excel chargées > 0
✅ Interface accessible dans navigateur

## Problèmes ?

➡️ Voir `docs/FAQ.md`
```

### 3. `docs/02-CONFIGURATION.md`

```markdown
# ⚙️ Configuration du Fichier Excel

## 📍 Emplacement du fichier

### Développement Local
```
server/data/sap_export.xlsx
```

### Production (Serveur réseau)

**Éditer `server/server.js` ligne 20 :**

```javascript
// Développement (local)
// const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// Production (réseau Windows)
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\sap_export.xlsx';

// Production (UNC)
const EXCEL_FILE_PATH = '\\\\SERVEUR-SAP\\Exports\\sap_export.xlsx';

// Production (Linux)
const EXCEL_FILE_PATH = '/mnt/sap-exports/sap_export.xlsx';
```

## 📋 Format du fichier Excel

### Colonnes requises

| Colonne | Noms acceptés | Exemple |
|---------|---------------|---------|
| Machine | WORKCENTER, machine | 850MS085 |
| Date | date, confirmation date | 2025-01-26 |
| Matériel | material, matériel | MAT-001 |
| Quantité rebut | quantity, qte scrap | 150 |
| Quantité production | QTE PROD APP, production quantity | 5000 |
| Prix unitaire | prix unit, unit price | 0.12 |

### Exemple de données

| WORKCENTER | Date | Material | QTE SCRAP | QTE PROD APP | PRIX UNIT |
|------------|------|----------|-----------|--------------|-----------|
| 850MS085 | 2025-01-26 | MAT-001 | 150 | 5000 | 0.12 |
| 850MS122 | 2025-01-26 | MAT-002 | 200 | 8000 | 0.08 |

## 🔄 Actualisation

- **Automatique** : Toutes les 5 minutes
- **Manuelle** : Bouton "Rafraîchir" dans l'interface
- **Serveur** : Lit le fichier à chaque requête

## ✅ Vérification

```bash
# Vérifier que le fichier existe
ls server/data/sap_export.xlsx

# Tester la lecture
node -e "const xlsx = require('xlsx'); console.log(xlsx.readFile('server/data/sap_export.xlsx').SheetNames);"
```
```

---

## 🔄 Plan de Réorganisation

### Phase 1 : Nettoyage
```bash
# Créer dossier d'archive
mkdir -p docs/archive-ancien-systeme

# Déplacer anciens docs
mv docs/archive/* docs/archive-ancien-systeme/
mv docs/setup/* docs/archive-ancien-systeme/
```

### Phase 2 : Nouveaux docs
```bash
# Créer nouveaux fichiers
touch docs/00-GUIDE-RAPIDE.md
touch docs/01-INSTALLATION.md
touch docs/02-CONFIGURATION.md
touch docs/03-DEPLOIEMENT.md
touch docs/04-UTILISATION.md
touch docs/05-MAINTENANCE.md
touch docs/FAQ.md
```

### Phase 3 : Réorganisation code
```bash
# Créer structure config
mkdir -p src/config
mkdir -p server/config
```

### Phase 4 : Scripts utilitaires
```bash
mkdir -p scripts
```

---

## 📋 Checklist de Migration

- [ ] Créer nouveau README.md principal
- [ ] Créer docs/00-GUIDE-RAPIDE.md
- [ ] Créer docs/01-INSTALLATION.md
- [ ] Créer docs/02-CONFIGURATION.md
- [ ] Créer docs/03-DEPLOIEMENT.md
- [ ] Créer docs/04-UTILISATION.md
- [ ] Créer docs/FAQ.md
- [ ] Archiver anciens docs
- [ ] Créer scripts/start.bat
- [ ] Créer scripts/install.bat
- [ ] Ajouter .gitkeep dans dossiers vides
- [ ] Mettre à jour .gitignore

---

## 🎯 Bénéfices

✅ **Navigation intuitive** - Numérotation claire (00, 01, 02...)
✅ **Documentation progressive** - Du simple au complexe
✅ **Point d'entrée unique** - README.md principal
✅ **Séparation claire** - Backend/Frontend/Docs
✅ **Maintenance facile** - Structure logique
✅ **Onboarding rapide** - Nouveau dev comprend en 30 min

---

Voulez-vous que je procède à la réorganisation ?
