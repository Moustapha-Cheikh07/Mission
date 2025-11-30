# GUIDE DE DÉMARRAGE - Configuration MySQL

## Problème détecté

Le test de connexion a échoué avec l'erreur :
```
Access denied for user 'root'@'localhost' (using password: NO)
```

Cela signifie que MySQL nécessite une configuration.

## Étapes de configuration

### 1. Vérifier que MySQL est installé et démarré

**Windows:**
```bash
# Vérifier si MySQL est installé
mysql --version

# Démarrer MySQL (si installé comme service)
net start MySQL80
```

**Ligne de commande MySQL:**
```bash
# Se connecter à MySQL
mysql -u root -p
```

### 2. Configurer les credentials MySQL

**Option A: MySQL sans mot de passe (développement local)**

Éditez `config/db.config.js` :
```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',  // Laissez vide si pas de mot de passe
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

**Option B: MySQL avec mot de passe**

Éditez `config/db.config.js` :
```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'votre_mot_de_passe',  // Remplacez par votre mot de passe MySQL
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

### 3. Créer la base de données

**Méthode 1: Via MySQL Command Line**
```bash
mysql -u root -p
```

Puis dans MySQL:
```sql
CREATE DATABASE IF NOT EXISTS merlin_gerin_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE merlin_gerin_dashboard;

SOURCE init-database.sql;

-- Vérifier la création
SHOW TABLES;

-- Vérifier la structure de fiche_etoile
DESCRIBE fiche_etoile;

EXIT;
```

**Méthode 2: Exécuter le script d'initialisation (batch)**

Nous avons créé `setup-database.bat` pour vous :
```bash
setup-database.bat
```

### 4. Tester la connexion

```bash
node test-fiche-etoile.js
```

Si tout est configuré correctement, vous verrez :
```
✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!
```

### 5. Démarrer le serveur

```bash
node server.js
```

Le serveur créera automatiquement les tables si elles n'existent pas.

## Commandes utiles

### Vérifier les fiches dans la base de données

```bash
node voir-fiches.js
```

### Voir toutes les données (toutes les tables)

```bash
voir-donnees.bat
```

ou

```bash
node -e "const mysql = require('mysql2/promise'); const config = require('./config/db.config'); (async () => { const conn = await mysql.createConnection(config); const [tables] = await conn.query('SHOW TABLES'); for (const table of tables) { const tableName = Object.values(table)[0]; console.log(`\\n=== ${tableName} ===`); const [rows] = await conn.query('SELECT * FROM ' + tableName); console.table(rows); } await conn.end(); })()"
```

### Réinitialiser complètement la base de données

⚠️ **ATTENTION**: Cela supprime toutes les données !

```sql
mysql -u root -p

DROP DATABASE merlin_gerin_dashboard;
CREATE DATABASE merlin_gerin_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE merlin_gerin_dashboard;
SOURCE init-database.sql;
EXIT;
```

## Vérification de la configuration

### Test de connexion minimal

Créez un fichier `test-connexion.js` :
```javascript
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

async function testConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion MySQL réussie!');
        await connection.end();
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\\n💡 Vérifiez:');
        console.log('   1. MySQL est démarré');
        console.log('   2. config/db.config.js contient les bons credentials');
        console.log('   3. Le port MySQL est bien 3306');
    }
}

testConnection();
```

Exécutez :
```bash
node test-connexion.js
```

## Troubleshooting

### Erreur: "Access denied for user 'root'@'localhost'"

**Solutions:**
1. Vérifiez le mot de passe dans `config/db.config.js`
2. Réinitialisez le mot de passe root de MySQL
3. Créez un nouvel utilisateur MySQL dédié

### Erreur: "Can't connect to MySQL server on 'localhost'"

**Solutions:**
1. MySQL n'est pas démarré → `net start MySQL80`
2. Mauvais port → vérifiez le port dans `config/db.config.js`
3. MySQL n'est pas installé → installez MySQL

### Erreur: "Unknown database 'merlin_gerin_dashboard'"

**Solution:**
Créez la base de données :
```sql
CREATE DATABASE merlin_gerin_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Erreur: "Table 'fiche_etoile' doesn't exist"

**Solutions:**
1. Exécutez `init-database.sql`
2. Ou démarrez le serveur qui créera les tables automatiquement
3. Ou exécutez `setup-database.bat`

## Configuration pour production

Pour la production, créez un utilisateur MySQL dédié :

```sql
-- Se connecter en tant que root
mysql -u root -p

-- Créer un utilisateur dédié
CREATE USER 'merlin_gerin_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';

-- Donner les droits sur la base de données
GRANT ALL PRIVILEGES ON merlin_gerin_dashboard.* TO 'merlin_gerin_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

EXIT;
```

Puis modifiez `config/db.config.js` :
```javascript
module.exports = {
    host: 'localhost',
    user: 'merlin_gerin_user',
    password: 'mot_de_passe_securise',
    database: 'merlin_gerin_dashboard',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

## Points de contrôle

Avant de passer à l'étape suivante, vérifiez :

- ✅ MySQL est installé et démarré
- ✅ La base de données `merlin_gerin_dashboard` existe
- ✅ Les credentials dans `config/db.config.js` sont corrects
- ✅ `node test-connexion.js` fonctionne
- ✅ `node test-fiche-etoile.js` passe tous les tests
- ✅ `node server.js` démarre sans erreur

## Support

Si vous rencontrez des problèmes :
1. Lisez attentivement les messages d'erreur
2. Consultez ce guide
3. Vérifiez les logs MySQL
4. Testez la connexion étape par étape

---

**Prochaine étape**: Une fois MySQL configuré, exécutez `node server.js` pour démarrer l'application !
