# Résumé du Projet - Dashboard Qualité Merlin Gerin

## 📊 Vue d'Ensemble

**Nom du Projet**: Dashboard Qualité - Merlin Gerin  
**Client**: Schneider Electric  
**Type**: Application Web de Gestion de la Qualité  
**Statut**: Production Ready  

## 🎯 Objectif

Créer un tableau de bord web permettant de visualiser et analyser les données de qualité (rebuts et production) de l'usine Merlin Gerin, en utilisant des exports Excel générés automatiquement par SAP.

### Problème Résolu

**Avant**: Utilisation de Google Sheets nécessitant une connexion Internet et un transfert manuel des données SAP.

**Après**: Solution 100% locale où les données SAP sont lues directement depuis un fichier Excel sur le réseau interne de l'entreprise.

## 🏗️ Architecture

### Stack Technique

**Frontend**:
- HTML5, CSS3, JavaScript Vanilla (ES6+)
- Bootstrap 5 (Interface)
- Chart.js (Graphiques)
- LocalStorage (Cache et authentification)

**Backend**:
- Node.js + Express
- Bibliothèque `xlsx` pour lire les fichiers Excel
- API REST simple (`/api/data`)

### Flux de Données

```
SAP (ERP) 
    ↓ (Export automatique)
Fichier Excel (.xlsx)
    ↓ (Lecture)
Serveur Node.js
    ↓ (API REST - JSON)
Dashboard Web (Navigateur)
```

## 📦 Fonctionnalités Principales

### 1. Analyse des Rebuts
- Visualisation des rebuts par machine, période, îlot
- Calcul automatique des coûts totaux
- Graphiques d'évolution temporelle
- Filtrage dynamique (date, machine, îlot)

### 2. Analyse de la Production
- Suivi de la production par machine (850MS*)
- Calcul du chiffre d'affaires
- Répartition par îlot (PM1, PM2, BZ1, BZ2, GRM)
- Graphiques de performance

### 3. Gestion Documentaire
- Upload et consultation de documents qualité par machine
- Catégorisation (contrôle, audit, procédure, etc.)
- Visualisation PDF/PPT intégrée

### 4. Formation
- Bibliothèque de documents de formation
- Catégorisation par thème
- Accès selon les rôles utilisateur

### 5. Formulaires
- Déclaration de produits défectueux (Fiche Étoile)
- Historique des fiches envoyées
- Recherche et filtrage

### 6. Authentification
- Système de connexion par rôle (Admin, Qualité, Opérateur)
- Gestion des permissions
- Stockage sécurisé dans localStorage

## 📁 Structure du Projet

```
mssion/
├── index.html                 # Page principale
├── login.html                 # Page de connexion
├── start.bat                  # Script de démarrage rapide
├── README.md                  # Documentation principale
├── PROJECT_STRUCTURE.md       # Structure détaillée
│
├── assets/                    # Ressources statiques
│   ├── css/                  # Styles
│   ├── images/               # Images et logos
│   ├── documents/            # Documents uploadés
│   └── training/             # Documents de formation
│
├── src/                       # Code source JavaScript
│   ├── core/                 # Modules fondamentaux
│   │   ├── auth.js          # Authentification
│   │   ├── data-manager.js  # Gestion des données
│   │   └── utils.js         # Utilitaires
│   ├── ui/                   # Interface utilisateur
│   ├── modules/              # Modules fonctionnels
│   │   ├── data-connector.js    # ⭐ Connexion serveur local
│   │   ├── rejects.js           # Analyse rebuts
│   │   ├── production.js        # Analyse production
│   │   ├── documents.js         # Gestion documents
│   │   ├── training.js          # Formation
│   │   └── [autres modules]
│   └── app.js                # Point d'entrée
│
├── server/                    # Backend Node.js
│   ├── server.js             # ⭐ Serveur Express
│   ├── package.json          # Dépendances
│   ├── create_mock_data.js   # Générateur de test
│   └── data/
│       └── sap_export.xlsx   # Fichier Excel SAP
│
└── docs/                      # Documentation
    ├── DEVELOPER_GUIDE.md    # Guide développeur
    ├── guides/               # Guides utilisateur
    ├── setup/                # Installation
    └── archive/              # Docs obsolètes
```

## 🔑 Fichiers Critiques

### Frontend
1. **`src/modules/data-connector.js`**: Remplace Google Sheets, gère la connexion au serveur local
2. **`src/modules/rejects.js`**: Logique d'analyse des rebuts
3. **`src/modules/production.js`**: Logique d'analyse de la production
4. **`src/app.js`**: Initialisation de l'application

