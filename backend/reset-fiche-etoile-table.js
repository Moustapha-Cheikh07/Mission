const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

async function resetFicheEtoileTable() {
    const hosts = ['localhost', '127.0.0.1', '::1'];

    for (const host of hosts) {
        try {
            console.log(`📊 Connexion à MySQL via ${host}...`);

            const config = { ...dbConfig, host, connectTimeout: 5000 };
            const connection = await mysql.createConnection(config);

            console.log(`✅ Connecté à MySQL via ${host}`);

            // Utiliser la base de données
            await connection.query(`USE ${dbConfig.database}`);

            // Supprimer la table si elle existe
            console.log('🗑️  Suppression de l\'ancienne table fiche_etoile...');
            await connection.query('DROP TABLE IF EXISTS fiche_etoile');
            console.log('✅ Table supprimée');

            // Recréer la table avec le bon schéma
            console.log('📝 Création de la nouvelle table fiche_etoile...');
            await connection.query(`
                CREATE TABLE fiche_etoile (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    numero_nncp VARCHAR(50) UNIQUE NOT NULL COMMENT 'Numéro unique NNCP-YYYY-XX',

                    -- Zone Production
                    reference VARCHAR(100) NOT NULL COMMENT 'MATERIAL from Excel (850MS only)',
                    libelle TEXT NOT NULL COMMENT 'DESIGNATION from Excel',
                    quantite INT NOT NULL,
                    prix_unitaire DECIMAL(10,5) NOT NULL COMMENT 'Prix UNIT from Excel',
                    prix_total DECIMAL(12,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
                    date_production DATE NOT NULL,
                    operateur VARCHAR(100) DEFAULT 'Non spécifié',
                    probleme TEXT COMMENT 'Description du problème',

                    -- Décision Qualité
                    decision_49ms BOOLEAN DEFAULT FALSE COMMENT 'Case à cocher 49MS',

                    -- Statut et suivi
                    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'En attente de décision, En cours, Terminé, Annulé',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL,

                    -- Index pour performance
                    INDEX idx_numero_nncp (numero_nncp),
                    INDEX idx_reference (reference),
                    INDEX idx_date_production (date_production),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at),
                    FULLTEXT idx_search (reference, libelle, probleme)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Table fiche_etoile créée avec succès!');

            await connection.end();
            console.log('\n✨ Réinitialisation terminée avec succès!\n');
            process.exit(0);

        } catch (error) {
            console.error(`❌ Erreur avec ${host}:`, error.message);
            // Essayer le prochain host
        }
    }

    console.error('❌ Impossible de se connecter à MySQL avec tous les hosts');
    process.exit(1);
}

resetFicheEtoileTable();
