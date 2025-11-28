# Explication : Lecture du fichier Excel depuis le serveur de l'entreprise

## 📋 Comment ça fonctionne actuellement

### 1. Configuration du chemin (lignes 18-26 de server.js)

Actuellement, le code est configuré ainsi :

```javascript
// LIGNE 20 - ACTIF (Option par défaut)
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
// Cela pointe vers : C:\Users\DELL\Desktop\mssion\server\data\sap_export.xlsx

// LIGNES 23-24 - COMMENTÉ (Option pour serveur réseau)
// const EXCEL_FILE_PATH = 'Z:\\Production\\Qualité\\Exports\\rebuts_sap.xlsx';
```

### 2. Mécanisme de lecture (lignes 57-111)

Quand quelqu'un accède à l'application, voici ce qui se passe :

#### Étape 1 : Vérification du fichier (lignes 59-65)
```javascript
if (!fs.existsSync(EXCEL_FILE_PATH)) {
    return res.status(404).json({
        error: 'Fichier Excel non trouvé',
        path: EXCEL_FILE_PATH,
        message: "Veuillez placer le fichier..."
    });
}
```
- Vérifie que le fichier Excel existe
- Si non trouvé, renvoie une erreur claire

#### Étape 2 : Lecture du fichier (lignes 68-78)
```javascript
const workbook = xlsx.readFile(EXCEL_FILE_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = xlsx.utils.sheet_to_json(worksheet, {
    raw: false,
    dateNF: 'yyyy-mm-dd'
});
```
- Lit le fichier Excel complet en mémoire
- Convertit la première feuille en JSON
- Gère les dates automatiquement

#### Étape 3 : Filtrage des données (lignes 80-92)
```javascript
const filteredData = jsonData.filter(row => {
    const machineKey = Object.keys(row).find(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey === 'workcenter' || lowerKey.includes('machine');
    });

    if (!machineKey) return false;

    const machineValue = String(row[machineKey] || '');
    return machineValue.startsWith('850MS');
});
```
- Cherche la colonne "WORKCENTER" ou "machine"
- Ne garde que les lignes dont la machine commence par "850MS"

#### Étape 4 : Renvoi des données (lignes 97-103)
```javascript
res.json({
    success: true,
    count: filteredData.length,
    totalRows: jsonData.length,
    lastModified: fs.statSync(EXCEL_FILE_PATH).mtime,
    data: filteredData
});
```

---

## 🌐 Pour lire depuis le serveur de l'entreprise

### Option A : Lecteur réseau mappé (Recommandé - Windows)

Si votre serveur SAP exporte sur un partage réseau `\\SERVEUR-SAP\Exports\` :

**1. Sur le serveur où tourne Node.js, mapper un lecteur :**
```
- Clic droit sur "Ce PC"
- Connecter un lecteur réseau
- Lecteur : Z:
- Dossier : \\SERVEUR-SAP\Exports
- Cocher "Se reconnecter à l'ouverture de session"
```

**2. Modifier server.js ligne 20 :**
```javascript
// Commenter la ligne actuelle
// const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// Décommenter et modifier ligne 24
const EXCEL_FILE_PATH = 'Z:\\Qualité\\sap_export.xlsx';
```

### Option B : Chemin UNC direct (Windows)

Sans mapper de lecteur :

```javascript
const EXCEL_FILE_PATH = '\\\\SERVEUR-SAP\\Exports\\Qualité\\sap_export.xlsx';
```

⚠️ **Important :** Doubler les backslashes `\\` en JavaScript !

### Option C : Dossier partagé monté (Linux)

Si le serveur est sous Linux :

**1. Monter le partage réseau :**
```bash
sudo mkdir -p /mnt/sap-exports
sudo mount -t cifs //SERVEUR-SAP/Exports /mnt/sap-exports -o username=user,password=pass
```

**2. Modifier server.js :**
```javascript
const EXCEL_FILE_PATH = '/mnt/sap-exports/qualite/sap_export.xlsx';
```

---

## 🔄 Actualisation automatique des données

### Comment ça fonctionne actuellement

**Le fichier est lu À CHAQUE REQUÊTE :**
- Quelqu'un ouvre la page → Lecture du fichier Excel
- Quelqu'un rafraîchit → Re-lecture du fichier Excel
- Actualisation automatique toutes les 5 minutes (configuré dans frontend)

**Ligne 101 - Date de dernière modification :**
```javascript
lastModified: fs.statSync(EXCEL_FILE_PATH).mtime
```
- Retourne quand le fichier a été modifié pour la dernière fois
- Permet de savoir si les données sont récentes

### Configuration de l'actualisation (frontend)

Dans `src/modules/data-connector.js` ligne 7 :
```javascript
refreshInterval: 300000  // 5 minutes = 300000 ms
```

Vous pouvez changer :
- `60000` = 1 minute
- `300000` = 5 minutes (actuel)
- `600000` = 10 minutes
- `1800000` = 30 minutes

---

## 📊 Scénario complet de déploiement

### Situation actuelle (Développement)
```
Ordinateur de développement
└── C:\Users\DELL\Desktop\mssion\server\data\sap_export.xlsx
    (Fichier local pour les tests)
