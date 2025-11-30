# Guide de migration - Stockage 100% en base de données SQLite

## Problème résolu

**AVANT :** Les documents et formulaires étaient stockés dans le localStorage du navigateur et perdus lors du rafraîchissement

**APRÈS :** Tout est maintenant stocké dans la base de données SQLite (`server/database/dashboard.db`) - **PERMANENT**

## Fichiers modifiés

### 1. ✅ `server/database.js`
- Base de données SQLite déjà configurée
- Tables créées : `quality_documents`, `training_documents`, `fiche_etoile`

### 2. ✅ `src/modules/server-sync.js` (NOUVEAU)
- Module de synchronisation avec le serveur
- Remplace les appels localStorage par des appels API

### 3. ✅ `src/core/data-manager.js` (MODIFIÉ)
- Méthodes transformées en `async` pour appeler le serveur
- `getDocuments()` → appelle `ServerSync.getQualityDocuments()`
- `addQualityDocument()` → appelle `ServerSync.addQualityDocument()`
- `deleteQualityDocument()` → appelle `ServerSync.deleteQualityDocument()`
- `getTrainingDocuments()` → appelle `ServerSync.getTrainingDocuments()`
- `addTrainingDocument()` → appelle `ServerSync.addTrainingDocument()`
- `deleteTrainingDocument()` → appelle `ServerSync.deleteTrainingDocument()`

### 4. ✅ `index.html` (MODIFIÉ)
- Ajout de `<script src="src/modules/server-sync.js"></script>`

### 5. ⚠️ `src/modules/documents.js` (À MODIFIER MANUELLEMENT)
**IMPORTANT :** Les méthodes doivent être transformées en `async/await`

Recherchez et modifiez :
```javascript
// AVANT
displayDocuments: function() {
    const documents = DataManager.getDocumentsByMachine(this.currentMachineFilter);

// APRÈS
displayDocuments: async function() {
    const documents = await DataManager.getDocumentsByMachine(this.currentMachineFilter);
```

**Toutes les occurrences à modifier dans documents.js :**
- Ligne 18: `generateMachineTabs: async function()` ✅ FAIT
- Ligne 43: `const documents = await DataManager.getDocumentsByMachine(machine);`
- Ligne 139: `const documents = await DataManager.getDocumentsByMachine(this.currentMachineFilter);`
- Ligne 155: `const documents = await DataManager.getDocumentsByMachine(machine);`
- Ligne 332: `const saved = await DataManager.addQualityDocument(formData);` (formData, pas docData)
- Ligne 388: `displayDocuments: async function()`
- Ligne 393: `const documents = await DataManager.getDocumentsByMachine(this.currentMachineFilter);`
- Ligne 702: `const deleted = await DataManager.deleteQualityDocument(docId);`

**Tous les appels à displayDocuments() doivent être en await :**
- Ligne 120: `await this.displayDocuments();`
- Ligne 362: `await this.displayDocuments();`
- Ligne 515: `await this.displayDocuments();`
- Ligne 644: `await this.displayDocuments();`
- Ligne 680: `await this.displayDocuments();`
- Ligne 715: `await this.displayDocuments();`
- Ligne 755: `await this.displayDocuments();`

### 6. ⚠️ `src/modules/training.js` (À MODIFIER MANUELLEMENT)
Mêmes modifications que documents.js

### 7. ⚠️ `src/modules/fiche-etoile.js` (À MODIFIER MANUELLEMENT)
Doit utiliser `ServerSync.getFichesEtoile()`, `ServerSync.addFicheEtoile()`, `ServerSync.deleteFicheEtoile()`

## Important : Upload de fichiers

L'upload doit maintenant utiliser **FormData** au lieu d'un objet JSON simple.

**AVANT (documents.js ligne 330) :**
```javascript
const docData = {
    title: title.value,
    category: category.value,
    // ...
};
const saved = DataManager.addQualityDocument(docData);
```

**APRÈS :**
```javascript
const formData = new FormData();
formData.append('title', title.value);
formData.append('category', category.value);
formData.append('machine', machine.value);
formData.append('description', description.value);
formData.append('file', fileInput.files[0]); // Le fichier
formData.append('uploaded_by', SimpleAuth.getCurrentUser());

const saved = await DataManager.addQualityDocument(formData);
```

## Test de la migration

1. **Redémarrer le serveur :**
```bash
cd server
node server.js
```

2. **Vérifier la base de données :**
```bash
ls -la server/database/
# Devrait afficher : dashboard.db
```

3. **Tester l'upload :**
   - Se connecter à l'interface
   - Uploader un document qualité
   - Rafraîchir la page (F5)
   - ✅ Le document doit toujours être là !

4. **Vérifier dans la console du navigateur :**
   - Ouvrir F12 > Console
   - Chercher : "✅ Document qualité ajouté avec succès"

## Avantages

✅ **Permanence** : Les données survivent au rafraîchissement du navigateur
✅ **Multi-utilisateurs** : Tous les utilisateurs voient les mêmes documents
✅ **Sécurité** : Les fichiers sont stockés sur le serveur
✅ **Performance** : Pas de limite de taille localStorage
✅ **Sauvegarde** : Un seul fichier à sauvegarder (dashboard.db)
