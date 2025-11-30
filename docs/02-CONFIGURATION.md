# ⚙️ Configuration du Dashboard Qualité

> **Objectif** : Configurer le système pour lire le fichier Excel SAP du serveur de l'entreprise

---

## 📍 Configuration du Fichier Excel SAP

### 🎯 Emplacement Actuel (Développement)

**Fichier** : `server/data/sap_export.xlsx`
**Configuration** : `server/server.js` ligne 20

```javascript
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
```

☝️ **C'est pour le développement local uniquement**

---

### 🏢 Configuration Production (Serveur de l'Entreprise)

Éditer le fichier `server/server.js` ligne 20 :

#### Option 1 : Lecteur Réseau Mappé (Recommandé Windows)

```javascript
// AVANT (dev local)
// const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// APRÈS (production)
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\Exports\\sap_export.xlsx';
```

**Étapes :**
1. Sur le serveur, mapper le lecteur réseau :
   - Clic droit sur "Ce PC" → "Connecter un lecteur réseau"
   - Lecteur : `Z:`
   - Dossier : `\\SERVEUR-SAP\Exports`
   - ✅ Cocher "Se reconnecter à l'ouverture de session"

2. Modifier `server.js` avec le chemin Z:\

#### Option 2 : Chemin UNC Direct

```javascript
const EXCEL_FILE_PATH = '\\\\SERVEUR-SAP\\Exports\\Qualite\\sap_export.xlsx';
```

⚠️ **Important** : Doubler les backslashes `\\` en JavaScript !

#### Option 3 : Dossier Local sur le Serveur

```javascript
const EXCEL_FILE_PATH = 'C:\\Exports\\SAP\\sap_export.xlsx';
```

#### Option 4 : Linux (Montage CIFS/NFS)

```javascript
const EXCEL_FILE_PATH = '/mnt/sap-exports/qualite/sap_export.xlsx';
```

**Monter le partage** :
```bash
sudo mount -t cifs //SERVEUR-SAP/Exports /mnt/sap-exports -o username=sap,password=***
```

---

## 📋 Format du Fichier Excel

### Colonnes Requises

Le système est **flexible** sur les noms de colonnes. Il accepte :

| Donnée | Noms de colonnes acceptés |
|--------|---------------------------|
| **Machine** | `WORKCENTER`, `machine`, `Machine` |
| **Date** | `date`, `confirmation date`, `Date` |
| **Matériel** | `material`, `matériel`, `Matériel` |
| **Description** | `description`, `designation`, `Description` |
| **Qté Rebut** | `quantity`, `quantité`, `qte scrap`, `Quantité` |
| **Qté Production** | `QTE PROD APP`, `production quantity`, `productionquantity` |
| **Prix Unitaire** | `prix unit`, `unit price`, `PRIX UNIT`, `Prix UNIT` |

### Exemple de Structure Excel

| WORKCENTER | Date | Material | Description | QTE SCRAP | QTE PROD APP | PRIX UNIT |
|------------|------|----------|-------------|-----------|--------------|-----------|
| 850MS085 | 2025-01-26 | MAT-001 | COMPONENT A | 150 | 5000 | 0.12 |
| 850MS122 | 2025-01-26 | MAT-002 | COMPONENT B | 200 | 8000 | 0.08 |
| 850MS123 | 2025-01-26 | MAT-003 | COMPONENT C | 50 | 3000 | 0.15 |

### Format des Données

- **Dates** : `YYYY-MM-DD` (2025-01-26) ou `DD/MM/YYYY` (26/01/2025)
- **Nombres** : Point `.` ou virgule `,` pour les décimales
- **Machines** : Doivent commencer par `850MS` (ex: 850MS085, 850MS122...)

---

## 🔄 Configuration de l'Actualisation

### Fréquence de Rafraîchissement

**Fichier** : `src/modules/data-connector.js` ligne 7

```javascript
refreshInterval: 300000  // 5 minutes (en millisecondes)
```

**Valeurs recommandées** :
- `60000` = 1 minute (temps réel, charge serveur élevée)
- `300000` = 5 minutes **(RECOMMANDÉ)**
- `600000` = 10 minutes
- `1800000` = 30 minutes
- `3600000` = 1 heure

---

## 🌐 Configuration du Port Serveur

### Changer le Port d'Écoute

**Fichier** : `server/server.js` ligne 10

```javascript
const PORT = 3000;  // Port par défaut
```

**Alternatives** :
```javascript
const PORT = 80;    // HTTP standard (nécessite admin)
const PORT = 8080;  // Alternative commune
const PORT = 5000;  // Autre port courant
```

