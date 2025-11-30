# ❓ Questions Fréquemment Posées (FAQ)

---

## 🚀 Installation & Démarrage

### Q: Quelle version de Node.js dois-je installer ?

**R:** Version **16.x ou supérieure** (LTS recommandée)

Vérifier votre version :
```bash
node --version
```

Télécharger : https://nodejs.org/

---

### Q: Le serveur ne démarre pas, erreur "Port 3000 already in use"

**R:** Le port 3000 est déjà utilisé par une autre application.

**Solutions** :

1. **Trouver et arrêter l'application** :
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Changer le port** dans `server/server.js` ligne 10 :
   ```javascript
   const PORT = 8080;  // Nouveau port
   ```

---

### Q: Erreur "Cannot find module 'express'" ou similaire

**R:** Les dépendances Node.js ne sont pas installées.

**Solution** :
```bash
cd server
npm install
```

---

## 📁 Fichier Excel

### Q: Erreur "Fichier Excel non trouvé"

**R:** Le chemin du fichier Excel est incorrect.

**Vérifier** :
1. Le fichier existe : `dir server\data\sap_export.xlsx` (Windows) ou `ls server/data/sap_export.xlsx` (Linux)
2. Le chemin dans `server/server.js` ligne 20 est correct

**Solution** :
```javascript
// Vérifier que le chemin pointe vers le bon fichier
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
```

---

### Q: Le fichier Excel est sur un serveur réseau, comment faire ?

**R:** Modifier le chemin dans `server/server.js` ligne 20

**Exemples** :
```javascript
// Lecteur mappé Windows
const EXCEL_FILE_PATH = 'Z:\\Production\\Qualite\\sap_export.xlsx';

// UNC path Windows
const EXCEL_FILE_PATH = '\\\\SERVEUR-SAP\\Exports\\sap_export.xlsx';

// Linux (montage CIFS)
const EXCEL_FILE_PATH = '/mnt/sap-exports/sap_export.xlsx';
```

Voir [02-CONFIGURATION.md](02-CONFIGURATION.md) pour plus de détails.

---

### Q: Combien de lignes le fichier Excel peut-il contenir ?

**R:** **Illimité** en théorie. Testé avec succès jusqu'à 200 000 lignes.

**Performance** :
- 10 000 lignes = ~1 seconde
- 100 000 lignes = ~3-5 secondes
- 200 000 lignes = ~8-10 secondes

---

### Q: Les données ne s'actualisent pas

**R:** Plusieurs causes possibles :

1. **Actualisation automatique désactivée** :
   - Vérifier `src/modules/data-connector.js` ligne 6 : `autoRefresh: true`

2. **Intervalle trop long** :
   - Modifier `refreshInterval` ligne 7 (en millisecondes)

3. **Fichier Excel non modifié** :
   - Le système lit la date de modification du fichier

**Solution rapide** : Cliquer sur le bouton "Rafraîchir" dans l'interface

---

## 📊 Données & Affichage

### Q: Aucune donnée n'apparaît dans "Analyse Production"

**R:** Les données de production nécessitent la colonne `QTE PROD APP` ou `production quantity`.

**Vérifier** :
1. Le fichier Excel contient cette colonne
2. Les valeurs ne sont pas nulles ou 0
3. Les machines commencent bien par "850MS"

---

### Q: Affichage de 22 machines au lieu de 24

**R:** Ce problème a été corrigé. Les machines sont maintenant chargées dynamiquement.

**Vérifier** :
- Fichier `src/modules/production.js` doit contenir la fonction `getAllMSMachines()` modifiée
- Redémarrer le serveur : `pm2 restart dashboard-qualite`

---

### Q: Les prix sont incorrects (trop élevés)

**R:** Problème de format décimal (virgule vs point).

**Corrigé dans** : `src/modules/data-connector.js` ligne 141-147

Le système convertit automatiquement les virgules en points.

---

## 🔐 Authentification

### Q: J'ai oublié le mot de passe admin

**R:** Modifier le fichier `src/core/auth.js`

```javascript
// Ligne ~5-10
const USERS = {
    admin: {
        password: 'admin123',  // Mot de passe par défaut
        role: 'admin'
    }
};
```

---

### Q: Comment ajouter un nouvel utilisateur ?

**R:** Éditer `src/core/auth.js`

```javascript
const USERS = {
    admin: { password: 'admin123', role: 'admin' },
    user1: { password: 'user123', role: 'user' },    // Existant
    user2: { password: 'newpass', role: 'user' }     // Nouveau
};
```

---

## 💾 Base de Données

### Q: Où sont stockés les documents et formulaires ?

**R:**
- **Base de données** : `server/database/dashboard.db` (métadonnées)
- **Fichiers** : `assets/documents/` et `assets/training/`

---

### Q: Les documents disparaissent après redémarrage

**R:** Ce problème est lié à l'utilisation de localStorage au lieu de la base de données.

**Solution** : Suivre le guide `docs/archive-ancien-systeme/SOLUTION_FINALE_DATABASE.md`

Ou attendre la mise à jour qui corrige automatiquement ce problème.

---

### Q: Comment sauvegarder la base de données ?

