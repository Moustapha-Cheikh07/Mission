# 🚀 Démarrage Rapide - Migration MySQL

## ⚠️ IMPORTANT : Configuration MySQL Requise

Avant de démarrer le serveur, vous devez configurer MySQL.

## Option 1 : Utiliser XAMPP (Recommandé pour Windows)

### Étape 1 : Installer XAMPP
1. Téléchargez XAMPP : https://www.apachefriends.org/
2. Installez XAMPP
3. Lancez le XAMPP Control Panel

### Étape 2 : Démarrer MySQL
1. Dans XAMPP Control Panel, cliquez sur "Start" pour MySQL
2. Le module MySQL devrait afficher "Running" en vert

### Étape 3 : Configurer le mot de passe
Par défaut, XAMPP n'a pas de mot de passe pour root.

**Fichier à modifier : `server/config/db.config.js`**

```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',  // ← Laissez vide pour XAMPP par défaut
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

### Étape 4 : Tester la connexion
```bash
cd server
node test-mysql.js
```

Si tout est OK, vous verrez : ✅ ✅ ✅ Tous les tests réussis!

### Étape 5 : Démarrer le serveur
```bash
node server.js
```

## Option 2 : MySQL Standalone

### Étape 1 : Installer MySQL
1. Téléchargez MySQL : https://dev.mysql.com/downloads/mysql/
2. Pendant l'installation, notez le mot de passe root que vous définissez

### Étape 2 : Démarrer MySQL Service
```bash
# Windows
net start MySQL80

# Ou via Services Windows
services.msc → MySQL → Démarrer
```

### Étape 3 : Configurer les identifiants

**Fichier : `server/config/db.config.js`**

```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'VOTRE_MOT_DE_PASSE_ICI',  // ← Mettez votre mot de passe
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

### Étape 4 : Tester et démarrer
```bash
cd server
node test-mysql.js
node server.js
```

## 🎯 Ce qui a changé

### ✅ Avant (SQLite - localStorage)
- ❌ Fiches stockées dans le navigateur (localStorage)
- ❌ Données perdues si cache navigateur effacé
- ❌ Pas de synchronisation entre utilisateurs

### ✅ Maintenant (MySQL - Base de données)
- ✅ Fiches stockées dans une vraie base de données MySQL
- ✅ Données persistantes et sécurisées
- ✅ Synchronisation automatique entre tous les utilisateurs
- ✅ Backend et frontend communiquent via API REST

## 📊 Vérification des données

### Via MySQL Command Line
```bash
mysql -u root -p
```

```sql
USE merlin_gerin_dashboard;
SHOW TABLES;
SELECT * FROM fiche_etoile;
```

### Via phpMyAdmin (si XAMPP)
1. Ouvrez http://localhost/phpmyadmin
2. Cliquez sur "merlin_gerin_dashboard"
3. Cliquez sur "fiche_etoile"
4. Vous verrez toutes les fiches enregistrées!

## 🔧 Dépannage

### MySQL ne démarre pas
- Vérifiez qu'aucun autre programme n'utilise le port 3306
- Vérifiez les logs MySQL dans XAMPP

### Erreur "Access denied"
- Vérifiez le mot de passe dans `config/db.config.js`
- Pour XAMPP, le mot de passe est vide par défaut

### Les fiches n'apparaissent pas
1. Vérifiez que le serveur Node.js est démarré : `node server.js`
2. Vérifiez que MySQL est démarré
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Vérifiez que l'API répond : http://localhost:3000/api/fiches-etoile

## 📝 Notes

- L'ancien fichier SQLite `database/dashboard.db` n'est plus utilisé
- Les nouvelles fiches seront stockées dans MySQL
- Le frontend communique maintenant avec le serveur via HTTP
