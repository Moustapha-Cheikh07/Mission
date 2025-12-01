const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

// Create connection pool with lazy initialization
let pool = null;
let isConnected = false;

// Initialize database schema with retry logic
async function initDatabase() {
    const hosts = ['localhost', '127.0.0.1', '::1'];

    for (const host of hosts) {
        try {
            console.log(`📊 Attempting MySQL connection to ${host}...`);

            const testConfig = { ...dbConfig, host, connectTimeout: 5000 };
            const testPool = mysql.createPool(testConfig);
            const connection = await testPool.getConnection();

            console.log(`✅ MySQL Database connected successfully via ${host}`);

            // Create database if it doesn't exist
            await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
            await connection.query(`USE ${dbConfig.database}`);

            // Table for quality documents
            await connection.query(`
                CREATE TABLE IF NOT EXISTS quality_documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    machine VARCHAR(100) NOT NULL,
                    description TEXT,
                    filename VARCHAR(255) NOT NULL,
                    filepath VARCHAR(500) NOT NULL,
                    uploaded_by VARCHAR(100),
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_machine (machine),
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Table for training documents
            await connection.query(`
                CREATE TABLE IF NOT EXISTS training_documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    filename VARCHAR(255) NOT NULL,
                    filepath VARCHAR(500) NOT NULL,
                    uploaded_by VARCHAR(100),
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Table for fiche etoile (Déclaration de Non-Conformité Production)
            await connection.query(`
                CREATE TABLE IF NOT EXISTS fiche_etoile (
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

            connection.release();
            console.log('✅ MySQL Database tables initialized');

            // Success! Use this pool
            pool = testPool;
            isConnected = true;
            return;

        } catch (error) {
            console.error(`❌ Failed to connect via ${host}:`, error.message);
            // Try next host
        }
    }

    // All hosts failed
    console.error('❌ Error initializing MySQL database: All connection attempts failed');
    console.warn('⚠️  Running in limited mode without database features.');
}

// Initialize database on module load
const dbInitPromise = initDatabase();

// Export database functions
module.exports = {
    // Export the init promise so server.js can wait for it
    ready: dbInitPromise,

    get pool() {
        if (!pool) {
            throw new Error('Database not connected');
        }
        return pool;
    },
    isConnected: () => isConnected,

    // Quality Documents
    addQualityDocument: async (doc) => {
        try {
            if (!pool || !isConnected) {
                throw new Error('Database not connected');
            }
            const [result] = await pool.query(
                `INSERT INTO quality_documents (title, category, machine, description, filename, filepath, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [doc.title, doc.category, doc.machine, doc.description, doc.filename, doc.filepath, doc.uploaded_by]
            );
            return { lastID: result.insertId, changes: result.affectedRows };
        } catch (error) {
            console.error('Database error:', error.message);
            throw new Error('Database unavailable');
        }
    },

    getQualityDocuments: async () => {
        if (!pool || !isConnected) {
            throw new Error('Database not connected');
        }
        const [rows] = await pool.query('SELECT * FROM quality_documents ORDER BY uploaded_at DESC');
        return rows;
    },

    getQualityDocumentsByMachine: async (machine) => {
        const [rows] = await pool.query(
            'SELECT * FROM quality_documents WHERE machine = ? ORDER BY uploaded_at DESC',
            [machine]
        );
        return rows;
    },

    deleteQualityDocument: async (id) => {
        const [result] = await pool.query('DELETE FROM quality_documents WHERE id = ?', [id]);
        return { changes: result.affectedRows };
    },

    // Training Documents
    addTrainingDocument: async (doc) => {
        const [result] = await pool.query(
            `INSERT INTO training_documents (title, category, description, filename, filepath, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [doc.title, doc.category, doc.description, doc.filename, doc.filepath, doc.uploaded_by]
        );
        return { lastID: result.insertId, changes: result.affectedRows };
    },

    getTrainingDocuments: async () => {
        const [rows] = await pool.query('SELECT * FROM training_documents ORDER BY uploaded_at DESC');
        return rows;
    },

    deleteTrainingDocument: async (id) => {
        const [result] = await pool.query('DELETE FROM training_documents WHERE id = ?', [id]);
        return { changes: result.affectedRows };
    },

    // Fiche Etoile - Génération du numéro NNCP unique
    generateNumeroNNCP: async () => {
        const year = new Date().getFullYear();
        const prefix = `NNCP-${year}-`;

        // Trouver le dernier numéro de l'année en cours
        const [rows] = await pool.query(
            `SELECT numero_nncp FROM fiche_etoile
             WHERE numero_nncp LIKE ?
             ORDER BY numero_nncp DESC LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNumber = 1;
        if (rows.length > 0) {
            const lastNumero = rows[0].numero_nncp;
            const lastNumber = parseInt(lastNumero.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        // Format: NNCP-YYYY-XX (avec padding à 2 chiffres)
        return `${prefix}${String(nextNumber).padStart(2, '0')}`;
    },

    // Fiche Etoile - Créer une nouvelle fiche
    addFicheEtoile: async (fiche) => {
        const [result] = await pool.query(
            `INSERT INTO fiche_etoile (
                numero_nncp, reference, libelle, quantite, prix_unitaire,
                date_production, operateur, probleme, decision_49ms, status
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fiche.numero_nncp,
                fiche.reference,
                fiche.libelle,
                fiche.quantite,
                fiche.prix_unitaire,
                fiche.date_production,
                fiche.operateur || 'Non spécifié',
                fiche.probleme || 'Non spécifié',
                fiche.decision_49ms || false,
                fiche.status || 'pending'
            ]
        );
        return { lastID: result.insertId, changes: result.affectedRows, numero_nncp: fiche.numero_nncp };
    },

    getFichesEtoile: async () => {
        const [rows] = await pool.query('SELECT * FROM fiche_etoile ORDER BY created_at DESC');
        return rows;
    },

    getFicheEtoileById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM fiche_etoile WHERE id = ?', [id]);
        return rows[0];
    },

    updateFicheEtoile: async (id, fiche) => {
        const fields = [];
        const values = [];

        if (fiche.reference !== undefined) {
            fields.push('reference = ?');
            values.push(fiche.reference);
        }
        if (fiche.libelle !== undefined) {
            fields.push('libelle = ?');
            values.push(fiche.libelle);
        }
        if (fiche.quantite !== undefined) {
            fields.push('quantite = ?');
            values.push(fiche.quantite);
        }
        if (fiche.prix_unitaire !== undefined) {
            fields.push('prix_unitaire = ?');
            values.push(fiche.prix_unitaire);
        }
        if (fiche.date_production !== undefined) {
            fields.push('date_production = ?');
            values.push(fiche.date_production);
        }
        if (fiche.operateur !== undefined) {
            fields.push('operateur = ?');
            values.push(fiche.operateur);
        }
        if (fiche.probleme !== undefined) {
            fields.push('probleme = ?');
            values.push(fiche.probleme);
        }
        if (fiche.decision_49ms !== undefined) {
            fields.push('decision_49ms = ?');
            values.push(fiche.decision_49ms);
        }
        if (fiche.status !== undefined) {
            fields.push('status = ?');
            values.push(fiche.status);
            if (fiche.status === 'completed') {
                fields.push('completed_at = CURRENT_TIMESTAMP');
            }
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id);
        const [result] = await pool.query(
            `UPDATE fiche_etoile SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return { changes: result.affectedRows };
    },

    deleteFicheEtoile: async (id) => {
        const [result] = await pool.query('DELETE FROM fiche_etoile WHERE id = ?', [id]);
        return { changes: result.affectedRows };
    },

    getFichesEtoileByStatus: async (status) => {
        const [rows] = await pool.query(
            'SELECT * FROM fiche_etoile WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        return rows;
    },

    searchFichesEtoile: async (searchTerm) => {
        const [rows] = await pool.query(
            `SELECT * FROM fiche_etoile
             WHERE MATCH(reference, libelle, probleme) AGAINST(? IN NATURAL LANGUAGE MODE)
             OR numero_nncp LIKE ?
             ORDER BY created_at DESC`,
            [searchTerm, `%${searchTerm}%`]
        );
        return rows;
    },

    // Récupérer une fiche par numéro NNCP
    getFicheEtoileByNumero: async (numero_nncp) => {
        const [rows] = await pool.query('SELECT * FROM fiche_etoile WHERE numero_nncp = ?', [numero_nncp]);
        return rows[0];
    },

    close: async () => {
        try {
            if (pool) {
                await pool.end();
                console.log('✅ MySQL Database connection closed');
            }
        } catch (error) {
            console.error('❌ Error closing MySQL database:', error);
        }
    }
};
