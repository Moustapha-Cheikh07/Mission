# 🚀 Guide d'Utilisation - Développement Local

## ✅ Configuration Terminée !

Votre projet est maintenant configuré pour fonctionner **automatiquement** en mode développement (localhost) ou production (serveur).

---

## 💻 Démarrer en Mode Développement (Votre Portable)

### Étape 1 : Ouvrir PowerShell

Naviguer vers le dossier du projet :
```powershell
cd C:\Users\DELL\Desktop\mssion
```

### Étape 2 : Démarrer le Serveur Backend

```powershell
cd backend
node server.js
```

**Vous verrez :**
```
🌍 Environment: development
============================================================
🚀 Server running on http://localhost:3000
📡 Accessible depuis le réseau local
🌐 URL Frontend: http://localhost:3000
📊 API Endpoint: http://localhost:3000/api
============================================================
```

### Étape 3 : Ouvrir le Navigateur

Ouvrir votre navigateur et aller sur :
```
http://localhost:3000/dashboard.html
```

**Toutes les pages fonctionnent automatiquement !**
- Dashboard: http://localhost:3000/dashboard.html
- Formulaires: http://localhost:3000/forms.html
- Documents: http://localhost:3000/documents.html
- Formation: http://localhost:3000/training.html
- Îlots: http://localhost:3000/ilots/pm1.html

### Étape 4 : Développer et Tester

- Modifiez vos fichiers frontend ou backend
- Rafraîchissez le navigateur (F5) pour voir les changements frontend
- Redémarrez le serveur (Ctrl+C puis `node server.js`) pour les changements backend

### Étape 5 : Arrêter le Serveur

Dans PowerShell, appuyer sur :
```
Ctrl + C
```

---

## 🏢 Déployer sur le Serveur

### Méthode Simple (Copier-Coller)

1. **Arrêter le serveur local** (Ctrl+C)

2. **Copier le projet sur la clé USB** :
   - Copier tout le dossier `mssion` sur votre clé USB

   OU créer une archive :
   - Clic droit sur `mssion` → "Envoyer vers" → "Dossier compressé"
   - Copier `mssion.zip` sur la clé USB

3. **Sur le serveur** :
   - Copier les fichiers vers `C:\mssion`
   - Redémarrer l'application :
   ```powershell
   pm2 restart dashboard-qualite
   ```

4. **C'est tout !** L'application détecte automatiquement qu'elle est sur le serveur et utilise les bonnes URLs.

---

## 🎯 Comment Ça Marche ?

### Détection Automatique

L'application détecte automatiquement l'environnement :

**Sur localhost (votre portable) :**
- Hostname = `localhost`
- URLs API = `http://localhost:3000/api/...`

**Sur le serveur :**
- Hostname = `10.192.14.223`
- URLs API = `http://10.192.14.223:1880/api/...`

### Fichiers Modifiés

Voici les fichiers qui ont été mis à jour pour supporter le multi-environnement :

✅ **Frontend :**
- `frontend/src/config.js` (NOUVEAU - détection automatique)
- `frontend/dashboard.html`
- `frontend/documents.html`
- `frontend/forms.html`
- `frontend/training.html`
- `frontend/ilots/pm1.html`
- `frontend/ilots/pm2.html`
- `frontend/ilots/bz1.html`
- `frontend/ilots/bz2.html`
- `frontend/ilots/grm.html`
- `frontend/src/modules/data-connector.js`
- `frontend/src/modules/server-sync.js`
- `frontend/src/modules/fiche-etoile.js`
- `frontend/src/modules/training.js`

✅ **Backend :**
- `backend/server.js`

---

## 🔍 Vérifications

### Comment Savoir Dans Quel Environnement Je Suis ?

**Ouvrir la console du navigateur** (F12) et regarder les logs :

**En développement (localhost) :**
```
🌍 Configuration détectée:
   Environnement: DÉVELOPPEMENT (localhost)
   API Base URL: http://localhost:3000
```

**En production (serveur) :**
```
🌍 Configuration détectée:
   Environnement: PRODUCTION (serveur)
   API Base URL: http://10.192.14.223:1880
```

---

## 📝 Workflow Quotidien Recommandé

### 1. Développement sur Votre Portable

```powershell
# Démarrer
cd C:\Users\DELL\Desktop\mssion\backend
node server.js

# Ouvrir http://localhost:3000/dashboard.html
# Développer et tester...

# Arrêter (Ctrl+C)
```

### 2. Tests Avant Déploiement

- ✅ Vérifier que toutes les pages fonctionnent
- ✅ Tester l'upload de documents
- ✅ Tester la création de fiches
- ✅ Vérifier qu'il n'y a pas d'erreurs dans la console (F12)

### 3. Déploiement

```powershell
# 1. Copier sur clé USB
# 2. Sur le serveur :
cd C:\mssion
pm2 restart dashboard-qualite

# 3. Vérifier sur http://10.192.14.223:1880
```

---

## 🆘 Dépannage

### Problème : "Cannot GET /"

**Solution :** Ajouter le nom du fichier HTML dans l'URL
```
# ❌ Incorrect
http://localhost:3000

# ✅ Correct
http://localhost:3000/dashboard.html
```

### Problème : "Erreur de connexion à l'API"

**Vérifications :**
1. Le serveur backend est-il démarré ? (`node server.js`)
2. Vérifier la console (F12) pour voir l'URL utilisée
3. Vérifier que le fichier `config.js` est bien chargé

### Problème : Le serveur ne démarre pas

**Solution :**
```powershell
# Vérifier que le port 3000 n'est pas utilisé
netstat -ano | findstr :3000

# Si utilisé, tuer le processus
# taskkill /PID <PID> /F
```

### Problème : Les changements ne sont pas visibles

**Solutions :**
- **Frontend** : Rafraîchir le navigateur (Ctrl+F5 pour vider le cache)
- **Backend** : Redémarrer le serveur (Ctrl+C puis `node server.js`)

---

## 💡 Astuces

### Raccourci pour Démarrer le Serveur

Créer un fichier `start-dev.bat` à la racine du projet :

```batch
@echo off
echo ================================================
echo   Demarrage du Serveur en Mode Developpement
echo ================================================
echo.
cd backend
node server.js
```

Double-cliquer sur `start-dev.bat` pour démarrer rapidement !

### Utiliser Nodemon pour le Redémarrage Automatique

Installer nodemon (optionnel) :
```powershell
npm install -g nodemon
```

Utiliser :
```powershell
cd backend
nodemon server.js
```

Le serveur redémarre automatiquement à chaque modification !

---

## 📊 Résumé des URLs

| Environnement | URL Base | Port |
|---------------|----------|------|
| **Développement** | http://localhost:3000 | 3000 |
| **Production** | http://10.192.14.223:1880 | 1880 |

**Le même code fonctionne partout !** 🎉

---

## ✅ Checklist

### Avant de Développer
- [ ] Naviguer vers `C:\Users\DELL\Desktop\mssion\backend`
- [ ] Démarrer le serveur : `node server.js`
- [ ] Ouvrir http://localhost:3000/dashboard.html
- [ ] Vérifier les logs dans la console (F12)

### Avant de Déployer
- [ ] Tester toutes les fonctionnalités en local
- [ ] Vérifier qu'il n'y a pas d'erreurs console
- [ ] Arrêter le serveur local (Ctrl+C)
- [ ] Copier les fichiers sur la clé USB
- [ ] Déployer sur le serveur
- [ ] Redémarrer : `pm2 restart dashboard-qualite`
- [ ] Tester sur http://10.192.14.223:1880

---

**Bon développement ! 🚀**
