# 📘 Guide Complet de Déploiement - Dashboard Qualité Merlin Gerin

## 🎯 Vue d'ensemble

Ce guide vous accompagne depuis la préparation de la clé USB jusqu'à la mise en production complète de l'application sur le serveur **10.192.14.223:1880**.

---

## 📦 ÉTAPE 1 : Préparation de la Clé USB

### 1.1 Sur votre Poste de Développement

1. **Ouvrir l'Explorateur Windows** et naviguer vers le dossier du projet:
   ```
   C:\Users\DELL\Desktop\mssion
   ```

2. **Créer une archive du projet** (Optionnel mais recommandé):
   - Clic droit sur le dossier `mssion`
   - Sélectionner "Envoyer vers" → "Dossier compressé"
   - Nommer l'archive: `dashboard-qualite.zip`

3. **Insérer votre clé USB** dans l'ordinateur

4. **Copier le projet sur la clé USB**:

   **Option A - Copier l'archive (Recommandé):**
   - Copier `dashboard-qualite.zip` sur la clé USB
   - ✅ Plus rapide, moins de risque d'erreur

   **Option B - Copier le dossier directement:**
   - Copier tout le dossier `mssion` sur la clé USB
   - ⚠️ Peut prendre plus de temps

5. **Vérifier la copie**:
   - Ouvrir la clé USB
   - Vérifier que le fichier/dossier est bien présent
   - Vérifier la taille (environ 50-100 MB)

6. **Éjecter la clé USB en toute sécurité**:
   - Clic droit sur l'icône de la clé USB dans la barre des tâches
   - "Éjecter" ou "Retirer en toute sécurité"
   - Attendre le message "Vous pouvez retirer le périphérique en toute sécurité"

---

## 💻 ÉTAPE 2 : Installation sur le Serveur

### 2.1 Prérequis du Serveur

Avant de commencer, assurez-vous que le serveur dispose de:

1. **Windows Server** (ou Windows 10/11)
2. **Accès administrateur**
3. **Connexion Internet** (pour installer Node.js et les dépendances)
4. **IP fixe configurée**: 10.192.14.223

### 2.2 Transfert du Projet

1. **Se connecter au serveur** avec un compte administrateur

2. **Insérer la clé USB** dans le serveur