### Après Changement de Port

Si vous changez le port, **mettre à jour aussi** :

**1. Frontend - `src/modules/data-connector.js` ligne 5 :**
```javascript
apiEndpoint: 'http://localhost:8080/api/data'  // Nouveau port
```

**2. Frontend - `src/modules/server-sync.js` ligne 2 :**
```javascript
baseURL: 'http://localhost:8080'  // Nouveau port
```

---

## 🔐 Configuration de la Sécurité

### Authentification

**Fichier** : `src/core/auth.js`

**Modifier les credentials** :
```javascript
// Ligne ~5-10
const USERS = {
    admin: {
        password: 'votreMotDePasseSecurise',  // Changer ici
        role: 'admin'
    },
    user: {
        password: 'utilisateur123',
        role: 'user'
    }
};
```

⚠️ **Sécurité** : Ne pas commiter les mots de passe réels dans Git !

---

## 🗄️ Configuration Base de Données

### Emplacement

**Automatique** : `server/database/dashboard.db`

La base de données SQLite est créée automatiquement au premier démarrage.

### Changer l'Emplacement

**Fichier** : `server/database.js` ligne 11

```javascript
// Par défaut
const DB_PATH = path.join(DB_DIR, 'dashboard.db');

// Personnalisé (ex: sur un volume dédié)
const DB_PATH = 'D:\\Database\\dashboard-qualite.db';
```

---

## 🌍 Configuration Multi-Environnements

### Variables d'Environnement (Avancé)

Créer un fichier `.env` à la racine :

```env
# Environnement
NODE_ENV=production

# Serveur
PORT=3000
HOST=0.0.0.0

# Excel
EXCEL_PATH=Z:\Production\Qualite\sap_export.xlsx

# Base de données
DB_PATH=./server/database/dashboard.db

# Actualisation (ms)
REFRESH_INTERVAL=300000
```

**Utilisation dans `server.js`** :
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const EXCEL_FILE_PATH = process.env.EXCEL_PATH || path.join(__dirname, 'data', 'sap_export.xlsx');
```

**Installation dotenv** :
```bash
npm install dotenv
```

---

## ✅ Vérification de la Configuration

### Test de Connexion au Fichier Excel

```bash
# Dans le dossier server
node -e "
const fs = require('fs');
const path = 'Z:\\Production\\Qualite\\sap_export.xlsx'; // Votre chemin
console.log('Fichier existe:', fs.existsSync(path));
console.log('Taille:', fs.statSync(path).size, 'bytes');
"
```

### Test de Lecture Excel

```bash
node -e "
const xlsx = require('xlsx');
const workbook = xlsx.readFile('Z:\\Production\\Qualite\\sap_export.xlsx');
console.log('Feuilles:', workbook.SheetNames);
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
console.log('Lignes:', sheet.length);
"
```

### Logs de Configuration

Au démarrage du serveur, vérifier :

```
✅ Serveur démarré sur http://localhost:3000
✅ Fichier Excel trouvé
✅ Total lignes Excel: 171825
✅ Lignes 850MS filtrées: 450
```

---

## 🔧 Configurations Avancées

### Limiter la Taille des Uploads

**Fichier** : `server/server.js` ligne 50

```javascript
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB (modifier ici)
});
```

### Configurer le Timeout

**Fichier** : `server/server.js` après ligne 293

```javascript
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré...`);
});

// Ajouter timeout
server.timeout = 120000; // 2 minutes
```

---

## 📞 Informations à Demander à l'IT

Pour la configuration en production, obtenir :

1. **Chemin du fichier Excel SAP**
   - UNC path : `\\SERVEUR\Partage\fichier.xlsx` ?
   - Lecteur mappé : `Z:\fichier.xlsx` ?

2. **Fréquence de mise à jour du fichier**
   - Quotidien ? Horaire ? Temps réel ?

3. **Compte de service**
   - Quel compte Windows/Linux exécutera Node.js ?
   - A-t-il accès au partage réseau ?

4. **Port disponible**
   - Port 3000 libre ?
   - Pare-feu à configurer ?

---

## 🎯 Récapitulatif

Configurer :
1. ✅ Chemin du fichier Excel (ligne 20 de `server/server.js`)
2. ✅ Port du serveur (ligne 10 de `server/server.js`)
3. ✅ URLs frontend (si port changé)
4. ✅ Fréquence d'actualisation (optionnel)
5. ✅ Mots de passe (recommandé)

**Prochaine étape** : [03-DEPLOIEMENT.md](03-DEPLOIEMENT.md)
