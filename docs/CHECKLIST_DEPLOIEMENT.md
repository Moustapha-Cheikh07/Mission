# Checklist de Déploiement - Dashboard Qualité Merlin Gerin

**Date de déploiement prévue** : _____________  
**Responsable IT** : _____________  
**Développeur** : _____________

---

## 📋 Ce Dont Vous Aurez Besoin le Jour J

### 1. 🖥️ Serveur / Machine Hôte

- [ ] **Accès au serveur** (login, mot de passe, ou accès physique)
- [ ] **Système d'exploitation** : Windows (7, 10, 11, ou Server)
- [ ] **Configuration minimale** :
  - RAM : 4 Go minimum (8 Go recommandé)
  - Disque : 500 Mo d'espace libre
  - Processeur : Tout processeur moderne suffit

### 2. 📦 Logiciels à Installer

- [ ] **Node.js** (version LTS - Long Term Support)
  - Téléchargement : https://nodejs.org/
  - Version recommandée : 18.x ou 20.x
  - ⚠️ **Important** : Cocher "Add to PATH" pendant l'installation

### 3. 📂 Fichier Excel SAP

- [ ] **Chemin d'accès** au fichier Excel généré par SAP
  - Exemple : `Z:\Production\Qualite\export_sap.xlsx`
  - OU : `\\SERVEUR-SAP\Partage\Qualite\export.xlsx`
  
- [ ] **Fréquence de mise à jour** du fichier
  - Quotidienne ? Horaire ? Temps réel ?
  
- [ ] **Permissions de lecture** pour le compte qui exécutera le serveur Node.js

### 4. 🌐 Configuration Réseau

- [ ] **Adresse IP fixe** pour le serveur (recommandé)
  - Exemple : `192.168.1.50`
  
- [ ] **Port réseau** : 3000 (par défaut)
  - OU un autre port si 3000 est déjà utilisé
  
- [ ] **Pare-feu** : Autoriser le port 3000 (ou le port choisi)
  
- [ ] **Accès réseau** : Les PC des opérateurs doivent pouvoir accéder au serveur

---

## 🚀 Étapes de Déploiement (Jour J)

### Étape 1 : Installation de Node.js (15 min)

```powershell
# Vérifier l'installation
node --version
npm --version
```

**Résultat attendu** : Affiche les numéros de version (ex: v20.11.0)

---

### Étape 2 : Copie des Fichiers (10 min)

1. Créer un dossier sur le serveur :
   ```
   C:\Apps\DashboardQualite\
   ```

2. Copier **tout le contenu** de votre projet dans ce dossier

3. Vérifier que la structure est correcte :
   ```
   C:\Apps\DashboardQualite\
   ├── index.html
   ├── server/
   ├── src/
   ├── assets/
   └── docs/
   ```

---

### Étape 3 : Configuration du Chemin Excel (5 min)

1. Ouvrir le fichier : `C:\Apps\DashboardQualite\server\server.js`

2. Modifier la ligne 15 avec le **vrai chemin** du fichier Excel SAP :
   ```javascript
   // AVANT (exemple)
   const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
   
   // APRÈS (avec le vrai chemin)
   const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\export_sap.xlsx';
   ```

3. **⚠️ Important** : Doubler tous les backslashes `\` → `\\`

---

### Étape 4 : Installation des Dépendances (5 min)

Ouvrir PowerShell ou CMD dans le dossier du projet :

```powershell
cd C:\Apps\DashboardQualite\server
npm install
```

**Résultat attendu** : Installation de 3 packages (express, cors, xlsx)

---

### Étape 5 : Test de Démarrage (5 min)

```powershell
node server.js
```

**Résultat attendu** :
```
🚀 Serveur démarré sur http://localhost:3000
📡 API disponible sur http://localhost:3000/api/data
🌐 Site web disponible sur http://localhost:3000
📊 Total lignes Excel: 171477
✅ Lignes 850MS filtrées: 3245
```

---

### Étape 6 : Test d'Accès depuis un Autre PC (10 min)

1. Sur un PC d'opérateur, ouvrir un navigateur

2. Aller à l'adresse : `http://[IP-DU-SERVEUR]:3000`
   - Exemple : `http://192.168.1.50:3000`