3. **Créer le dossier de destination** (ou utiliser un emplacement de votre choix):

   **Option A - Copier directement le dossier `mssion`:**
   - Copier tout le dossier `mssion` depuis la clé USB vers `C:\`
   - Vous aurez: `C:\mssion\`
   - ✅ **Recommandé** - Plus simple et rapide

   **Option B - Renommer en `dashboard-qualite`:**
   - Créer `C:\dashboard-qualite`
   - Copier le contenu de `mssion` vers `C:\dashboard-qualite`
   - Optionnel, juste pour avoir un nom plus explicite

   ⚠️ **Important:** Dans ce guide, nous utiliserons `C:\mssion` comme exemple.
   Si vous choisissez un autre nom/emplacement, adaptez les commandes en conséquence.

4. **Vérifier la structure**:
   ```
   C:\mssion\
   ├── backend\
   ├── frontend\
   ├── ecosystem.config.js
   ├── .env.production
   ├── DEPLOIEMENT.md
   ├── GUIDE_DEPLOIEMENT_COMPLET.md
   ├── restart-server.bat
   └── backup.ps1
   ```

6. **Éjecter la clé USB en toute sécurité**

---

## 🔧 ÉTAPE 3 : Installation de Node.js

### 3.1 Télécharger Node.js

1. **Ouvrir un navigateur** sur le serveur

2. **Aller sur le site officiel**:
   ```
   https://nodejs.org/
   ```

3. **Télécharger la version LTS** (Long Term Support):
   - Cliquer sur le bouton "LTS" (version recommandée)
   - Exemple: Node.js 18.x.x LTS ou 20.x.x LTS
   - Le fichier se nomme: `node-vXX.XX.XX-x64.msi`

### 3.2 Installer Node.js

1. **Exécuter l'installateur**:
   - Double-cliquer sur le fichier `.msi` téléchargé
   - Cliquer sur "Next"

2. **Accepter la licence**:
   - Cocher "I accept the terms..."
   - Cliquer sur "Next"

3. **Choisir le dossier d'installation**:
   - Laisser le chemin par défaut: `C:\Program Files\nodejs\`
   - Cliquer sur "Next"

4. **Sélectionner les composants**:
   - ✅ Cocher "Node.js runtime"
   - ✅ Cocher "npm package manager"
   - ✅ Cocher "Add to PATH"
   - Cliquer sur "Next"

5. **Tools for Native Modules**:
   - ✅ Cocher "Automatically install the necessary tools"
   - Cliquer sur "Next"

6. **Installer**:
   - Cliquer sur "Install"
   - Attendre la fin de l'installation (2-5 minutes)
   - Cliquer sur "Finish"

7. **Redémarrer l'ordinateur** (si demandé)

### 3.3 Vérifier l'Installation

1. **Ouvrir PowerShell** (en tant qu'Administrateur):
   - Touche Windows + X
   - Sélectionner "Windows PowerShell (Admin)"

2. **Vérifier Node.js**:
   ```powershell
   node --version
   ```
   Résultat attendu: `v18.x.x` ou `v20.x.x`

3. **Vérifier npm**:
   ```powershell
   npm --version
   ```
   Résultat attendu: `9.x.x` ou `10.x.x`

---

## 📚 ÉTAPE 4 : Installation des Dépendances

### 4.1 Naviguer vers le Projet

```powershell
cd C:\mssion
```

### 4.2 Installer les Dépendances du Backend

```powershell
cd backend
npm install
```

**Ce que vous allez voir:**
- Téléchargement des packages...
- Installation de express, multer, xlsx, etc.
- Création du dossier `node_modules`
- Durée: 2-5 minutes

**Vérifier l'installation:**
```powershell
dir node_modules
```
Vous devez voir plusieurs dossiers de packages installés.

### 4.3 Retourner au Dossier Racine

```powershell
cd ..
```
(Vous êtes maintenant dans `C:\mssion`)

---

## 🌐 ÉTAPE 5 : Configuration du Pare-feu Windows

### 5.1 Ouvrir le Pare-feu Windows

1. **Touche Windows + R**
2. Taper: `wf.msc`
3. Appuyer sur "Entrée"

### 5.2 Créer une Règle de Trafic Entrant

1. Dans le panneau de gauche, cliquer sur **"Règles de trafic entrant"**

2. Dans le panneau de droite, cliquer sur **"Nouvelle règle..."**

3. **Type de règle**:
   - Sélectionner "Port"
   - Cliquer sur "Suivant"

4. **Protocole et ports**:
   - Sélectionner "TCP"
   - Sélectionner "Ports locaux spécifiques"
   - Taper: `1880`
   - Cliquer sur "Suivant"

5. **Action**:
   - Sélectionner "Autoriser la connexion"
   - Cliquer sur "Suivant"

6. **Profil**:
   - ✅ Cocher "Domaine"
   - ✅ Cocher "Privé"
   - ✅ Cocher "Public"
   - Cliquer sur "Suivant"

7. **Nom**:
   - Nom: `Dashboard Qualité - Port 1880`
   - Description: `Application Dashboard Qualité Merlin Gerin`
   - Cliquer sur "Terminer"

### 5.3 Vérifier la Règle (Optionnel)

**Via PowerShell:**
```powershell
Get-NetFirewallRule -DisplayName "Dashboard Qualité - Port 1880"
```

---

## 🚀 ÉTAPE 6 : Installation et Configuration de PM2

### 6.1 Installer PM2 Globalement

```powershell
npm install -g pm2
```

**Durée:** 1-2 minutes

### 6.2 Vérifier l'Installation

```powershell
pm2 --version
```
Résultat attendu: `5.x.x`

### 6.3 Créer le Dossier Logs

```powershell
New-Item -Path "C:\mssion\logs" -ItemType Directory
```

---

## ▶️ ÉTAPE 7 : Démarrage de l'Application

### 7.1 Vérifier la Configuration

**Vérifier le fichier .env.production:**
```powershell
cat .env.production
```

Vous devez voir:
```
HOST=10.192.14.223
PORT=1880
EXCEL_FILE_PATH=sap_export.xlsx
NODE_ENV=production
```

### 7.2 Démarrer l'Application avec PM2

```powershell
pm2 start ecosystem.config.js --env production
```

**Ce que vous allez voir:**
```
[PM2] Spawning PM2 daemon with pm2_home=...
[PM2] PM2 Successfully daemonized
[PM2] Starting C:\dashboard-qualite\backend\server.js in fork_mode (1 instance)
[PM2] Done.
```

### 7.3 Vérifier le Statut

```powershell
pm2 status
```

**Résultat attendu:**
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name                 │ mode    │ ↺      │ status   │ cpu    │
├─────┼──────────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ dashboard-qualite    │ fork    │ 0      │ online   │ 0%     │
└─────┴──────────────────────┴─────────┴─────────┴──────────┴────────┘
```

✅ **Status doit être "online"**

### 7.4 Voir les Logs

