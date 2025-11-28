# Dashboard Qualité - Merlin Gerin (Schneider Electric)

## 📋 Vue d'ensemble
Application web de gestion de la qualité pour l'usine Merlin Gerin. Le dashboard permet de visualiser et analyser les données de production et de rebuts en temps réel à partir d'exports SAP.

**Technologie**: Application web statique (HTML/CSS/JavaScript) + Serveur Node.js pour la lecture des données Excel.

## 🚀 Démarrage Rapide

### Pour Développement Local
1. Installez Node.js (version LTS)
2. Ouvrez un terminal dans le dossier du projet
3. Double-cliquez sur `start.bat` (Windows)
   - OU exécutez manuellement:
     ```bash
     cd server
     npm install
     node server.js
     ```
4. Ouvrez votre navigateur à `http://localhost:3000`

### Pour Déploiement en Production
Consultez le guide complet: [`docs/guides/DEPLOYMENT_GUIDE.md`](docs/guides/DEPLOYMENT_GUIDE.md)

## 📁 Structure du Projet

```
mssion/
├── index.html              # Page principale du dashboard
├── login.html              # Page de connexion
├── start.bat              # Script de démarrage rapide (Windows)
│
├── assets/                # Ressources statiques
│   ├── css/              # Feuilles de style
│   ├── images/           # Images et logos
│   ├── documents/        # Documents qualité uploadés
│   └── training/         # Documents de formation
│
├── src/                   # Code source JavaScript
│   ├── core/             # Modules fondamentaux (auth, data-manager, utils)
│   ├── ui/               # Gestion de l'interface utilisateur
│   ├── modules/          # Modules fonctionnels (rejects, production, etc.)
│   └── app.js            # Point d'entrée de l'application
│
├── server/                # Serveur Node.js (Backend)
│   ├── server.js         # Serveur Express + API de lecture Excel
│   ├── package.json      # Dépendances Node.js
│   ├── data/             # Dossier contenant le fichier Excel SAP
│   └── create_mock_data.js  # Générateur de données de test
│
└── docs/                  # Documentation
    ├── guides/           # Guides utilisateur et technique
    ├── setup/            # Guides d'installation
    └── architecture/     # Documentation architecture
```

## 🔧 Architecture Technique

### Frontend (Client)
- **Technologie**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Bibliothèques**: Bootstrap 5, Chart.js, Font Awesome
- **Stockage**: localStorage pour les données utilisateur et cache

### Backend (Serveur)
- **Technologie**: Node.js + Express
- **Fonction**: Lecture du fichier Excel SAP et exposition via API REST
- **Endpoint principal**: `GET /api/data` (retourne les données en JSON)

### Flux de Données
```
SAP → Fichier Excel → Serveur Node.js → API REST → Dashboard Web
```

## 📚 Modules Principaux

| Module | Fichier | Description |
|--------|---------|-------------|
| **Analyse des Rebuts** | `src/modules/rejects.js` | Visualisation et analyse des rebuts par machine/période |
| **Analyse de Production** | `src/modules/production.js` | Suivi de la production et du chiffre d'affaires |
| **Documents Qualité** | `src/modules/documents.js` | Gestion des documents par machine |
| **Formation** | `src/modules/training.js` | Ressources de formation qualité |
| **Formulaires** | `src/modules/fiche-etoile.js` | Déclaration de produits défectueux |
| **Connecteur de Données** | `src/modules/data-connector.js` | Communication avec le serveur local |

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@merlingerin.com | admin123 |
| Responsable Qualité | qualite@merlingerin.com | qualite123 |
| Opérateur | operateur@merlingerin.com | operateur123 |

## 📖 Documentation Importante

### Pour les Développeurs
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Structure détaillée du projet
- [`docs/guides/DEPLOYMENT_GUIDE.md`](docs/guides/DEPLOYMENT_GUIDE.md) - Guide de déploiement
- [`docs/architecture/`](docs/architecture/) - Documentation architecture

### Pour les Utilisateurs
- [`docs/guides/EXCEL_IMPORT_GUIDE.md`](docs/guides/EXCEL_IMPORT_GUIDE.md) - Format des données Excel
- [`docs/guides/GUIDE_FORMATION_PROFESSIONNELLE.md`](docs/guides/GUIDE_FORMATION_PROFESSIONNELLE.md) - Guide formation

## 🔄 Workflow de Développement

1. **Modification du code**: Éditez les fichiers dans `src/`
2. **Test local**: Utilisez `start.bat` pour tester
3. **Données de test**: Exécutez `node server/create_mock_data.js` pour générer des données
4. **Déploiement**: Copiez l'ensemble du projet sur le serveur de production

## ⚙️ Configuration

### Chemin du Fichier Excel SAP
Modifiez `server/server.js` ligne 15:
```javascript
const EXCEL_FILE_PATH = 'VOTRE\\CHEMIN\\VERS\\fichier.xlsx';
```

### Port du Serveur
Par défaut: `3000`. Modifiable dans `server/server.js` ligne 8.

## 🐛 Dépannage

**Problème**: Le site ne charge pas les données
- ✅ Vérifiez que le serveur Node.js est démarré (`node server.js`)
- ✅ Vérifiez que le fichier Excel existe à l'emplacement configuré
- ✅ Consultez la console du navigateur (F12) pour les erreurs

**Problème**: Erreur "Cannot find module"
- ✅ Exécutez `npm install` dans le dossier `server/`

## 📞 Support

Pour toute question technique, consultez la documentation dans `docs/` ou contactez l'équipe de développement.

---

**Version**: 2.0  
**Dernière mise à jour**: Novembre 2025  
**Entreprise**: Schneider Electric - Merlin Gerin