```

### Situation en production

#### Scénario 1 : Export SAP automatique sur partage réseau

```
Serveur SAP
└── Export automatique vers \\SERVEUR-SAP\Exports\sap_export.xlsx
    (Fichier mis à jour quotidiennement par SAP)

Serveur Node.js (Dashboard)
└── Lecteur Z: mappé sur \\SERVEUR-SAP\Exports\
    server.js lit depuis Z:\sap_export.xlsx
```

#### Scénario 2 : Export SAP copié sur le même serveur

```
Serveur unique (SAP + Node.js)
└── C:\Exports\SAP\sap_export.xlsx
    server.js lit depuis C:\Exports\SAP\sap_export.xlsx
```

#### Scénario 3 : Export SAP via FTP/SFTP

```
Serveur SAP
└── Export FTP vers Serveur Node.js

Serveur Node.js
└── Réception dans /var/ftp/uploads/sap_export.xlsx
    server.js lit depuis /var/ftp/uploads/sap_export.xlsx
```

---

## ✅ Points importants

### 1. Permissions d'accès

Le compte qui exécute Node.js doit avoir :
- ✅ **Lecture** sur le fichier Excel
- ✅ **Accès réseau** si fichier sur un autre serveur
- ✅ **Identifiants** pour accéder au partage réseau

### 2. Format du fichier

Le fichier Excel doit contenir au minimum ces colonnes :
- `WORKCENTER` ou `machine` - Identifiant de la machine
- `date` ou `confirmation date` - Date de l'opération
- `material` ou `matériel` - Référence matériel
- `description` - Description
- `quantity` ou `quantité` ou `qte scrap` - Quantité rebut
- `QTE PROD APP` ou `production quantity` - Quantité produite
- `prix unit` ou `unit price` - Prix unitaire

### 3. Performance

- Fichier de **171 825 lignes** → Temps de lecture : ~2-5 secondes
- Mise en cache possible si le fichier est très volumineux
- Lecture à la demande = Données toujours à jour

### 4. Gestion des erreurs

Si le fichier n'est pas accessible :
- Message d'erreur clair affiché
- Indication du chemin attendu
- Pas de crash du serveur

---

## 🔧 Configuration recommandée pour production

```javascript
// Dans server.js, ligne 20

// DÉVELOPPEMENT (votre PC)
// const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');

// PRODUCTION (serveur de l'entreprise)
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\Exports\\sap_export.xlsx';

// Vérification au démarrage
if (fs.existsSync(EXCEL_FILE_PATH)) {
    console.log('✅ Fichier Excel trouvé');
    const stats = fs.statSync(EXCEL_FILE_PATH);
    console.log(`📅 Dernière modification : ${stats.mtime}`);
    console.log(`📦 Taille : ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} else {
    console.error('❌ ERREUR : Fichier Excel non trouvé !');
    console.error(`   Chemin attendu : ${EXCEL_FILE_PATH}`);
}
```

---

## 📞 Informations à demander à l'équipe IT

Pour le déploiement, vous aurez besoin de savoir :

1. **Emplacement du fichier Excel SAP :**
   - Chemin réseau UNC ? (ex: `\\SERVEUR\Partage\fichier.xlsx`)
   - Lecteur mappé ? (ex: `Z:\fichier.xlsx`)
   - Dossier local ? (ex: `C:\Exports\fichier.xlsx`)

2. **Fréquence de mise à jour :**
   - Quotidien ? Horaire ? Temps réel ?
   - Heure de génération du fichier

3. **Permissions :**
   - Compte de service pour Node.js
   - Droits d'accès au partage réseau

4. **Nom exact du fichier :**
   - `sap_export.xlsx` ?
   - Nom avec date ? (ex: `export_20250126.xlsx`)
   - Extension : `.xlsx` ou `.xls` ?

---

## 🎯 Résumé

**Actuellement :**
- ✅ Le code est déjà prêt pour lire depuis un serveur réseau
- ✅ Il suffit de changer UNE LIGNE (ligne 20 de server.js)
- ✅ La lecture est automatique et mise à jour régulièrement
- ✅ Aucune modification de code complexe nécessaire

**Pour le déploiement :**
- Demander le chemin réseau du fichier Excel SAP
- Modifier la ligne 20 avec le bon chemin
- Redémarrer le serveur Node.js
- C'est tout !
