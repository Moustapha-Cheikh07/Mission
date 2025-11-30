const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database schema
async function initDatabase() {
    try {
        const connection = await pool.getConnection();

        console.log('📊 MySQL Database connected successfully');

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

        // Table for fiche etoile (forms)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fiche_etoile (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference VARCHAR(100) NOT NULL,
                emetteur VARCHAR(100) NOT NULL,
                date_fabrication VARCHAR(50) NOT NULL,
                date VARCHAR(50) NOT NULL,
                quantite INT NOT NULL,
                avis_qualite VARCHAR(100),
                description TEXT NOT NULL,
                actions TEXT NOT NULL,
                delai VARCHAR(50) NOT NULL,
                status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                INDEX idx_reference (reference),
                INDEX idx_emetteur (emetteur),
                INDEX idx_created_at (created_at),
                INDEX idx_status (status),
                INDEX idx_priority (priority),
                FULLTEXT idx_search (reference, description, actions)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        connection.release();
        console.log('✅ MySQL Database tables initialized');

    } catch (error) {
        console.error('❌ Error initializing MySQL database:', error);
        throw error;
    }
}

// Initialize database on module load
initDatabase();

// Export database functions
module.exports = {
    pool,

    // Quality Documents
    addQualityDocument: async (doc) => {
        const [result] = await pool.query(
            `INSERT INTO quality_documents (title, category, machine, description, filename, filepath, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [doc.title, doc.category, doc.machine, doc.description, doc.filename, doc.filepath, doc.uploaded_by]
        );
        return { lastID: result.insertId, changes: result.affectedRows };
    },

    getQualityDocuments: async () => {
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

    // Fiche Etoile
    addFicheEtoile: async (fiche) => {
        const [result] = await pool.query(
            `INSERT INTO fiche_etoile (reference, emetteur, date_fabrication, date, quantite, avis_qualite, description, actions, delai, status, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fiche.reference,
                fiche.emetteur,
                fiche.date_fabrication,
                fiche.date,
                fiche.quantite,
                fiche.avis_qualite,
                fiche.description,
                fiche.actions,
                fiche.delai,
                fiche.status || 'pending',
                fiche.priority || 'medium'
            ]
        );
        return { lastID: result.insertId, changes: result.affectedRows };
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
        if (fiche.emetteur !== undefined) {
            fields.push('emetteur = ?');
            values.push(fiche.emetteur);
        }
        if (fiche.date_fabrication !== undefined) {
            fields.push('date_fabrication = ?');
            values.push(fiche.date_fabrication);
        }
        if (fiche.date !== undefined) {
            fields.push('date = ?');
            values.push(fiche.date);
        }
        if (fiche.quantite !== undefined) {
            fields.push('quantite = ?');
            values.push(fiche.quantite);
        }
        if (fiche.avis_qualite !== undefined) {
            fields.push('avis_qualite = ?');
            values.push(fiche.avis_qualite);
        }
        if (fiche.description !== undefined) {
            fields.push('description = ?');
            values.push(fiche.description);
        }
        if (fiche.actions !== undefined) {
            fields.push('actions = ?');
            values.push(fiche.actions);
        }
        if (fiche.delai !== undefined) {
            fields.push('delai = ?');
            values.push(fiche.delai);
        }
        if (fiche.status !== undefined) {
            fields.push('status = ?');
            values.push(fiche.status);
            // Si le statut passe à 'completed', mettre à jour completed_at
            if (fiche.status === 'completed') {
                fields.push('completed_at = CURRENT_TIMESTAMP');
            }
        }
        if (fiche.priority !== undefined) {
            fields.push('priority = ?');
            values.push(fiche.priority);
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

    // Fonctions supplémentaires pour fiche_etoile
    getFichesEtoileByStatus: async (status) => {
        const [rows] = await pool.query(
            'SELECT * FROM fiche_etoile WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        return rows;
    },

    getFichesEtoileByPriority: async (priority) => {
        const [rows] = await pool.query(
            'SELECT * FROM fiche_etoile WHERE priority = ? ORDER BY created_at DESC',
            [priority]
        );
        return rows;
    },

    searchFichesEtoile: async (searchTerm) => {
        const [rows] = await pool.query(
            `SELECT * FROM fiche_etoile
             WHERE MATCH(reference, description, actions) AGAINST(? IN NATURAL LANGUAGE MODE)
             ORDER BY created_at DESC`,
            [searchTerm]
        );
        return rows;
    },

    // Close database connection
    close: async () => {
        try {
            await pool.end();
            console.log('✅ MySQL Database connection closed');
        } catch (error) {
            console.error('❌ Error closing MySQL database:', error);
        }
    }
};
