# 🏗️ Architecture du Projet - Dashboard Qualité Merlin Gerin

Ce document explique l'architecture du projet et la structure des dossiers pour faciliter la compréhension et la maintenance du code.

## 📁 Structure du Projet

```
Mission-Project/
│
├── index.html                    # Page principale de l'application
├── login.html                    # Page de connexion
├── README.md                     # Documentation utilisateur
├── ARCHITECTURE.md               # Ce fichier - Guide de l'architecture
├── TODO.md                       # Liste des tâches et améliorations
│
├── docs/                         # 📚 Documentation projet
│   ├── GUIDE_DONNEES.md
│   ├── GUIDE_FORMATION_PROFESSIONNELLE.md
│   └── GUIDE_NOUVELLES_FONCTIONNALITES.md
│
├── assets/                       # 🎨 Ressources statiques
│   ├── images/                   # Images et logos
│   │   └── merlin-gerin-logo.png
│   └── styles/                   # Fichiers CSS modulaires
│       ├── main.css             # Variables CSS, reset, layout de base
│       ├── components.css       # Styles des composants UI
│       └── responsive.css       # Media queries et responsive design
│
└── src/                          # 💻 Code source JavaScript
    ├── core/                     # ⚙️ Modules centraux
    │   ├── auth.js              # Système d'authentification
    │   ├── data-manager.js      # Gestion des données (localStorage)
    │   └── utils.js             # Fonctions utilitaires réutilisables
    │
    ├── modules/                  # 📦 Modules fonctionnels métier
    │   ├── chart.js             # Graphiques de conformité (Canvas)
    │   ├── navigation.js        # Gestion de la navigation entre sections
    │   ├── results.js           # Affichage et filtrage des résultats qualité
    │   ├── documents.js         # Gestion des dossiers qualité
    │   ├── forms.js             # Formulaires (contrôle qualité, rebuts)
    │   ├── activity.js          # Activités récentes en temps réel
    │   └── training.js          # Gestion des documents de formation
    │
    ├── ui/                       # 🎨 Composants d'interface utilisateur
    │   ├── ui-manager.js        # Gestionnaire UI global (toasts, dates, stats)
    │   └── auth-ui.js           # Interface d'authentification
    │
    └── app.js                    # 🚀 Point d'entrée - Initialisation de l'app
```

## 🎯 Principes de l'Architecture

### 1. **Séparation des Préoccupations**
Le code est organisé en trois catégories distinctes :
- **Core** : Logique centrale et fondamentale
- **Modules** : Fonctionnalités métier spécifiques
- **UI** : Gestion de l'interface utilisateur

### 2. **Modularité**
Chaque fichier a une responsabilité unique et bien définie, ce qui facilite :
- La maintenance
- Le débogage
- Les tests
- La réutilisation du code

### 3. **Clarté et Lisibilité**
- Noms de fichiers descriptifs
- Organisation logique des dossiers
- Commentaires explicatifs dans le code

## 📚 Description des Modules

### Core (Modules Centraux)

#### `auth.js`
**Responsabilité** : Gestion complète de l'authentification
- Hashage des mots de passe
- Login/Logout des utilisateurs
- Vérification des sessions
- Gestion des rôles (admin/user)

**Fonctions principales** :
```javascript
SimpleAuth.login(username, password)
SimpleAuth.logout()
SimpleAuth.isLoggedIn()
SimpleAuth.getCurrentUser()
SimpleAuth.isAdmin()
```

#### `data-manager.js`
**Responsabilité** : Gestion centralisée des données via localStorage
- CRUD des résultats qualité
- CRUD des documents
- CRUD des activités
- CRUD des documents de formation
- Calcul des statistiques

**Fonctions principales** :
```javascript
DataManager.init()
DataManager.getResults()
DataManager.addResult(data)
DataManager.getStats()
DataManager.getTrainingDocuments()
```

#### `utils.js`
**Responsabilité** : Fonctions utilitaires réutilisables
- Debounce pour optimisation des performances
- Formatage des dates (locale française)
- Calcul de plages de dates
- Filtrage par période

**Fonctions principales** :
```javascript
Utils.debounce(func, wait)
Utils.formatDate(dateString)
Utils.getDateRange(period)
Utils.filterByPeriod(results, period)
```

### Modules (Fonctionnalités Métier)

#### `chart.js`
**Responsabilité** : Graphiques de conformité interactifs
- Dessin de graphiques sur Canvas
- Interactions utilisateur (hover, click)
- Filtrage des données
- Tooltips et légendes

**Module principal** : `ChartModule`

#### `navigation.js`
**Responsabilité** : Navigation entre sections de l'application
- Gestion des liens de navigation
- Affichage/masquage des sections
- Actions rapides du dashboard

**Module principal** : `NavigationModule`

#### `results.js`
**Responsabilité** : Affichage des résultats qualité
- Génération du tableau de résultats
- Filtres synchronisés (période, ligne, statut)
- Résumé des filtres actifs