**R:** Copier le fichier `server/database/dashboard.db`

```bash
# Sauvegarde manuelle
cp server/database/dashboard.db backup/dashboard-$(date +%Y%m%d).db

# Sauvegarde automatique (Linux)
# Ajouter dans crontab :
0 2 * * * cp /path/to/server/database/dashboard.db /backup/dashboard-$(date +\%Y\%m\%d).db
```

---

## 🌐 Réseau & Déploiement

### Q: Comment accéder au dashboard depuis un autre PC ?

**R:** Utiliser l'adresse IP du serveur au lieu de `localhost`

**Exemple** :
- Sur le serveur : `http://localhost:3000`
- Depuis un autre PC : `http://192.168.1.100:3000`

**Trouver l'IP** :
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

---

### Q: Erreur "Failed to fetch" dans le navigateur

**R:** Le frontend ne peut pas atteindre le backend.

**Vérifier** :
1. Le serveur Node.js tourne : `pm2 list` ou vérifier la console
2. Les URLs dans `src/modules/data-connector.js` et `src/modules/server-sync.js` pointent vers la bonne adresse
3. Le pare-feu autorise le port 3000

---

### Q: Comment faire tourner le serveur en permanence ?

**R:** Utiliser PM2

```bash
# Installation
npm install -g pm2

# Démarrer
pm2 start server/server.js --name dashboard-qualite

# Démarrage automatique au boot
pm2 startup
pm2 save

# Voir les logs
pm2 logs dashboard-qualite
```

---

## 🎨 Interface & Utilisation

### Q: Comment changer le logo de l'entreprise ?

**R:** Remplacer le fichier `assets/images/logo.png`

Dimensions recommandées : 200x50 pixels (ou proportionnel)

---

### Q: L'interface est en anglais, comment la mettre en français ?

**R:** L'interface est déjà en français par défaut. Si ce n'est pas le cas, vérifier le fichier `index.html` et les modules dans `src/modules/`.

---

### Q: Comment personnaliser les couleurs ?

**R:** Éditer `assets/css/style.css`

Variables CSS principales (en haut du fichier) :
```css
:root {
    --primary-color: #0066cc;    /* Bleu principal */
    --secondary-color: #28a745;  /* Vert */
    --danger-color: #dc3545;     /* Rouge */
}
```

---

## 🐛 Erreurs Communes

### Q: "ERR_CONNECTION_REFUSED" dans le navigateur

**R:** Le serveur Node.js n'est pas démarré.

**Solution** :
```bash
cd server
node server.js
```

---

### Q: "SyntaxError: Unexpected token" dans la console

**R:** Fichier JavaScript corrompu ou incompatibilité de version.

**Solutions** :
1. Vider le cache du navigateur : Ctrl+Shift+Delete
2. Recharger avec Ctrl+F5
3. Vérifier la version Node.js : `node --version` (doit être 16+)

---

### Q: Les graphiques ne s'affichent pas

**R:** Problème de chargement de Chart.js

**Vérifier** :
1. Connexion Internet (Chart.js chargé depuis CDN)
2. Console navigateur (F12) pour voir les erreurs
3. Fichier `index.html` contient bien le script Chart.js

---

## 🔧 Performance

### Q: Le dashboard est lent

**R:** Plusieurs optimisations possibles :

1. **Réduire la fréquence d'actualisation** :
   ```javascript
   // src/modules/data-connector.js ligne 7
   refreshInterval: 600000  // 10 minutes au lieu de 5
   ```

2. **Limiter les données affichées** :
   - Filtrer par date (derniers 30 jours au lieu de tout)
   - Limiter le nombre de machines affichées

3. **Optimiser le fichier Excel** :
   - Supprimer les colonnes inutiles
   - Exporter seulement les données récentes

---

### Q: Le serveur consomme beaucoup de mémoire

**R:** Fichier Excel très volumineux chargé en mémoire.

**Solutions** :
1. Redémarrer le serveur régulièrement
2. Augmenter la mémoire Node.js :
   ```bash
   node --max-old-space-size=4096 server.js  # 4 GB
   ```

---

## 📞 Support

### Q: J'ai un problème non listé ici

**R:**

1. **Consulter les logs** :
   ```bash
   pm2 logs dashboard-qualite
   ```

2. **Console navigateur** (F12) → Onglet Console

3. **Vérifier les guides** :
   - [00-GUIDE-RAPIDE.md](00-GUIDE-RAPIDE.md)
   - [01-INSTALLATION.md](01-INSTALLATION.md)
   - [05-MAINTENANCE.md](05-MAINTENANCE.md)

4. **Contacter l'équipe IT** avec :
   - Description du problème
   - Message d'erreur complet
   - Captures d'écran
   - Version Node.js (`node --version`)

---

## 📚 Ressources Supplémentaires

- **Documentation Node.js** : https://nodejs.org/docs/
- **Documentation Express** : https://expressjs.com/
- **Documentation Chart.js** : https://www.chartjs.org/
- **Documentation SQLite** : https://www.sqlite.org/docs.html

---

**Cette FAQ est mise à jour régulièrement. Dernière mise à jour : 2025-01-26**
