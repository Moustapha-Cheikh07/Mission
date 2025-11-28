# 📁 Structure du Projet - Dashboard Qualité Merlin Gerin

## 🎯 Vue d'ensemble

Le projet a été restructuré en **pages HTML séparées** pour améliorer la clarté et la maintenabilité du code.

---

## 📄 Pages Principales

### 1. **index.html** ⚡
- **Rôle** : Page d'accueil avec redirection automatique
- **Redirection** : Vers `dashboard.html`
- **Contenu** : Page de chargement avec spinner

### 2. **dashboard.html** 📊
- **Rôle** : Tableau de bord principal
- **Contenu** :
  - Actions rapides
  - Statut du serveur de données
  - Analyse des rebuts (graphiques + tableau)
  - Analyse de la production (graphiques + tableau)
  - Chiffre d'affaires par machine et par îlot
- **Modules JavaScript** : `rejects.js`, `production.js`, `chart.js`

### 3. **documents.html** 📁
- **Rôle** : Gestion des dossiers qualité
- **Contenu** :
  - Onglets par machine (850MS)
  - Upload de documents (admin)
  - Visualisation de documents (PDF, images, vidéos)
  - Recherche et filtrage
- **Modules JavaScript** : `documents.js`

### 4. **forms.html** 📝
- **Rôle** : Formulaires et fiches étoile
- **Contenu** :
  - Création de fiches étoile
  - Liste des fiches créées
  - Aperçu et impression
- **Modules JavaScript** : `fiche-etoile.js`, `forms.js`

### 5. **training.html** 🎓
- **Rôle** : Formation qualité
- **Contenu** :
  - Documents de formation
  - Catégories (bases, contrôles, procédures, normes)
  - Upload de ressources (admin)
- **Modules JavaScript** : `training.js`

### 6. **login.html** 🔐
- **Rôle** : Page de connexion
- **Contenu** : Formulaire d'authentification
- **Redirection** : Vers `dashboard.html` après connexion

---

## 🗂️ Structure des Dossiers

```
mssion/
│
├── index.html                  # Page d'accueil (redirection)
├── dashboard.html              # Tableau de bord
├── documents.html              # Dossiers qualité
├── forms.html                  # Formulaires
├── training.html               # Formation
├── login.html                  # Connexion
├── index_old.html              # ⚠️ Ancienne version (backup)
│
├── server/                     # Backend Node.js
│   ├── server.js               # Serveur Express
│   ├── database.js             # Gestion SQLite
│   ├── cache-manager.js        # Système de cache Excel → JSON
│   ├── data/                   # Fichiers Excel SAP
│   ├── cache/                  # Cache JSON (généré)
│   └── database/               # Base de données SQLite
│
├── src/                        # Frontend JavaScript
│   ├── core/                   # Fonctions essentielles
│   │   ├── auth.js             # Authentification
│   │   ├── data-manager.js     # Gestion des données
│   │   └── utils.js            # Utilitaires
│   │
│   ├── modules/                # Modules fonctionnels
│   │   ├── data-connector.js   # Connexion serveur
│   │   ├── production.js       # Analyse production
│   │   ├── rejects.js          # Analyse rebuts
│   │   ├── documents.js        # Gestion documents
│   │   ├── training.js         # Formation
│   │   ├── fiche-etoile.js     # Fiches étoile
│   │   ├── chart.js            # Graphiques
│   │   └── navigation.js       # Navigation
│   │
│   └── ui/                     # Interface utilisateur
│       ├── ui-manager.js       # Gestionnaire UI
│       └── auth-ui.js          # UI authentification
│
├── assets/                     # Ressources statiques
│   ├── css/                    # Styles
│   ├── images/                 # Images et logos
│   ├── documents/              # Documents qualité (uploads)
│   └── training/               # Documents formation (uploads)
│
└── docs/                       # Documentation

```

---

## 🔄 Navigation entre les Pages

### Sidebar (Barre latérale)
Présente sur toutes les pages avec les liens :
- **Tableau de bord** → `dashboard.html`
- **Dossiers Qualité** → `documents.html`
- **Formulaires** → `forms.html`
- **Formation** → `training.html`

### Highlights de navigation automatique
- La page active est **soulignée en vert** dans la sidebar
- Les boutons "Actions rapides" redirigent vers les pages correspondantes

---

## 🚀 Démarrage du Projet

### 1. Démarrer le serveur backend

```bash
cd server
node server.js
```

Le serveur démarre sur **http://localhost:3000**

### 2. Accéder à l'application

Ouvrir dans le navigateur :
```
http://localhost:3000
```

OU directement :
```
http://localhost:3000/dashboard.html
```

---

## 🔧 Modules JavaScript Chargés

Toutes les pages chargent les mêmes scripts (pour cohérence) :

### Scripts Core
- `auth.js` - Gestion authentification
- `data-manager.js` - Gestion des données
- `utils.js` - Fonctions utilitaires

### Scripts UI
- `ui-manager.js` - Gestionnaire d'interface
- `auth-ui.js` - UI authentification

### Scripts Modules
- `data-connector.js` - Connexion au serveur
- `rejects.js` - Analyse des rebuts
- `production.js` - Analyse de la production
- `documents.js` - Gestion documentaire
- `training.js` - Documents de formation
- `fiche-etoile.js` - Fiches étoile
- `chart.js` - Graphiques Chart.js
- `navigation.js` - Navigation (désactivée sur pages séparées)

### Script Principal
- `app.js` - Initialisation de l'application

---

## 📝 Avantages de la Structure Séparée

✅ **Clarté** : Chaque page a un rôle bien défini
✅ **Maintenabilité** : Plus facile de trouver et modifier le code
✅ **Performance** : Charge uniquement le contenu nécessaire
✅ **SEO** : URLs distinctes pour chaque section
✅ **Navigation** : URLs explicites (bookmarkables)
✅ **Débogage** : Plus facile d'identifier les problèmes

---

## ⚠️ Fichiers de Sauvegarde

- **index_old.html** : Ancienne version monolithique (backup de sécurité)
- **split_pages.py** : Script Python utilisé pour la séparation

---

## 🔐 Authentification

L'authentification fonctionne sur **toutes les pages** :
- Connexion via `login.html`
- Session stockée dans `localStorage`
- Boutons admin visibles uniquement si connecté

**Identifiants par défaut :**
- Username: `admin`
- Password: `admin123`

---

## 📊 Flux de Données

```
Excel SAP (server/data/sap_export.xlsx)
    ↓
Serveur Node.js (cache JSON à 3h du matin)
    ↓
API REST (/api/data)
    ↓
Frontend JavaScript (DataConnectorModule)
    ↓
Modules d'analyse (Production, Rebuts)
    ↓
Affichage (Graphiques Chart.js + Tableaux)
```

---

## 🛠️ Maintenance

### Ajouter une nouvelle page

1. Créer `nouvelle-page.html`
2. Copier l'en-tête et le footer depuis une page existante
3. Ajouter le contenu spécifique
4. Mettre à jour la navigation dans la sidebar
5. Charger les scripts JavaScript nécessaires

### Modifier une section existante

1. Ouvrir la page correspondante (`dashboard.html`, `documents.html`, etc.)
2. Modifier le HTML ou ajouter des scripts
3. Tester les changements dans le navigateur

---

## 📞 Support

Pour toute question sur la structure du projet, consulter :
- Ce fichier (`STRUCTURE.md`)
- L'ancien fichier complet (`index_old.html`)
- Le script de séparation (`split_pages.py`)

---

**Date de restructuration** : 2025-01-27
**Version** : 2.0 (Pages séparées)
