# Guide de déploiement sur serveur local d'entreprise

## 📋 PRÉREQUIS

### 1. Logiciels nécessaires sur le serveur

#### **Node.js (Version LTS recommandée)**
- **Version minimale :** Node.js 16.x ou supérieur
- **Téléchargement :** https://nodejs.org/
- **Vérification :** `node --version` et `npm --version`

#### **Optionnel mais recommandé :**
- **PM2** - Pour garder l'application en permanence active
  ```bash
  npm install -g pm2
  ```

### 2. Accès réseau requis

- **Port 3000** (par défaut) - À ouvrir dans le pare-feu
- **Alternative :** Configurer un reverse proxy (Apache/Nginx) sur port 80/443

### 3. Système d'exploitation

✅ Windows Server 2012 ou supérieur
✅ Ubuntu Server 18.04 ou supérieur
✅ CentOS 7 ou supérieur
✅ Tout système supportant Node.js

---

## 📦 FICHIERS À TRANSFÉRER

Voici TOUS les fichiers/dossiers nécessaires à copier sur le serveur :

```
mssion/
├── server/                      # ← OBLIGATOIRE (Backend)
│   ├── node_modules/           # ← À regénérer (npm install)
│   ├── database/               # ← Créé automatiquement
│   │   └── dashboard.db        # ← Base de données (créée au démarrage)
│   ├── data/                   # ← OBLIGATOIRE
│   │   └── sap_export.xlsx     # ← Votre fichier Excel avec les données
│   ├── database.js
│   ├── server.js
│   └── package.json
│
├── src/                        # ← OBLIGATOIRE (Frontend)
│   ├── core/
│   ├── modules/
│   └── ui/
│
├── assets/                     # ← OBLIGATOIRE (Ressources)
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── documents/              # ← Créé automatiquement (uploads)
│   └── training/               # ← Créé automatiquement (uploads)
│
├── index.html                  # ← OBLIGATOIRE (Page principale)
├── login.html                  # ← OBLIGATOIRE (Page de login)
└── package.json                # ← Si présent
```

### ❌ NE PAS TRANSFÉRER

```
❌ node_modules/               # Trop volumineux, régénérer sur le serveur
❌ .git/                       # Pas nécessaire en production
❌ docs/                       # Documentation (optionnel)
❌ *.md                        # Fichiers markdown (optionnel)
❌ migrate_to_database.py      # Script de développement
```

---

## 🚀 PROCÉDURE D'INSTALLATION

### Étape 1 : Préparer le serveur

```bash
# 1. Se connecter au serveur (SSH ou Bureau à distance)
# 2. Créer un dossier pour l'application
mkdir -p /var/www/dashboard-qualite
# ou sur Windows :
# mkdir C:\inetpub\dashboard-qualite

# 3. Naviguer dans le dossier
cd /var/www/dashboard-qualite
```

### Étape 2 : Transférer les fichiers

**Option A - Via FTP/SFTP :**
- Utiliser FileZilla, WinSCP ou autre client FTP
- Transférer tous les fichiers listés ci-dessus

**Option B - Via Git (si disponible) :**
```bash
git clone https://votre-repo.git .
```

**Option C - Via partage réseau (Windows) :**
- Copier le dossier complet via l'explorateur Windows

### Étape 3 : Installer les dépendances

```bash
# Naviguer dans le dossier server
cd server

# Installer les modules Node.js
npm install

# Vérifier que tout est installé
npm list --depth=0
```

**Modules qui seront installés :**
- express (serveur web)
- cors (gestion CORS)
- sqlite3 (base de données)
- xlsx (lecture Excel)
- multer (upload de fichiers)

### Étape 4 : Configuration

#### A. Configurer le chemin du fichier Excel

Éditer `server/server.js` ligne 20 :

```javascript
// AVANT (développement local)
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// APRÈS (production - exemple avec lecteur réseau)
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualité\\Exports\\sap_export.xlsx';
// OU sur Linux
const EXCEL_FILE_PATH = '/mnt/partage/production/sap_export.xlsx';
```

#### B. Configurer le port (optionnel)

Éditer `server/server.js` ligne 10 :

```javascript
// Port par défaut
const PORT = 3000;

// Si port 80 souhaité (nécessite admin/root)
const PORT = 80;
```

#### C. Configurer l'URL dans le frontend

Éditer `src/modules/data-connector.js` ligne 5 :

```javascript
// AVANT (développement)
apiEndpoint: 'http://localhost:3000/api/data'

// APRÈS (production)
apiEndpoint: 'http://192.168.1.100:3000/api/data'  // IP du serveur
// OU
apiEndpoint: 'http://dashboard-qualite.entreprise.local:3000/api/data'  // DNS interne
```

Éditer `src/modules/server-sync.js` ligne 2 :

```javascript
// AVANT
baseURL: 'http://localhost:3000'

// APRÈS
baseURL: 'http://192.168.1.100:3000'  // IP du serveur
```

### Étape 5 : Premier démarrage (TEST)

```bash
# Dans le dossier server
cd server
node server.js
```

**Vérifications :**
```
✅ Serveur démarré sur http://localhost:3000
✅ API disponible sur http://localhost:3000/api/data
✅ Database connected: /path/to/dashboard.db
✅ Database tables initialized
✅ Total lignes Excel: XXXXX
✅ Lignes 850MS filtrées: XXX
```

