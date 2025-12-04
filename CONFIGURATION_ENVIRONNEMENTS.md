# 🔧 Configuration Multi-Environnements

## 📋 Vue d'ensemble

Ce guide vous permet de travailler sur **deux environnements** :
1. **Développement** - Votre ordinateur portable (localhost:3000)
2. **Production** - Serveur d'entreprise (10.192.14.223:1880)

---

## 🏠 ENVIRONNEMENT DE DÉVELOPPEMENT (Votre Portable)

### Configuration pour Localhost

#### 1. Créer un Fichier `.env.development`

Créer un nouveau fichier à la racine du projet : `.env.development`

```env
# Configuration de développement (localhost)
HOST=localhost
PORT=3000
EXCEL_FILE_PATH=backend/data/sap_export.xlsx
NODE_ENV=development
```

#### 2. Modifier `backend/server.js`

Le fichier `server.js` doit charger la bonne configuration selon l'environnement.

**Trouver ces lignes (environ ligne 15-20) :**
```javascript
const PORT = process.env.PORT || 1880;
const HOST = process.env.HOST || '10.192.14.223';
```

**Les remplacer par :**
```javascript
// Charger les variables d'environnement selon NODE_ENV
const ENV = process.env.NODE_ENV || 'development';
console.log(`🌍 Environment: ${ENV}`);

// Configuration par défaut selon l'environnement
const PORT = process.env.PORT || (ENV === 'production' ? 1880 : 3000);
const HOST = process.env.HOST || (ENV === 'production' ? '10.192.14.223' : 'localhost');
```

#### 3. Démarrer en Mode Développement

**Sur votre portable, utiliser :**

```powershell
# Option A - Démarrage simple
cd backend
node server.js
```

**OU avec les variables d'environnement explicites :**

```powershell
# Option B - Avec variables d'env
$env:NODE_ENV="development"
$env:PORT="3000"
$env:HOST="localhost"
node backend/server.js
```

L'application sera accessible sur :
```
http://localhost:3000
```

---

## 🏢 ENVIRONNEMENT DE PRODUCTION (Serveur)

### Configuration Serveur

Le serveur utilise déjà le fichier `.env.production` avec PM2.

**Aucune modification nécessaire sur le serveur !**

L'application reste accessible sur :
```
http://10.192.14.223:1880
```

---

## 🔄 WORKFLOW DE DÉVELOPPEMENT

### Scénario Complet

#### 1️⃣ Développement sur Votre Portable

```powershell
# Sur votre portable (C:\Users\DELL\Desktop\mssion)

# Démarrer le serveur en mode développement
cd backend
node server.js

# Le serveur démarre sur localhost:3000
# Ouvrir: http://localhost:3000/dashboard.html
```

#### 2️⃣ Tester vos Modifications

- Modifier les fichiers frontend ou backend
- Rafraîchir le navigateur pour voir les changements
- Tester les fonctionnalités

#### 3️⃣ Arrêter le Serveur Local

```
Ctrl + C
```

#### 4️⃣ Déployer vers le Serveur

Une fois vos modifications testées et validées :

**Méthode A - Via Clé USB (Simple) :**

```powershell
# 1. Copier le projet sur la clé USB
# 2. Aller sur le serveur
# 3. Remplacer les fichiers modifiés dans C:\mssion
# 4. Redémarrer l'application
pm2 restart dashboard-qualite
```

**Méthode B - Via Réseau (Plus rapide) :**

Si le serveur est accessible sur le réseau :

```powershell
# Depuis votre portable
# Copier vers le serveur (adapter le chemin)
robocopy "C:\Users\DELL\Desktop\mssion" "\\10.192.14.223\C$\mssion" /MIR /XD node_modules logs .git

# Puis sur le serveur, redémarrer
pm2 restart dashboard-qualite
```

---

## 🎯 CONFIGURATION DES MODULES FRONTEND

### Adapter les URLs selon l'Environnement

Pour que le frontend s'adapte automatiquement à l'environnement, modifier les modules :