```powershell
pm2 logs dashboard-qualite --lines 20
```

**Vous devriez voir:**
```
============================================================
🚀 Server running on http://10.192.14.223:1880
📡 Accessible depuis le réseau local
🌐 URL Frontend: http://10.192.14.223:1880
📊 API Endpoint: http://10.192.14.223:1880/api
============================================================
```

### 7.5 Configurer le Démarrage Automatique

**Sauvegarder la configuration PM2:**
```powershell
pm2 save
```

**Configurer le démarrage automatique au boot:**
```powershell
pm2 startup
```

⚠️ **IMPORTANT:** PM2 va vous donner une commande à exécuter. Copiez-la et exécutez-la.

Exemple de commande générée:
```powershell
pm2 startup windows -u VotreNomUtilisateur --hp C:\Users\VotreNomUtilisateur
```

**Puis sauvegarder à nouveau:**
```powershell
pm2 save
```

---

## ✅ ÉTAPE 8 : Tests et Validation

### 8.1 Test Local sur le Serveur

1. **Ouvrir un navigateur** sur le serveur

2. **Tester l'accès local**:
   ```
   http://localhost:1880/dashboard.html
   ```

3. **Vérifier que la page se charge correctement**

### 8.2 Test depuis un Autre Poste du Réseau

1. **Sur un autre ordinateur du réseau**, ouvrir un navigateur

2. **Accéder à l'application**:
   ```
   http://10.192.14.223:1880/dashboard.html
   ```

3. **Vérifier l'accès aux différentes pages**:
   - ✅ Dashboard: http://10.192.14.223:1880/dashboard.html
   - ✅ Formulaires: http://10.192.14.223:1880/forms.html
   - ✅ Documents: http://10.192.14.223:1880/documents.html
   - ✅ Formation: http://10.192.14.223:1880/training.html
   - ✅ Îlot PM1: http://10.192.14.223:1880/ilots/pm1.html

### 8.3 Test des Fonctionnalités

1. **Test Upload de Document**:
   - Aller sur http://10.192.14.223:1880/documents.html
   - Cliquer sur "Ajouter un document"
   - Uploader un fichier PDF de test
   - Vérifier que le document apparaît dans la liste

2. **Test Consultation de Document**:
   - Cliquer sur "Consulter" sur un document
   - Vérifier que le PDF s'affiche correctement

3. **Test Création de Fiche**:
   - Aller sur http://10.192.14.223:1880/forms.html
   - Créer une fiche de non-conformité de test
   - Vérifier qu'elle se sauvegarde correctement

### 8.4 Test de Connectivité Réseau

**Depuis PowerShell sur un autre poste:**
```powershell
Test-NetConnection -ComputerName 10.192.14.223 -Port 1880
```

**Résultat attendu:**
```
ComputerName     : 10.192.14.223
RemoteAddress    : 10.192.14.223
RemotePort       : 1880
InterfaceAlias   : Ethernet
SourceAddress    : 10.192.14.x
TcpTestSucceeded : True
```

✅ **TcpTestSucceeded doit être True**

---

## 🔄 ÉTAPE 9 : Configuration du Fichier Excel (Optionnel)

### 9.1 Localiser le Fichier Excel SAP

1. **Identifier le chemin réseau** du fichier Excel SAP d'export

Exemples possibles:
- `\\SERVEUR-SAP\Partage\sap_export.xlsx`
- `C:\Data\SAP\sap_export.xlsx`
- `Z:\SAP\sap_export.xlsx`

### 9.2 Mettre à Jour le Chemin

1. **Ouvrir le fichier .env.production**:
   ```powershell
   notepad .env.production
   ```

2. **Modifier la ligne EXCEL_FILE_PATH**:
   ```env
   EXCEL_FILE_PATH=\\SERVEUR-SAP\Partage\sap_export.xlsx
   ```

3. **Sauvegarder et fermer**

### 9.3 Redémarrer l'Application

```powershell
pm2 restart dashboard-qualite
```

### 9.4 Vérifier les Logs

```powershell
pm2 logs dashboard-qualite --lines 50
```

Chercher des messages comme:
- ✅ "Excel file loaded successfully"
- ❌ "Error reading Excel file" (si erreur)

---

## 📊 ÉTAPE 10 : Monitoring et Maintenance

### 10.1 Commandes PM2 Utiles

**Voir le statut:**
```powershell
pm2 status
```

**Voir les logs en temps réel:**
```powershell
pm2 logs dashboard-qualite
```

**Redémarrer l'application:**
```powershell
pm2 restart dashboard-qualite
```

**Arrêter l'application:**
```powershell
pm2 stop dashboard-qualite
```