**Module principal** : `ResultsModule`

#### `documents.js`
**Responsabilité** : Gestion des dossiers qualité
- Affichage en grille des documents
- Recherche de documents
- Ouverture de documents

**Module principal** : `DocumentsModule`

#### `forms.js`
**Responsabilité** : Formulaires de saisie
- Formulaire de contrôle qualité
- Formulaire de déclaration de rebut
- Validation des données
- Vérification d'authentification

**Module principal** : `FormsModule`

#### `activity.js`
**Responsabilité** : Activités récentes
- Affichage des activités en temps réel
- Calcul de temps relatifs ("Il y a 2 heures")
- Ajout d'activités

**Module principal** : `ActivityModule`

#### `training.js`
**Responsabilité** : Gestion complète de la formation
- Upload de documents (PDF, PPT, PPTX)
- Visualisation de documents
- Téléchargement
- Suppression (admin uniquement)

**Module principal** : `TrainingDocumentsModule`

### UI (Interface Utilisateur)

#### `ui-manager.js`
**Responsabilité** : Gestion globale de l'interface
- Affichage des toasts (notifications)
- Mise à jour de la date
- Mise à jour des statistiques du dashboard
- Dialogues de confirmation

**Module principal** : `UIModule`

#### `auth-ui.js`
**Responsabilité** : Interface d'authentification
- Bouton de connexion/déconnexion
- Affichage du nom d'utilisateur
- Mise à jour de l'UI selon l'état de connexion

**Module principal** : `AuthModule`

### Application

#### `app.js`
**Responsabilité** : Point d'entrée et initialisation
- Initialisation de tous les modules dans le bon ordre
- Configuration de l'event listener DOMContentLoaded
- Orchestration générale de l'application

## 🔄 Flux d'Initialisation

```
1. DOM chargé (DOMContentLoaded)
   ↓
2. DataManager.init()          # Charge les données
   ↓
3. AuthModule.init()           # Configure l'authentification
   ↓
4. NavigationModule.init()     # Configure la navigation
   ↓
5. UIModule.updateDateDisplay() # Affiche la date
   ↓
6. UIModule.updateStats()       # Calcule les stats
   ↓
7. ActivityModule.init()        # Charge les activités
   ↓
8. ResultsModule.init()         # Configure les résultats
   ↓
9. DocumentsModule.init()       # Charge les documents
   ↓
10. FormsModule.init()          # Configure les formulaires
   ↓
11. TrainingDocumentsModule.init() # Configure la formation
   ↓
12. ChartModule.init()          # Dessine le graphique
```

## 🎨 Organisation des Styles

### `main.css`
- Variables CSS (couleurs, ombres, etc.)
- Reset CSS
- Styles de base (body, typographie)
- Layout général (sidebar, main-content)

### `components.css`
- Tous les composants réutilisables :
  - Cards (stat-card, document-card, etc.)
  - Boutons (action-btn, submit-btn, etc.)
  - Formulaires (form-group, inputs, etc.)
  - Modales
  - Tableaux
  - Badges et labels

### `responsive.css`
- Media queries pour mobile/tablet
- Adaptations responsive de tous les composants

## 📋 Bonnes Pratiques

### Pour Ajouter une Nouvelle Fonctionnalité

1. **Identifiez la catégorie** : Core, Module ou UI ?
2. **Créez un nouveau fichier** dans le bon dossier
3. **Suivez la convention de nommage** : kebab-case pour les fichiers
4. **Documentez le module** avec des commentaires clairs
5. **Ajoutez le script** dans `index.html` dans le bon ordre
6. **Initialisez le module** dans `app.js`

### Pour Modifier du Code Existant

1. **Localisez le bon fichier** grâce à cette documentation
2. **Comprenez les dépendances** du module
3. **Testez les changements** dans le contexte global
4. **Mettez à jour** cette documentation si nécessaire

### Convention de Nommage

- **Fichiers** : kebab-case (`data-manager.js`, `auth-ui.js`)
- **Modules/Objects** : PascalCase (`DataManager`, `AuthModule`)
- **Fonctions** : camelCase (`getResults`, `formatDate`)
- **Variables** : camelCase (`currentUser`, `isLoggedIn`)

## 🔧 Dépendances Externes

- **Font Awesome 6.4.0** : Icônes (CDN)
- Aucune autre dépendance - Application 100% Vanilla JavaScript

## 🚀 Pour Démarrer

1. Ouvrez `index.html` dans un navigateur moderne
2. L'application charge tous les modules automatiquement
3. Les données sont stockées dans le localStorage du navigateur

## 📞 Support et Questions

Pour toute question sur l'architecture :
1. Consultez d'abord ce document
2. Lisez les commentaires dans le code
3. Référez-vous aux guides dans le dossier `docs/`

---

**Version** : 2.0
**Dernière mise à jour** : Novembre 2025
**Auteur** : Équipe Merlin Gerin