### Backend
1. **`server/server.js`**: Serveur Express qui lit l'Excel et expose l'API
2. **`server/package.json`**: Dépendances (express, cors, xlsx)

## 🚀 Déploiement

### Prérequis
- Node.js (version LTS)
- Accès au fichier Excel SAP (réseau ou local)
- Navigateur moderne (Chrome, Edge, Firefox)

### Installation
1. Copier le projet sur le serveur
2. Installer Node.js
3. Configurer le chemin du fichier Excel dans `server/server.js`
4. Exécuter `npm install` dans le dossier `server/`
5. Lancer `node server.js`
6. Accéder via `http://[IP-SERVEUR]:3000`

### Configuration Importante
Dans `server/server.js`, ligne 15:
```javascript
const EXCEL_FILE_PATH = 'CHEMIN\\VERS\\FICHIER\\SAP.xlsx';
```

## 📊 Format des Données Excel

### Colonnes Requises
- **Date**: Date de confirmation
- **Machine**: Nom de la machine (ex: 850MS122)
- **Matériel**: Code matériel
- **Description**: Description du produit
- **Quantité**: Quantité de rebut
- **QTE PROD APP**: Quantité produite (pour l'analyse de production)
- **Prix unitaire**: Prix unitaire du produit
- **Raison**: Raison du rebut (dimension, aspect, fonction, matière, autre)
- **Opérateur**: Nom de l'opérateur

## 🔐 Sécurité

- Pas de connexion Internet requise (tout en local)
- Authentification par localStorage (côté client)
- Données sensibles restent sur le réseau interne
- Pas de base de données externe

## 📈 Statistiques du Projet

- **Lignes de code**: ~15,000 lignes
- **Modules JavaScript**: 12 modules principaux
- **Pages HTML**: 2 (index, login)
- **Dépendances npm**: 3 (express, cors, xlsx)
- **Compatibilité navigateur**: Chrome, Edge, Firefox

## 🛠️ Maintenance

### Tâches Courantes
1. **Ajouter une machine**: Modifier les listes dans `rejects.js` et `production.js`
2. **Changer le format Excel**: Modifier `data-connector.js` → `convertDataToRejects()`
3. **Modifier le port**: Changer dans `server.js` et `data-connector.js`
4. **Générer des données de test**: `node server/create_mock_data.js`

### Points d'Attention
- Toujours doubler les backslashes dans les chemins Windows (`\\`)
- Le serveur Node.js doit rester actif en permanence
- LocalStorage limité à ~5-10MB

## 📚 Documentation Disponible

| Document | Emplacement | Description |
|----------|-------------|-------------|
| README principal | `/README.md` | Vue d'ensemble et démarrage rapide |
| Guide développeur | `/docs/DEVELOPER_GUIDE.md` | Guide technique complet |
| Guide déploiement | `/docs/guides/DEPLOYMENT_GUIDE.md` | Instructions de déploiement |
| Structure projet | `/PROJECT_STRUCTURE.md` | Organisation détaillée |
| Guide Excel | `/docs/guides/EXCEL_IMPORT_GUIDE.md` | Format des données |

## 🎓 Pour les Nouveaux Développeurs

### Par où commencer ?
1. Lisez le `README.md` (vue d'ensemble)
2. Consultez `docs/DEVELOPER_GUIDE.md` (architecture technique)
3. Lancez l'application en local avec `start.bat`
4. Explorez le code dans l'ordre:
   - `src/app.js` (point d'entrée)
   - `src/modules/data-connector.js` (connexion données)
   - `src/modules/rejects.js` (logique métier)

### Concepts Clés à Comprendre
1. **Pas de framework**: Vanilla JavaScript pour la simplicité
2. **Pattern Module**: Chaque module est un objet littéral
3. **LocalStorage**: Utilisé pour cache et auth
4. **API REST simple**: Un seul endpoint `/api/data`

## 🔄 Historique des Changements Majeurs

### Version 2.0 (Novembre 2025)
- ✅ Remplacement de Google Sheets par serveur local Node.js
- ✅ Lecture directe des fichiers Excel SAP
- ✅ Suppression de la dépendance Internet
- ✅ Amélioration de la documentation

### Version 1.0 (Initiale)
- Interface web complète
- Intégration Google Sheets
- Modules d'analyse (rebuts, production)
- Gestion documentaire

## 📞 Support

Pour toute question:
1. Consultez la documentation dans `/docs/`
2. Vérifiez les guides dans `/docs/guides/`
3. Contactez l'équipe de développement

---

**Projet maintenu par**: Équipe Qualité Schneider Electric  
**Dernière mise à jour**: Novembre 2025