**Voir les informations détaillées:**
```powershell
pm2 show dashboard-qualite
```

**Monitoring en temps réel:**
```powershell
pm2 monit
```

### 10.2 Utilisation du Script restart-server.bat

**Double-cliquer sur** `restart-server.bat` pour redémarrer rapidement l'application.

### 10.3 Vérifier l'Utilisation des Ressources

```powershell
pm2 monit
```

Surveiller:
- CPU usage (devrait être < 10% au repos)
- Memory (devrait être < 500 MB)

---

## 🆘 DÉPANNAGE

### Problème 1: "pm2 n'est pas reconnu..."

**Solution:**
```powershell
npm install -g pm2
```

### Problème 2: L'application ne démarre pas

**Vérifications:**
```powershell
# Vérifier que le port n'est pas utilisé
netstat -ano | findstr :1880

# Voir les erreurs
pm2 logs dashboard-qualite --err
```

### Problème 3: Impossible d'accéder depuis le réseau

**Vérifications:**
1. Vérifier le pare-feu:
   ```powershell
   Get-NetFirewallRule -DisplayName "*Dashboard*"
   ```

2. Tester la connectivité:
   ```powershell
   Test-NetConnection -ComputerName 10.192.14.223 -Port 1880
   ```

3. Vérifier l'IP du serveur:
   ```powershell
   ipconfig
   ```

### Problème 4: Erreur "Cannot find module..."

**Solution:**
```powershell
cd C:\mssion\backend
npm install
cd ..
pm2 restart dashboard-qualite
```

### Problème 5: Fichier Excel introuvable

**Vérifications:**
```powershell
# Vérifier le chemin dans la config
cat .env.production

# Tester l'accès au fichier
Test-Path "C:\chemin\vers\sap_export.xlsx"
```

---

## ✅ CHECKLIST FINALE DE DÉPLOIEMENT

### Avant de Quitter le Serveur

- [ ] Node.js installé et version vérifiée
- [ ] Dépendances npm installées (`node_modules` existe)
- [ ] PM2 installé globalement
- [ ] Pare-feu configuré (port 1880 ouvert)
- [ ] Application démarrée avec PM2
- [ ] Status PM2 = "online"
- [ ] Démarrage automatique configuré (`pm2 startup` + `pm2 save`)
- [ ] Test local réussi (http://localhost:1880)
- [ ] Logs ne montrent pas d'erreurs critiques
- [ ] Dossier `logs/` créé

### Tests depuis le Réseau

- [ ] Accès réseau testé depuis un autre poste
- [ ] Dashboard accessible
- [ ] Pages îlots accessibles
- [ ] Upload de document fonctionne
- [ ] Consultation de document fonctionne
- [ ] Création de fiche fonctionne

### Documentation

- [ ] Chemin Excel documenté (si configuré)
- [ ] IP et port notés: 10.192.14.223:1880
- [ ] Guide DEPLOIEMENT.md disponible
- [ ] Utilisateurs informés de la nouvelle URL

---

## 📞 CONTACTS ET SUPPORT

### En Cas de Problème

1. **Consulter les logs:**
   ```powershell
   pm2 logs dashboard-qualite --lines 100
   ```

2. **Redémarrer l'application:**
   ```powershell
   pm2 restart dashboard-qualite
   ```

3. **Collecter les informations de diagnostic:**
   ```powershell
   pm2 logs dashboard-qualite --lines 500 > logs-erreur.txt
   pm2 status > pm2-status.txt
   systeminfo > system-info.txt
   ipconfig /all > network-config.txt
   ```

---

## 🎉 FÉLICITATIONS !

Votre Dashboard Qualité Merlin Gerin est maintenant déployé et opérationnel !

### URLs à Partager avec les Utilisateurs:

📊 **Dashboard Principal:**
```
http://10.192.14.223:1880/dashboard.html
```

📝 **Formulaires de Non-Conformité:**
```
http://10.192.14.223:1880/forms.html
```

📄 **Documents Qualité:**
```
http://10.192.14.223:1880/documents.html
```

🎓 **Formation:**
```
http://10.192.14.223:1880/training.html
```

🏭 **Dashboards Îlots:**
- PM1: http://10.192.14.223:1880/ilots/pm1.html
- PM2: http://10.192.14.223:1880/ilots/pm2.html
- BZ1: http://10.192.14.223:1880/ilots/bz1.html
- BZ2: http://10.192.14.223:1880/ilots/bz2.html
- GRM: http://10.192.14.223:1880/ilots/grm.html

---

**Date de déploiement:** _______________

**Déployé par:** _______________

**Version:** 1.0.0