#### Méthode Automatique (Recommandée)

Créer un fichier `frontend/src/config.js` :

```javascript
// Configuration automatique selon l'environnement
const Config = {
    // Détecter si on est en localhost ou sur le serveur
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // URL de base de l'API
    get apiBaseURL() {
        if (this.isLocalhost) {
            return 'http://localhost:3000';
        } else {
            return 'http://10.192.14.223:1880';
        }
    },

    // URLs complètes des API
    get apiData() { return `${this.apiBaseURL}/api/data`; },
    get apiDocumentsQuality() { return `${this.apiBaseURL}/api/documents/quality`; },
    get apiDocumentsTraining() { return `${this.apiBaseURL}/api/documents/training`; },
    get apiFichesEtoile() { return `${this.apiBaseURL}/api/fiches-etoile`; },
    get apiReferences() { return `${this.apiBaseURL}/api/references/850ms`; },

    // URL pour les îlots
    getApiIlot(ilotName) {
        return `${this.apiBaseURL}/api/ilot/${ilotName}`;
    }
};

// Exposer globalement
window.Config = Config;
```

#### Ajouter config.js dans les Pages HTML

Dans **dashboard.html**, **forms.html**, **documents.html**, etc., ajouter AVANT les autres scripts :

```html
<!-- Configuration multi-environnements -->
<script src="src/config.js"></script>

<!-- Puis les autres scripts -->
<script src="src/modules/data-connector.js"></script>
<!-- etc... -->
```

#### Modifier les Modules pour Utiliser Config

**Exemple : `frontend/src/modules/data-connector.js`**

**Trouver :**
```javascript
config: {
    apiEndpoint: 'http://10.192.14.223:1880/api/data',
    // ...
},
```

**Remplacer par :**
```javascript
config: {
    apiEndpoint: window.Config ? window.Config.apiData : 'http://10.192.14.223:1880/api/data',
    // ...
},
```

**Répéter pour tous les modules :**
- `server-sync.js`
- `fiche-etoile.js`
- `training.js`
- `documents.js`

#### Modifier les Pages Îlots

**Dans chaque page îlot (pm1.html, pm2.html, etc.) :**

**Trouver :**
```javascript
const ILOT_NAME = 'PM1';
const API_URL = 'http://10.192.14.223:1880/api/ilot/' + ILOT_NAME;
```

**Remplacer par :**
```javascript
const ILOT_NAME = 'PM1';
// Détecter l'environnement
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocalhost ? 'http://localhost:3000' : 'http://10.192.14.223:1880';
const API_URL = BASE_URL + '/api/ilot/' + ILOT_NAME;
```

---

## 📝 MÉTHODE SIMPLE (Alternative)

### Sans Modifier le Code

Si vous ne voulez pas modifier le code, vous pouvez utiliser **deux branches Git** ou **deux dossiers** :

#### Option 1 : Deux Dossiers

```
C:\Users\DELL\Desktop\
├── mssion-dev\          (Pour développement - localhost:3000)
└── mssion-production\   (Pour préparer déploiement - URLs production)
```

**Développement :**
- Travailler dans `mssion-dev`
- URLs configurées pour localhost:3000

**Avant déploiement :**
- Copier `mssion-dev` vers `mssion-production`
- Changer manuellement les URLs vers 10.192.14.223:1880
- Copier `mssion-production` sur la clé USB

#### Option 2 : Script de Conversion

Créer un script PowerShell `switch-to-production.ps1` :

```powershell
# Script pour convertir les URLs de dev vers production

Write-Host "🔄 Conversion vers Production..." -ForegroundColor Cyan

$files = @(
    "frontend\src\modules\data-connector.js",
    "frontend\src\modules\server-sync.js",
    "frontend\src\modules\fiche-etoile.js",
    "frontend\src\modules\training.js",
    "frontend\ilots\pm1.html",
    "frontend\ilots\pm2.html",
    "frontend\ilots\bz1.html",
    "frontend\ilots\bz2.html",
    "frontend\ilots\grm.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) -replace 'http://localhost:3000', 'http://10.192.14.223:1880' | Set-Content $file
        Write-Host "✅ $file converti" -ForegroundColor Green
    }
}

Write-Host "✅ Conversion terminée !" -ForegroundColor Green
```