**Si erreurs :**
- Fichier Excel non trouvé → Vérifier le chemin
- Port déjà utilisé → Changer le port
- Permission denied → Utiliser sudo/admin

### Étape 6 : Démarrage permanent

#### Option A - Windows Service (Recommandé pour Windows Server)

**1. Installer node-windows :**
```bash
npm install -g node-windows
```

**2. Créer un script de service :**
Créer `server/install-service.js` :
```javascript
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'Dashboard Qualité',
  description: 'Application de gestion qualité - Dashboard',
  script: 'C:\\inetpub\\dashboard-qualite\\server\\server.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install', function(){
  svc.start();
});

svc.install();
```

**3. Installer le service :**
```bash
node install-service.js
```

**4. Gérer le service :**
- Démarrer : `net start "Dashboard Qualité"`
- Arrêter : `net stop "Dashboard Qualité"`
- Redémarrer : `net stop "Dashboard Qualité" && net start "Dashboard Qualité"`

#### Option B - PM2 (Linux/Windows)

**1. Installer PM2 :**
```bash
npm install -g pm2
```

**2. Démarrer l'application :**
```bash
cd server
pm2 start server.js --name "dashboard-qualite"
```

**3. Configurer le démarrage automatique :**
```bash
pm2 startup
pm2 save
```

**4. Commandes utiles :**
```bash
pm2 list                    # Voir les apps
pm2 restart dashboard-qualite   # Redémarrer
pm2 stop dashboard-qualite      # Arrêter
pm2 logs dashboard-qualite      # Voir les logs
pm2 monit                   # Monitoring
```

---

## 🌐 ACCÈS RÉSEAU

### Configuration pare-feu

**Windows Server :**
```powershell
# Ouvrir le port 3000
New-NetFirewallRule -DisplayName "Dashboard Qualité" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Linux (UFW) :**
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

### Accès depuis les postes clients

Les utilisateurs accèdent via :
```
http://IP_DU_SERVEUR:3000
# Exemple : http://192.168.1.100:3000
# Ou via DNS : http://dashboard-qualite.entreprise.local:3000
```

---

## 🔧 REVERSE PROXY (Optionnel - Recommandé)

Pour utiliser le port 80 (HTTP standard) au lieu de 3000 :

### Option 1 - IIS (Windows Server)

**1. Installer ARR et URL Rewrite**
**2. Créer un site IIS**
**3. Configurer le reverse proxy vers localhost:3000**

### Option 2 - Nginx (Linux)

Fichier `/etc/nginx/sites-available/dashboard-qualite` :
```nginx
server {
    listen 80;
    server_name dashboard-qualite.entreprise.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer :
```bash
sudo ln -s /etc/nginx/sites-available/dashboard-qualite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📁 STRUCTURE FINALE SUR LE SERVEUR

```
/var/www/dashboard-qualite/    (ou C:\inetpub\dashboard-qualite\)
│
├── server/
│   ├── node_modules/          (généré par npm install)
│   ├── database/
│   │   └── dashboard.db       (créé automatiquement)
│   ├── data/
│   │   └── sap_export.xlsx    ← VOTRE FICHIER EXCEL
│   ├── database.js
│   ├── server.js
│   └── package.json
│
├── assets/
│   ├── documents/             (créé automatiquement)
│   └── training/              (créé automatiquement)
│
├── src/
└── index.html
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de déclarer le déploiement terminé :

- [ ] Node.js installé et fonctionnel
- [ ] Fichiers transférés sur le serveur
- [ ] `npm install` exécuté dans `server/`
- [ ] Fichier Excel présent dans `server/data/`
- [ ] Chemins configurés (Excel, API URLs)
- [ ] Application démarre sans erreur
- [ ] Base de données créée (`server/database/dashboard.db`)
- [ ] Port 3000 ouvert dans le pare-feu
- [ ] Service/PM2 configuré pour démarrage automatique
- [ ] Accessible depuis un poste client du réseau
- [ ] Upload de document testé
- [ ] Données persistent après redémarrage serveur

---

## 🔄 MISE À JOUR FUTURE

Pour mettre à jour l'application :

1. **Arrêter le service :**
   ```bash
   pm2 stop dashboard-qualite
   # OU
   net stop "Dashboard Qualité"
   ```

2. **Sauvegarder la base de données :**
   ```bash
   cp server/database/dashboard.db server/database/dashboard.db.backup
   ```

3. **Transférer les nouveaux fichiers**

4. **Redémarrer :**
   ```bash
   pm2 restart dashboard-qualite
   # OU
   net start "Dashboard Qualité"
   ```

---

## ⚠️ SAUVEGARDE IMPORTANTE

**Fichiers à sauvegarder régulièrement :**
- `server/database/dashboard.db` - Base de données (documents, formulaires)
- `assets/documents/` - Fichiers uploadés
- `assets/training/` - Documents de formation

**Script de sauvegarde automatique (exemple) :**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz server/database/ assets/documents/ assets/training/
```

---

## 📞 SUPPORT

En cas de problème, vérifier les logs :
```bash
pm2 logs dashboard-qualite
# OU pour Windows Service
# Event Viewer > Application Logs
```
