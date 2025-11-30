# 🚀 Étapes pour Voir la Base de Données MySQL

## ⚠️ Vous devez d'abord configurer MySQL !

### Étape 1 : Installer et Démarrer MySQL

#### Option A : Avec XAMPP (RECOMMANDÉ) ✅

1. **Téléchargez XAMPP** : https://www.apachefriends.org/download.html
2. **Installez XAMPP** (acceptez les options par défaut)
3. **Lancez XAMPP Control Panel**
4. **Cliquez sur "Start"** pour le module **MySQL**
   - Vous devriez voir **MySQL** en **vert** avec le statut "Running"
   - Port affiché : **3306**

#### Option B : MySQL Standalone

1. Téléchargez MySQL : https://dev.mysql.com/downloads/mysql/
2. Installez et notez le mot de passe root
3. Démarrez le service MySQL

---

### Étape 2 : Configurer la Connexion

**Éditez le fichier** : `server/config/db.config.js`

#### Si vous utilisez XAMPP :
```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',  // ← VIDE pour XAMPP (pas de mot de passe par défaut)
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

#### Si vous utilisez MySQL standalone :
```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'VOTRE_MOT_DE_PASSE',  // ← Mettez votre mot de passe ici
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

---

### Étape 3 : Tester la Connexion

Dans le terminal :
```bash
cd server
node test-mysql.js
```

**Résultat attendu** :
```
✅ ✅ ✅ Tous les tests réussis! MySQL est prêt! ✅ ✅ ✅
```

**Si vous voyez une erreur** :
- ❌ "Access denied" → Vérifiez le mot de passe dans `db.config.js`
- ❌ "Cannot connect" → MySQL n'est pas démarré

---

### Étape 4 : Démarrer le Serveur

```bash
node server.js
```

**Résultat attendu** :
```
📊 MySQL Database connected successfully
✅ MySQL Database tables initialized
🚀 Serveur démarré sur http://localhost:3000
```

---

### Étape 5 : Envoyer une Fiche de Test

1. **Ouvrez** : http://localhost:3000/forms.html
2. **Remplissez** le formulaire "Fiche Étoile"
3. **Cliquez** sur "Envoyer"
4. **Vous devriez voir** : "Fiche Étoile enregistrée avec succès!"

---

### Étape 6 : Voir les Données

#### Méthode 1 : phpMyAdmin (XAMPP) 🎯 LE PLUS SIMPLE

1. **Ouvrez** : http://localhost/phpmyadmin
2. **Cliquez** sur `merlin_gerin_dashboard` (à gauche)
3. **Cliquez** sur `fiche_etoile`
4. **Vous verrez** toutes vos fiches ! 🎉

#### Méthode 2 : Script Node.js

```bash
cd server
node voir-fiches.js
```

Affiche les fiches dans le terminal.

#### Méthode 3 : MySQL Command Line

```bash
mysql -u root -p
```

Puis :
```sql
USE merlin_gerin_dashboard;
SELECT * FROM fiche_etoile;
```

#### Méthode 4 : MySQL Workbench

1. Installez MySQL Workbench
2. Créez une connexion à localhost:3306
3. Naviguez vers la base `merlin_gerin_dashboard`

---

## 🔍 Vérification Rapide

### Vérifier que MySQL tourne :

**Windows (XAMPP)** :
- Ouvrez XAMPP Control Panel
- MySQL doit être en **vert** "Running"

**Windows (Service)** :
```bash
sc query MySQL80
```

**Linux/Mac** :
```bash
sudo systemctl status mysql
```

### Vérifier que le serveur Node.js tourne :

Ouvrez : http://localhost:3000/health

Vous devriez voir :
```json
{"status":"ok","timestamp":"..."}
```

---

## ❓ Questions Fréquentes

### Q : Comment savoir si MySQL est installé ?

**XAMPP** : Vérifiez si vous avez le dossier `C:\xampp`

**Standalone** : Lancez `mysql --version` dans le terminal

### Q : J'ai oublié mon mot de passe MySQL

**XAMPP** : Par défaut, il n'y a PAS de mot de passe (laissez vide)

**Standalone** : Il faut le réinitialiser (voir doc MySQL)

### Q : Le port 3306 est déjà utilisé

Un autre programme utilise MySQL. Options :
1. Arrêtez l'autre MySQL
2. Changez le port dans `db.config.js` et XAMPP

### Q : La base de données n'existe pas

Le serveur Node.js la crée automatiquement au démarrage.
Lancez : `node server.js`

---

## 📸 Captures d'écran

### XAMPP Control Panel
```
Apache  [Start] [Stop]
MySQL   [Running] [Stop]  Port: 3306  ← Doit être vert
```

### phpMyAdmin
```
localhost/phpmyadmin
├── merlin_gerin_dashboard  ← Votre base
│   ├── fiche_etoile        ← Vos fiches
│   ├── quality_documents
│   └── training_documents
```

---

## ✅ Checklist de Démarrage

- [ ] MySQL installé (XAMPP ou standalone)
- [ ] MySQL démarré (vert dans XAMPP)
- [ ] `db.config.js` configuré avec le bon mot de passe
- [ ] `node test-mysql.js` → ✅ Tous les tests réussis
- [ ] `node server.js` → Serveur démarré
- [ ] Fiche envoyée depuis forms.html
- [ ] Fiche visible dans phpMyAdmin

---

## 🆘 Besoin d'Aide ?

1. Vérifiez les logs du serveur Node.js
2. Vérifiez les logs MySQL (XAMPP/logs/mysql_error.log)
3. Ouvrez la console du navigateur (F12)
4. Vérifiez que tous les services sont démarrés

---

## 🎯 Résumé Ultra-Rapide

```bash
# 1. Installez XAMPP
# 2. Démarrez MySQL dans XAMPP
# 3. Configurez db.config.js (password: '')
# 4. cd server
# 5. node test-mysql.js
# 6. node server.js
# 7. Ouvrez http://localhost/phpmyadmin
# 8. Base: merlin_gerin_dashboard → Table: fiche_etoile
```

Vous verrez vos fiches ! 🎉