Et un script `switch-to-development.ps1` :

```powershell
# Script pour convertir les URLs de production vers dev

Write-Host "🔄 Conversion vers Développement..." -ForegroundColor Cyan

$files = @(
    "frontend\src\modules\data-connector.js",
    "frontend\src\modules\server-sync.js",
    "frontend\src\modules\fiche-etoile.js",
    "frontend\src\modules\training.js",
    "frontend\ilots\pm1.html",
    "frontend\ilots\pm2.html",
    "frontend\ilots\bz1.html",
    "frontend\ilots\bz2.html",
    "frontend\ilots\grm.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) -replace 'http://10.192.14.223:1880', 'http://localhost:3000' | Set-Content $file
        Write-Host "✅ $file converti" -ForegroundColor Green
    }
}

Write-Host "✅ Conversion terminée !" -ForegroundColor Green
```

**Utilisation :**

```powershell
# Avant de développer sur localhost
.\switch-to-development.ps1

# Avant de déployer sur le serveur
.\switch-to-production.ps1
```

---

## 🎯 RECOMMANDATION

### Meilleure Approche : Configuration Automatique

**Je recommande la méthode avec `config.js`** car :

✅ Pas besoin de changer les URLs manuellement
✅ Le même code fonctionne en dev et en production
✅ Détection automatique de l'environnement
✅ Moins de risque d'erreur

**Workflow simple :**
1. Développer sur localhost:3000
2. Tester
3. Copier tel quel sur le serveur
4. Ça marche automatiquement !

---

## 📋 CHECKLIST

### Configuration Initiale (Une fois)

- [ ] Créer `frontend/src/config.js`
- [ ] Ajouter `<script src="src/config.js"></script>` dans toutes les pages HTML
- [ ] Modifier les modules pour utiliser `window.Config`
- [ ] Modifier les pages îlots pour détecter l'environnement
- [ ] Tester sur localhost:3000
- [ ] Déployer sur le serveur et vérifier

### Workflow Quotidien

- [ ] Développer et tester sur localhost:3000
- [ ] Valider les modifications
- [ ] Copier sur clé USB (ou via réseau)
- [ ] Copier sur le serveur
- [ ] Redémarrer : `pm2 restart dashboard-qualite`
- [ ] Tester sur http://10.192.14.223:1880

---

## 🆘 QUESTIONS FRÉQUENTES

### Q: Dois-je changer le port 1880 sur le serveur ?
**R:** Non ! Le serveur reste sur 1880. C'est seulement votre portable qui utilise 3000.

### Q: Comment savoir si je suis en dev ou en prod ?
**R:** Regardez l'URL dans le navigateur :
- `localhost:3000` = Développement
- `10.192.14.223:1880` = Production

### Q: Puis-je avoir les deux serveurs actifs en même temps ?
**R:** Oui ! Votre portable peut tourner sur localhost:3000 pendant que le serveur tourne sur 10.192.14.223:1880. Ce sont deux instances séparées.

### Q: Les données Excel sont-elles partagées ?
**R:** Non. En dev, vous utilisez votre fichier Excel local. En prod, le serveur utilise son fichier Excel (possiblement sur le réseau).

---

## 📞 RÉSUMÉ RAPIDE

### Sur Votre Portable (Développement)
```powershell
cd C:\Users\DELL\Desktop\mssion\backend
node server.js
# Ouvrir http://localhost:3000
```

### Sur le Serveur (Production)
```powershell
# Déjà configuré avec PM2
# Accessible sur http://10.192.14.223:1880
```

### Déployer les Modifications
```powershell
# 1. Tester sur localhost
# 2. Copier sur clé USB
# 3. Sur le serveur :
pm2 restart dashboard-qualite
```

C'est tout ! 🎉
