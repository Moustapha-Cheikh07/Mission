# 📋 Guide d'Utilisation des Scripts SQL

## 📁 Scripts Disponibles

### 1. **init-database.sql** (Script Complet) ⭐ RECOMMANDÉ
- **Contenu**: Initialisation complète avec toutes les tables, vues, procédures et triggers
- **Tables**: 8 tables principales
- **Extras**: Vues, procédures stockées, triggers, index optimisés
- **Utilisation**: Pour une installation complète et professionnelle

### 2. **init-database-simple.sql** (Script Simplifié)
- **Contenu**: Seulement les 3 tables essentielles
- **Tables**: quality_documents, training_documents, fiche_etoile
- **Utilisation**: Pour démarrage rapide et simple

### 3. **setup-mysql.sql** (Script Basique)
- **Contenu**: Création de la base de données uniquement
- **Utilisation**: Si vous voulez que Node.js crée les tables automatiquement

---

## 🚀 Méthode 1 : Via MySQL Command Line (Recommandé)

### Étape 1 : Ouvrir MySQL
```bash
mysql -u root -p
```
Entrez votre mot de passe MySQL (vide pour XAMPP)

### Étape 2 : Exécuter le Script

**Option A : Script Complet**
```sql
source C:/Users/DELL/Desktop/mssion/server/init-database.sql
```

**Option B : Script Simplifié**
```sql
source C:/Users/DELL/Desktop/mssion/server/init-database-simple.sql
```

### Étape 3 : Vérifier
```sql
USE merlin_gerin_dashboard;
SHOW TABLES;
```

Vous devriez voir toutes les tables créées ! ✅

---

## 🚀 Méthode 2 : Via phpMyAdmin (XAMPP)

### Étape 1 : Ouvrir phpMyAdmin
```
http://localhost/phpmyadmin
```

### Étape 2 : Importer le Script

1. Cliquez sur l'onglet **"SQL"** en haut
2. Cliquez sur **"Choisir un fichier"**
3. Sélectionnez :
   - `init-database.sql` (complet) OU
   - `init-database-simple.sql` (simple)
4. Cliquez sur **"Exécuter"**

### Étape 3 : Vérifier

1. Cliquez sur **"merlin_gerin_dashboard"** dans la liste à gauche
2. Vous devriez voir toutes les tables ! ✅

---

## 🚀 Méthode 3 : Via MySQL Workbench

### Étape 1 : Ouvrir MySQL Workbench
- Créez une connexion à localhost:3306
- Connectez-vous

### Étape 2 : Ouvrir le Script
1. Menu **"File"** → **"Open SQL Script"**
2. Sélectionnez `init-database.sql`

### Étape 3 : Exécuter
1. Cliquez sur l'icône **⚡ Execute** (éclair)
2. Attendez la fin de l'exécution

### Étape 4 : Rafraîchir
- Menu **"Database"** → **"Refresh All"**
- Vous verrez la base de données et les tables ! ✅

---

## 🚀 Méthode 4 : Script Automatique (Nouveau)

J'ai créé un script batch pour Windows :

### Exécuter le Script
```bash
cd server
setup-database.bat
```

Ce script :
1. Vérifie si MySQL tourne
2. Exécute automatiquement le script SQL
3. Affiche le résultat

---

## 📊 Contenu du Script Complet (init-database.sql)

### Tables Créées (8)

1. **users** - Gestion des utilisateurs
   - Colonnes: id, username, full_name, email, password_hash, role, is_active, last_login, created_at, updated_at

2. **quality_documents** - Documents qualité
   - Colonnes: id, title, category, machine, description, filename, filepath, file_size, file_type, uploaded_by, uploaded_at, downloads, views, is_archived

3. **training_documents** - Documents formation
   - Colonnes: id, title, category, description, filename, filepath, file_size, file_type, uploaded_by, uploaded_at, downloads, views, is_archived

4. **fiche_etoile** - Fiches étoile (produits défectueux)
   - Colonnes: id, reference, emetteur, date_fabrication, date, quantite, avis_qualite, description, actions, delai, status, priority, created_at, updated_at, completed_at

5. **quality_results** - Résultats contrôles qualité
   - Colonnes: id, date, line, reference, status, operator, notes, created_at

6. **quality_rejects** - Rebuts/rejets qualité
   - Colonnes: id, date, machine, workcenter, material, description, scrap_quantity, unit_price, total_cost, reason, reason_details, operator, ilot, is_analyzed, created_at

7. **recent_activities** - Activités récentes
   - Colonnes: id, activity_type, title, description, icon, user, related_id, related_type, created_at

8. **system_config** - Configuration système
   - Colonnes: id, config_key, config_value, description, data_type, is_editable, updated_by, updated_at

### Vues Créées (4)

1. **v_fiche_etoile_stats** - Statistiques fiches par statut
2. **v_top_machines_rejects** - Top 10 machines avec plus de rebuts
3. **v_recent_activities_7days** - Activités 7 derniers jours
4. **v_popular_quality_docs** - Documents les plus consultés

### Procédures Stockées (3)