3. Vérifier que le dashboard s'affiche et que les données se chargent

---

### Étape 7 : Configuration pour Démarrage Automatique (Optionnel, 15 min)

Pour que le serveur redémarre automatiquement si le PC redémarre :

**Option A : Tâche Planifiée Windows**

1. Ouvrir "Planificateur de tâches"
2. Créer une tâche de base
3. Déclencheur : Au démarrage du système
4. Action : Démarrer un programme
5. Programme : `node`
6. Arguments : `C:\Apps\DashboardQualite\server\server.js`

**Option B : Service Windows avec PM2**

```powershell
npm install -g pm2
pm2 start C:\Apps\DashboardQualite\server\server.js --name "Dashboard-Qualite"
pm2 save
pm2 startup
```

---

## ✅ Checklist de Validation Finale

Avant de quitter le serveur, vérifier :

- [ ] Le serveur Node.js démarre sans erreur
- [ ] Le fichier Excel est bien lu (voir les logs)
- [ ] Le site est accessible depuis un autre PC du réseau
- [ ] Les données s'affichent correctement dans les graphiques
- [ ] Les filtres (machine, date, îlot) fonctionnent
- [ ] Le serveur redémarre automatiquement (si configuré)

---

## 📞 Questions à Poser au Responsable IT

### Questions Critiques

1. **Quel est le chemin exact du fichier Excel SAP ?**
   - Réponse : _________________________________

2. **À quelle fréquence le fichier est-il mis à jour ?**
   - Réponse : _________________________________

3. **Quelle est l'adresse IP du serveur ?**
   - Réponse : _________________________________

4. **Le serveur doit-il être accessible depuis l'extérieur de l'usine ?**
   - Réponse : Oui / Non

5. **Y a-t-il des restrictions de pare-feu ?**
   - Réponse : _________________________________

### Questions Optionnelles

6. **Faut-il un nom de domaine interne ?** (ex: `dashboard-qualite.local`)
   - Réponse : _________________________________

7. **Qui sera responsable de la maintenance du serveur ?**
   - Réponse : _________________________________

8. **Y a-t-il une procédure de sauvegarde à suivre ?**
   - Réponse : _________________________________

---

## 🆘 Dépannage Rapide

### Problème : Le serveur ne démarre pas

**Erreur** : `Cannot find module`
- **Solution** : Exécuter `npm install` dans le dossier `server/`

**Erreur** : `EADDRINUSE: address already in use`
- **Solution** : Le port 3000 est déjà utilisé. Changer le port dans `server.js` ligne 8

### Problème : Pas de données affichées

**Vérifier** :
1. Le fichier Excel existe au chemin configuré
2. Le serveur a les permissions de lecture
3. La console du navigateur (F12) pour voir les erreurs

### Problème : Site inaccessible depuis d'autres PC

**Vérifier** :
1. Le pare-feu autorise le port 3000
2. L'adresse IP est correcte
3. Les PC sont sur le même réseau

---

## 📚 Documents de Référence

- **Guide de déploiement complet** : `docs/guides/DEPLOYMENT_GUIDE.md`
- **Guide développeur** : `docs/DEVELOPER_GUIDE.md`
- **Résumé du projet** : `docs/PROJECT_SUMMARY.md`
- **Format des données Excel** : `docs/guides/EXCEL_IMPORT_GUIDE.md`

---

## 📝 Notes de Déploiement

Espace pour noter les informations spécifiques à votre installation :

**Chemin Excel SAP** :
```
_________________________________________________________________
```

**Adresse IP du serveur** :
```
_________________________________________________________________
```

**Port utilisé** :
```
_________________________________________________________________
```

**Compte utilisateur exécutant le serveur** :
```
_________________________________________________________________
```

**Remarques particulières** :
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Déploiement effectué le** : ___/___/______  
**Par** : _____________________  
**Validé par** : _____________________

✅ **Déploiement réussi**
