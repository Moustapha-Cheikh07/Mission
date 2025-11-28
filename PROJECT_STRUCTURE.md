# 🏗️ Structure du Projet - Dashboard Qualité Merlin Gerin

Ce document décrit l'organisation complète du projet après restructuration.

## 📊 Vue d'ensemble

Le projet est maintenant organisé en **4 zones principales** :

1. **Racine** : Fichiers essentiels (HTML, README, config)
2. **assets/** : Ressources statiques (CSS, JS, images)
3. **src/** : Code source de l'application
4. **docs/** : Documentation complète et organisée

---

## 📁 Arborescence Complète

```
Mission-Project/
│
├── 📄 index.html                      # Page principale de l'application
├── 📄 login.html                      # Page de connexion
├── 📄 README.md                       # Documentation principale
├── 📄 PROJECT_STRUCTURE.md            # Ce fichier (structure du projet)
├── 📄 .gitignore                      # Fichiers à ignorer par Git
│
├── 📁 assets/                         # Ressources statiques
│   │
│   ├── 📁 css/                        # Feuilles de style CSS
│   │   ├── main.css                   # Styles de base et variables
│   │   ├── components.css             # Styles des composants UI
│   │   └── responsive.css             # Styles responsive (mobile/tablet)
│   │
│   ├── 📁 js/                         # Scripts JavaScript standalone
│   │   └── data.js                    # Données de démonstration
│   │
│   └── 📁 images/                     # Images et logos
│       └── merlin-gerin-logo.png      # Logo de l'entreprise
│
├── 📁 src/                            # Code source de l'application
│   │
│   ├── 📄 app.js                      # Point d'entrée et initialisation
│   │
│   ├── 📁 config/                     # Configuration
│   │   ├── .env.example               # Exemple de variables d'environnement
│   │   └── google-sheets-config.example.js  # Config Google Sheets
│   │
│   ├── 📁 core/                       # Modules centraux
│   │   ├── auth.js                    # Système d'authentification
│   │   ├── data-manager.js            # Gestion centralisée des données
│   │   └── utils.js                   # Fonctions utilitaires
│   │
│   ├── 📁 modules/                    # Modules fonctionnels
│   │   ├── navigation.js              # Gestion de la navigation
│   │   ├── chart.js                   # Graphiques (Canvas API)
│   │   ├── results.js                 # Résultats qualité
│   │   ├── documents.js               # Dossiers qualité
│   │   ├── forms.js                   # Formulaires
│   │   ├── activity.js                # Activités récentes
│   │   ├── training.js                # Formation professionnelle
│   │   ├── rejects.js                 # Analyse des rebuts
│   │   ├── fiche-etoile.js            # Fiches étoiles
│   │   └── google-sheets.js           # Intégration Google Sheets
│   │
│   └── 📁 ui/                         # Gestion de l'interface
│       ├── ui-manager.js              # Gestion UI globale
│       └── auth-ui.js                 # Interface d'authentification
│
└── 📁 docs/                           # Documentation complète
    │
    ├── 📄 README.md                   # Index de la documentation
    │
    ├── 📁 setup/                      # Guides d'installation et configuration
    │   ├── LIRE_MOI_EN_PREMIER.md     # Guide de démarrage ultra-rapide
    │   ├── DEMARRAGE_RAPIDE.md        # Configuration en 3 étapes
    │   ├── CREER_CLE_API.md           # Créer une clé API Google
    │   ├── TEST_CONNEXION.md          # Tester la connexion Google Sheets
    │   ├── CONFIGURATION_PERSONNALISEE.md     # Configuration avancée
    │   ├── GOOGLE_SHEETS_INTEGRATION.md       # Guide Google Sheets
    │   └── INTEGRATION_COMPLETE.md            # Intégration complète
    │
    ├── 📁 guides/                     # Guides d'utilisation
    │   ├── ACTUALISATION_8H.md        # Actualisation automatique à 8h
    │   ├── COLONNES_GOOGLE_SHEETS.md  # Format des colonnes
    │   ├── FILTRAGE_AUTOMATIQUE.md    # Utiliser les filtres
    │   ├── CORRECTION_VIRGULE_PRIX.md # Correction des prix
    │   ├── CORRECTIONS_REBUTS.md      # Corrections techniques
    │   ├── EXCEL_IMPORT_GUIDE.md      # Importer depuis Excel
    │   ├── GUIDE_DONNEES.md           # Guide des données
    │   ├── GUIDE_FORMATION_PROFESSIONNELLE.md  # Module formation
    │   └── GUIDE_NOUVELLES_FONCTIONNALITES.md  # Nouvelles fonctionnalités
    │
    ├── 📁 architecture/               # Documentation technique
    │   ├── ARCHITECTURE.md            # Architecture du projet
    │   └── RESTRUCTURATION.md         # Guide de restructuration
    │
    └── 📁 changelog/                  # Historique des modifications
        └── CHANGELOG_DOCUMENTS.md     # Journal des changements
```

---

## 🎯 Principes d'Organisation

### 1. Séparation des Responsabilités
- **assets/** : Tout ce qui est statique et ne contient pas de logique
- **src/** : Code JavaScript organisé par responsabilité
- **docs/** : Documentation séparée du code source

### 2. Hiérarchie Claire
- **Racine** : Seulement les fichiers essentiels (4 fichiers)
- **Sous-dossiers** : Regroupement logique par type/fonction
- **Nomenclature** : Noms clairs et explicites

### 3. Facilité de Navigation
- `README.md` principal à la racine
- `docs/README.md` comme index de la documentation
- Structure à maximum 3 niveaux de profondeur

---

## 📝 Conventions de Nommage

### Fichiers CSS
- `main.css` : Styles de base, variables CSS
- `components.css` : Styles des composants
- `responsive.css` : Media queries et responsive

### Fichiers JavaScript
- **Modules** : Nom au singulier (`chart.js`, `form.js`)
- **Managers** : Suffixe `-manager` (`data-manager.js`, `ui-manager.js`)
- **UI** : Suffixe `-ui` pour les fichiers d'interface (`auth-ui.js`)

### Documentation
- **ALL_CAPS** : Pour les fichiers MD (`README.md`, `ARCHITECTURE.md`)
- **Préfixes** : `GUIDE_` pour les guides utilisateur

---

## 🔍 Où Trouver Quoi ?

### Je veux...

#### Modifier les styles
→ `assets/css/`

#### Ajouter une nouvelle fonctionnalité
→ Créer un nouveau module dans `src/modules/`
→ Lire `docs/architecture/ARCHITECTURE.md`

#### Comprendre l'authentification
→ `src/core/auth.js` et `src/ui/auth-ui.js`

#### Modifier la connexion Google Sheets
→ `src/modules/google-sheets.js`
→ Config dans `src/config/`

#### Ajouter des données de démo
→ `assets/js/data.js`

#### Documenter une nouvelle fonctionnalité
→ `docs/guides/` pour les guides utilisateur
→ `docs/architecture/` pour la doc technique

---

## 🔐 Fichiers Sensibles

Les fichiers suivants sont ignorés par Git (voir `.gitignore`) :

```
src/config/.env                    # Variables d'environnement
src/config/google-sheets-config.js # Configuration Google Sheets
```

**Important** : Utilisez les fichiers `.example` comme modèles !

---

## 🚀 Pour Bien Démarrer

1. **Lire la documentation** : Commencez par `docs/README.md`
2. **Comprendre l'architecture** : Lisez `docs/architecture/ARCHITECTURE.md`
3. **Explorer le code** : Commencez par `src/app.js`
4. **Suivre les conventions** : Respectez la structure établie

---

## 📊 Statistiques

- **Total fichiers** : ~50 fichiers
- **Code source** : 15 modules JavaScript
- **Styles** : 3 fichiers CSS
- **Documentation** : 20 fichiers MD organisés
- **Pages HTML** : 2 pages (index + login)

---

## ✅ Avantages de Cette Structure

1. **Clarté** : Chaque fichier a sa place logique
2. **Maintenabilité** : Facile à modifier et étendre
3. **Scalabilité** : Peut grandir sans devenir chaotique
4. **Documentation** : Bien organisée et accessible
5. **Collaboration** : Facile pour une nouvelle personne de comprendre
6. **Professionnelle** : Suit les standards de l'industrie

---

## 🔄 Changements par Rapport à l'Ancienne Structure

### Ce qui a changé :
1. **assets/styles/** → **assets/css/** (convention standard)
2. **data.js** (racine) → **assets/js/data.js** (mieux organisé)
3. **12 fichiers MD** (racine) → **docs/** organisé en catégories
4. Ajout de **docs/README.md** comme index
5. Ajout de **src/config/.env.example** pour la sécurité
6. **Racine nettoyée** : 12 fichiers → 4 fichiers essentiels

### Ce qui n'a PAS changé :
- Aucune modification du code JavaScript
- Aucune modification des fonctionnalités
- Structure de `src/` préservée (déjà bien organisée)
- Tous les fichiers sont conservés (juste déplacés)

---

## 📌 Notes pour les Développeurs

### Ajout d'un nouveau module
1. Créer le fichier dans `src/modules/`
2. Suivre le pattern des modules existants
3. Documenter dans `docs/architecture/ARCHITECTURE.md`

### Ajout de documentation
1. **Guide utilisateur** → `docs/guides/`
2. **Guide installation** → `docs/setup/`
3. **Doc technique** → `docs/architecture/`
4. **Mise à jour** → `docs/changelog/`

### Modification des styles
1. **Variables et base** → `assets/css/main.css`
2. **Composants** → `assets/css/components.css`
3. **Responsive** → `assets/css/responsive.css`

---

**Dernière mise à jour** : 21 Novembre 2025
**Version** : 2.0 - Restructuration complète

**Auteur** : Équipe Dashboard Qualité Merlin Gerin