1. **sp_archive_old_documents**(days) - Archive documents anciens
2. **sp_cleanup_old_activities**(days) - Nettoie vieilles activités
3. **sp_get_production_stats**(start_date, end_date) - Stats production

### Triggers (2)

1. **tr_fiche_etoile_insert** - Log création fiche étoile
2. **tr_quality_doc_insert** - Log upload document qualité

### Données Initiales

- 3 utilisateurs admin (l.lalot, a.boulenger, admin)
- 8 configurations système par défaut

---

## 📋 Contenu du Script Simplifié (init-database-simple.sql)

### Tables Créées (3)

1. **quality_documents** - Documents qualité (version simplifiée)
2. **training_documents** - Documents formation (version simplifiée)
3. **fiche_etoile** - Fiches étoile (version simplifiée)

Pas de vues, pas de procédures, pas de triggers.
Parfait pour démarrer rapidement !

---

## ✅ Vérification Après Installation

### Test 1 : Vérifier les Tables
```sql
USE merlin_gerin_dashboard;
SHOW TABLES;
```

**Résultat attendu** (script complet) :
```
+------------------------------------+
| Tables_in_merlin_gerin_dashboard   |
+------------------------------------+
| fiche_etoile                       |
| quality_documents                  |
| quality_rejects                    |
| quality_results                    |
| recent_activities                  |
| system_config                      |
| training_documents                 |
| users                              |
+------------------------------------+
```

### Test 2 : Vérifier les Données
```sql
SELECT * FROM users;
SELECT * FROM system_config;
```

### Test 3 : Tester les Vues (script complet uniquement)
```sql
SELECT * FROM v_fiche_etoile_stats;
```

### Test 4 : Tester une Procédure (script complet uniquement)
```sql
CALL sp_get_production_stats('2025-01-01', '2025-12-31');
```

---

## 🔄 Réinitialiser la Base de Données

Si vous voulez tout recommencer :

### Méthode 1 : Via SQL
```sql
DROP DATABASE merlin_gerin_dashboard;
-- Puis ré-exécutez le script init-database.sql
```

### Méthode 2 : Le script le fait automatiquement
Le script `init-database.sql` supprime et recrée toutes les tables.
Il suffit de le ré-exécuter.

---

## ⚙️ Personnalisation

### Modifier les Utilisateurs par Défaut

Éditez la section "INSERTION DES DONNÉES INITIALES" :

```sql
INSERT INTO users (username, full_name, email, password_hash, role) VALUES
('votre.nom', 'Votre Nom', 'votre.email@merlin-gerin.fr', '$2a$10$dummy_hash', 'admin');
```

### Modifier la Configuration

Éditez les valeurs dans `system_config` :

```sql
INSERT INTO system_config (config_key, config_value, ...) VALUES
('cache_refresh_time', '04:00', ...),  -- Changez l'heure ici
...
```

---

## 🆘 Dépannage

### Erreur : "Access denied"
- Vérifiez vos identifiants MySQL
- Pour XAMPP, utilisez : `mysql -u root` (sans -p)

### Erreur : "Database exists"
- C'est normal ! Le script utilise `CREATE DATABASE IF NOT EXISTS`
- Ou utilisez `DROP DATABASE` avant si vous voulez recommencer

### Erreur : "Unknown command"
- Vérifiez le chemin du fichier
- Utilisez des slashes `/` au lieu de backslashes `\`
- Exemple : `C:/Users/...` et pas `C:\Users\...`

### Les Triggers ne se créent pas
- Vérifiez que vous avez les droits TRIGGER
- Pour XAMPP, c'est normalement OK

---

## 📝 Après Installation

### 1. Mettre à Jour database-mysql.js

Le fichier `server/database-mysql.js` est déjà configuré pour les 3 tables principales.

Si vous utilisez le **script complet**, vous pouvez ajouter les fonctions pour les nouvelles tables.

### 2. Configurer db.config.js

```javascript
module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',  // Votre mot de passe MySQL
    database: 'merlin_gerin_dashboard',
    port: 3306,
    ...
};
```

### 3. Démarrer le Serveur

```bash
cd server
node server.js
```

Le serveur se connectera à MySQL et tout fonctionnera ! ✅

---

## 🎯 Récapitulatif Rapide

```bash
# 1. Démarrez MySQL (XAMPP)
# 2. Ouvrez MySQL
mysql -u root -p

# 3. Exécutez le script
source C:/Users/DELL/Desktop/mssion/server/init-database.sql

# 4. Vérifiez
USE merlin_gerin_dashboard;
SHOW TABLES;

# 5. Quittez MySQL
exit;

# 6. Démarrez le serveur Node.js
cd server
node server.js

# 7. Testez l'application
# http://localhost:3000
```

C'est tout ! 🎉

---

## 📚 Prochaines Étapes

1. ✅ Base de données initialisée
2. ✅ Tables créées
3. → Envoyer une fiche de test
4. → Vérifier dans phpMyAdmin
5. → Profiter de l'application !

---

## 💡 Conseils

- **Utilisez le script complet** pour une application professionnelle
- **Sauvegardez régulièrement** votre base de données
- **Consultez les vues** pour des statistiques rapides
- **Utilisez les procédures** pour automatiser des tâches

Bon travail ! 🚀
