# Configuration MySQL pour Merlin Gerin Dashboard

## Prérequis

1. **Installer MySQL Server**
   - Télécharger depuis : https://dev.mysql.com/downloads/mysql/
   - Ou installer via XAMPP/WAMP qui inclut MySQL

2. **Vérifier que MySQL est en cours d'exécution**
   ```bash
   # Windows - Vérifier le service MySQL
   net start MySQL

   # Ou via XAMPP Control Panel
   # Démarrer le module MySQL
   ```

## Configuration de la Base de Données

### Méthode 1 : Configuration Automatique (Recommandée)

Le serveur Node.js créera automatiquement la base de données et les tables au démarrage.

1. **Configurer les identifiants MySQL**

   Éditez le fichier `server/config/db.config.js` :

   ```javascript
   module.exports = {
       host: 'localhost',
       user: 'root',           // Votre utilisateur MySQL
       password: '',           // Votre mot de passe MySQL
       database: 'merlin_gerin_dashboard',
       port: 3306,
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   };
   ```

2. **Démarrer le serveur**
   ```bash
   cd server
   node server.js
   ```

   Les tables seront créées automatiquement !

### Méthode 2 : Configuration Manuelle

Si vous préférez créer la base de données manuellement :

1. **Se connecter à MySQL**
   ```bash
   mysql -u root -p
   ```

2. **Exécuter le script de configuration**
   ```bash
   source server/setup-mysql.sql
   ```

   Ou copiez-collez le contenu du fichier dans MySQL Workbench.

## Structure de la Base de Données

### Tables créées :

1. **quality_documents** - Documents qualité
   - id, title, category, machine, description, filename, filepath, uploaded_by, uploaded_at

2. **training_documents** - Documents de formation
   - id, title, category, description, filename, filepath, uploaded_by, uploaded_at

3. **fiche_etoile** - Fiches étoiles (produits défectueux)
   - id, reference, emetteur, date_fabrication, date, quantite, avis_qualite, description, actions, delai, created_at

## Vérification

Pour vérifier que tout fonctionne :

1. **Vérifier la connexion**
   ```bash
   mysql -u root -p
   USE merlin_gerin_dashboard;
   SHOW TABLES;
   ```

2. **Voir les données**
   ```sql
   SELECT * FROM fiche_etoile;
   ```

## Dépannage

### Erreur : "Access denied for user"
- Vérifiez le mot de passe dans `config/db.config.js`
- Assurez-vous que l'utilisateur MySQL a les droits nécessaires

### Erreur : "Cannot connect to MySQL server"
- Vérifiez que MySQL est démarré
- Vérifiez le port (par défaut 3306)
- Vérifiez le firewall

### Erreur : "ER_NOT_SUPPORTED_AUTH_MODE"
- MySQL 8+ utilise un nouveau système d'authentification
- Solution :
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'votre_mot_de_passe';
  FLUSH PRIVILEGES;
  ```

## Migration depuis SQLite

Les anciennes données SQLite sont dans `server/database/dashboard.db`.

Pour migrer les données (si nécessaire) :
1. Exportez depuis SQLite
2. Importez dans MySQL
3. Les nouvelles données seront automatiquement dans MySQL

## API Endpoints

- **GET** `/api/fiches-etoile` - Récupérer toutes les fiches
- **POST** `/api/fiches-etoile` - Créer une nouvelle fiche
- **DELETE** `/api/fiches-etoile/:id` - Supprimer une fiche

Les fiches sont maintenant stockées dans MySQL au lieu de localStorage !
